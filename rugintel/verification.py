"""
RugIntel Ground Truth Verifier

Used by validators to verify miner predictions after 24 hours.
Cross-verifies from 3 independent sources:
    1. Solana RPC — LP removal, wallet movements
    2. RugCheck API — Token security status update
    3. DexScreener — Price drop, volume collapse

Validators use this to calculate miner accuracy scores,
which are then used to set_weights() on-chain for Yuma Consensus.
"""

import os
import time
import logging
from typing import Optional, Dict, Any

import aiohttp

logger = logging.getLogger(__name__)


class GroundTruthVerifier:
    """
    Verify whether rugpull predictions were correct after 24 hours.

    Used exclusively by validators. After 24h, check:
    - Did the token actually rugpull?
    - Was liquidity drained?
    - Were funds moved to a CEX?
    - Did price drop >90%?
    """

    # A rugpull is confirmed if price drops >90%
    RUGPULL_PRICE_DROP_THRESHOLD = -90.0  # percent

    # Liquidity drain threshold (>80% removed = drained)
    LP_DRAIN_THRESHOLD = 0.80

    DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex"
    RUGCHECK_BASE = "https://api.rugcheck.xyz/v1"

    def __init__(self):
        self.rpc_url = os.getenv(
            "SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com"
        )
        self.ground_truth_wait = int(
            os.getenv("GROUND_TRUTH_WAIT_HOURS", "24")
        )
        self._session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15)
            )
        return self._session

    async def check_24h_outcome(self, token_address: str,
                                 launch_timestamp: int) -> Optional[Dict[str, Any]]:
        """
        Check whether a token actually rugpulled within 24 hours.

        Returns:
            None if 24 hours have not yet passed.
            Dict with rugpull verification results otherwise.
        """
        now = int(time.time())
        elapsed_hours = (now - launch_timestamp) / 3600

        if elapsed_hours < self.ground_truth_wait:
            return None  # Not yet 24 hours

        session = await self._get_session()

        # Cross-verify from 3 sources
        solana_check = await self._check_solana_rpc(session, token_address)
        rugcheck_result = await self._check_rugcheck_api(session, token_address)
        dex_result = await self._check_dexscreener(session, token_address)

        # Determine if rugpull occurred
        is_rugpull = self._determine_rugpull(
            solana_check, rugcheck_result, dex_result
        )

        return {
            "is_rugpull": is_rugpull,
            "liquidity_drained": solana_check.get("lp_removed", False),
            "funds_moved_to_exchange": solana_check.get("cex_deposit", False),
            "price_drop_percent": dex_result.get("price_change_24h", 0),
            "volume_collapsed": dex_result.get("volume_collapsed", False),
            "rugcheck_status": rugcheck_result.get("status", "unknown"),
            "verification_sources": {
                "solana_rpc": solana_check,
                "rugcheck": rugcheck_result,
                "dexscreener": dex_result,
            },
            "verified_at": now,
            "hours_after_launch": round(elapsed_hours, 2),
        }

    def _determine_rugpull(self, solana: dict, rugcheck: dict,
                            dex: dict) -> bool:
        """
        Determine if a rugpull occurred based on cross-source evidence.

        A rugpull is confirmed if ANY of:
        1. Price dropped >90% (DexScreener)
        2. LP was fully removed (Solana RPC)
        3. RugCheck marks token as "rugpull" status
        """
        # Check price collapse
        price_drop = dex.get("price_change_24h", 0)
        if price_drop <= self.RUGPULL_PRICE_DROP_THRESHOLD:
            return True

        # Check LP drain
        if solana.get("lp_removed", False):
            return True

        # Check RugCheck status
        rugcheck_status = rugcheck.get("status", "").lower()
        if "rug" in rugcheck_status or "scam" in rugcheck_status:
            return True

        return False

    def calculate_accuracy(self, predicted_risk: float,
                            actual_rugpull: bool,
                            liquidity_drained: bool = False,
                            funds_moved: bool = False) -> float:
        """
        Calculate miner prediction accuracy.

        Scoring:
        - True positive (predicted rug, was rug): accuracy = predicted_risk
        - True negative (predicted safe, was safe): accuracy = 1.0 - predicted_risk
        - False positive penalty: predicted rug, was safe
        - False negative penalty: predicted safe, was rug

        Examples:
        - predicted 0.95, actually rugged → accuracy = 0.95 (excellent)
        - predicted 0.10, actually rugged → accuracy = 0.10 (terrible)
        - predicted 0.90, turned safe → accuracy = 0.10 (false positive)
        - predicted 0.05, turned safe → accuracy = 0.95 (excellent)
        """
        if actual_rugpull:
            # Higher risk score = better prediction
            base_accuracy = predicted_risk

            # Bonus for predicting severity
            if liquidity_drained and predicted_risk > 0.8:
                base_accuracy = min(base_accuracy + 0.05, 1.0)
            if funds_moved and predicted_risk > 0.9:
                base_accuracy = min(base_accuracy + 0.03, 1.0)
        else:
            # Lower risk score = better prediction (correctly identified safe)
            base_accuracy = 1.0 - predicted_risk

        return round(min(max(base_accuracy, 0.0), 1.0), 4)

    async def get_new_tokens(self, limit: int = 10) -> list:
        """
        Fetch recently launched tokens on Solana for analysis.

        Uses DexScreener's new pairs endpoint.
        """
        session = await self._get_session()

        try:
            url = f"{self.DEXSCREENER_BASE}/pairs/solana"
            async with session.get(url) as resp:
                if resp.status != 200:
                    return []

                data = await resp.json()

            pairs = data.get("pairs", [])

            # Filter to recently created pairs (last 1 hour)
            now_ms = int(time.time() * 1000)
            one_hour_ago_ms = now_ms - (3600 * 1000)

            new_tokens = []
            for pair in pairs[:50]:  # Check first 50
                created = pair.get("pairCreatedAt", 0)
                if created > one_hour_ago_ms:
                    base_token = pair.get("baseToken", {})
                    new_tokens.append({
                        "address": base_token.get("address", ""),
                        "name": base_token.get("name", ""),
                        "symbol": base_token.get("symbol", ""),
                        "timestamp": int(created / 1000),
                    })

            return new_tokens[:limit]

        except Exception as e:
            logger.error(f"Failed to get new tokens: {e}")
            return []

    async def _check_solana_rpc(self, session, token_address: str) -> dict:
        """Query Solana RPC for LP status and wallet movements."""
        try:
            # Check largest token accounts to see if LP was removed
            payload = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getTokenLargestAccounts",
                "params": [token_address],
            }

            async with session.post(
                self.rpc_url,
                json=payload,
                headers={"Content-Type": "application/json"},
            ) as resp:
                data = await resp.json()

            accounts = data.get("result", {}).get("value", [])

            if not accounts:
                return {"lp_removed": True, "cex_deposit": False}

            # If the largest account has been emptied, LP was removed
            largest = float(accounts[0].get("amount", "0")) if accounts else 0

            return {
                "lp_removed": largest == 0,
                "cex_deposit": False,  # Would need transaction analysis
                "largest_account_balance": largest,
            }

        except Exception as e:
            logger.error(f"Solana RPC check failed: {e}")
            return {"lp_removed": False, "cex_deposit": False, "error": str(e)}

    async def _check_rugcheck_api(self, session, token_address: str) -> dict:
        """Query RugCheck API for current token status."""
        try:
            url = f"{self.RUGCHECK_BASE}/tokens/{token_address}/report"
            async with session.get(url) as resp:
                if resp.status != 200:
                    return {"status": "unknown"}

                data = await resp.json()

            # Extract status and risks
            risks = data.get("risks", [])
            risk_names = [r.get("name", "") for r in risks]

            return {
                "status": "risky" if risks else "clean",
                "rugcheck_score": data.get("score", 50),
                "risks": risk_names[:5],
            }

        except Exception as e:
            logger.error(f"RugCheck check failed: {e}")
            return {"status": "unknown", "error": str(e)}

    async def _check_dexscreener(self, session, token_address: str) -> dict:
        """Query DexScreener for 24h price and volume changes."""
        try:
            url = f"{self.DEXSCREENER_BASE}/tokens/{token_address}"
            async with session.get(url) as resp:
                if resp.status != 200:
                    return {"price_change_24h": 0}

                data = await resp.json()

            pairs = data.get("pairs", [])
            if not pairs:
                return {
                    "price_change_24h": -100,  # Token delisted = likely rug
                    "volume_collapsed": True,
                }

            pair = pairs[0]
            price_change = float(
                pair.get("priceChange", {}).get("h24", 0) or 0
            )
            volume_24h = float(
                pair.get("volume", {}).get("h24", 0) or 0
            )

            return {
                "price_change_24h": price_change,
                "volume_24h": volume_24h,
                "volume_collapsed": volume_24h < 100,  # <$100 volume = dead
                "price_usd": float(pair.get("priceUsd", 0) or 0),
            }

        except Exception as e:
            logger.error(f"DexScreener check failed: {e}")
            return {"price_change_24h": 0, "error": str(e)}

    async def close(self):
        """Close HTTP session."""
        if self._session and not self._session.closed:
            await self._session.close()
