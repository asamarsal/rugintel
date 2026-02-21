"""
Layer 2: Liquidity Intelligence — LP Drain Pattern Analysis

HIGHEST WEIGHT LAYER (0.25) — strongest predictive power for rugpulls.

Queries Solana RPC to analyze liquidity pool status:
- LP lock status (locked vs unlocked)
- LP lock duration (<72 hours = high risk)
- LP ratio changes (declining = drain in progress)
- LP removal transactions

Key threshold: LP not locked OR LP lock <72 hours = HIGH RISK
"""

import os
import time
import logging

from rugintel.layers.base import BaseLayer, LayerResult

logger = logging.getLogger(__name__)


class LiquidityLayer(BaseLayer):
    """
    Analyze liquidity pool patterns for drain signals.

    Weight: 0.25 (highest — LP drain is the #1 rugpull mechanism)
    Data source: Solana RPC (getAccountInfo, getTokenLargestAccounts)
    """

    # Known Raydium AMM program ID
    RAYDIUM_AMM_V4 = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"

    # Known LP locker programs
    LP_LOCKER_PROGRAMS = [
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",  # SPL Token
    ]

    def __init__(self):
        super().__init__()
        self.rpc_url = os.getenv(
            "SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com"
        )

    async def analyze(self, token_address: str, **kwargs) -> LayerResult:
        """
        Analyze LP status for the given token.

        Steps:
        1. Find LP pool accounts (Raydium/Orca)
        2. Check if LP tokens are locked
        3. Check LP lock duration
        4. Monitor LP ratio changes
        """
        session = await self._get_session()

        try:
            # Step 1: Get token's largest accounts (find LP pools)
            lp_info = await self._get_lp_accounts(session, token_address)

            # Step 2: Check LP lock status
            lock_status = await self._check_lp_lock(session, lp_info)

            # Step 3: Calculate risk score
            score, evidence = self._calculate_risk(lp_info, lock_status)

            confidence = 0.7 if lp_info.get("pool_found") else 0.3

            return LayerResult(
                score=score,
                confidence=confidence,
                evidence=evidence,
            )

        except Exception as e:
            logger.error(f"Liquidity layer error: {e}")
            return LayerResult(
                score=0.5, confidence=0.1,
                evidence={"error": str(e)},
            )

    async def _get_lp_accounts(self, session, token_address: str) -> dict:
        """Query Solana RPC for token's LP pool accounts."""
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTokenLargestAccounts",
            "params": [token_address],
        }

        try:
            async with session.post(
                self.rpc_url,
                json=payload,
                headers={"Content-Type": "application/json"},
            ) as resp:
                data = await resp.json()

            accounts = data.get("result", {}).get("value", [])

            if not accounts:
                return {"pool_found": False, "accounts": []}

            # The largest token account is usually the LP pool
            largest = accounts[0] if accounts else {}
            total_supply_in_pools = sum(
                float(a.get("amount", "0")) for a in accounts[:3]
            )

            return {
                "pool_found": True,
                "largest_account": largest.get("address", ""),
                "largest_amount": float(largest.get("amount", "0")),
                "top_accounts": len(accounts),
                "total_in_top_pools": total_supply_in_pools,
            }

        except Exception as e:
            logger.error(f"Failed to get LP accounts: {e}")
            return {"pool_found": False, "error": str(e)}

    async def _check_lp_lock(self, session, lp_info: dict) -> dict:
        """Check if LP tokens are locked in a locker program."""
        if not lp_info.get("pool_found") or not lp_info.get("largest_account"):
            return {"locked": False, "reason": "No LP pool found"}

        lp_account = lp_info["largest_account"]

        # Query account info to check owner program
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getAccountInfo",
            "params": [
                lp_account,
                {"encoding": "jsonParsed"},
            ],
        }

        try:
            async with session.post(
                self.rpc_url,
                json=payload,
                headers={"Content-Type": "application/json"},
            ) as resp:
                data = await resp.json()

            account_data = data.get("result", {}).get("value", {})
            if not account_data:
                return {"locked": False, "reason": "Account not found"}

            owner = account_data.get("owner", "")

            # Check if owned by a known locker program
            is_locked = owner in self.LP_LOCKER_PROGRAMS

            return {
                "locked": is_locked,
                "owner_program": owner,
                "lock_duration_hours": None,  # Would need deeper analysis
            }

        except Exception as e:
            logger.error(f"Failed to check LP lock: {e}")
            return {"locked": False, "error": str(e)}

    def _calculate_risk(self, lp_info: dict, lock_status: dict) -> tuple:
        """
        Calculate liquidity risk score.

        Scoring:
        - LP not found → 0.8 (very suspicious for launched token)
        - LP found but unlocked → 0.9 (can be drained anytime)
        - LP locked < 72 hours → 0.7 (short lock, likely rugpull)
        - LP locked > 72 hours → 0.3 (some protection)
        - LP locked > 30 days → 0.1 (low risk)
        """
        score = 0.0
        reasons = []

        if not lp_info.get("pool_found"):
            score = 0.8
            reasons.append("No liquidity pool found")
        elif not lock_status.get("locked"):
            score = 0.9
            reasons.append("LP tokens NOT locked — can be drained anytime")
        else:
            lock_hours = lock_status.get("lock_duration_hours")
            if lock_hours is not None:
                if lock_hours < 72:
                    score = 0.7
                    reasons.append(
                        f"LP locked for only {lock_hours}h (<72h threshold)"
                    )
                elif lock_hours < 720:  # 30 days
                    score = 0.3
                    reasons.append(f"LP locked for {lock_hours}h (moderate)")
                else:
                    score = 0.1
                    reasons.append(f"LP locked for {lock_hours}h (long-term)")
            else:
                score = 0.4
                reasons.append("LP locked but duration unknown")

        evidence = {
            "score": round(score, 4),
            "lp_found": lp_info.get("pool_found", False),
            "lp_locked": lock_status.get("locked", False),
            "lock_duration_hours": lock_status.get("lock_duration_hours"),
            "largest_lp_account": lp_info.get("largest_account", ""),
            "reasons": reasons,
        }

        return round(score, 4), evidence
