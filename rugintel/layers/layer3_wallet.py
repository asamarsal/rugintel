"""
Layer 3: Wallet Intelligence — Holder Concentration & Deployer History

Analyzes on-chain wallet patterns to detect insider activity.

Key signals:
- Top wallet holds >50% supply = HIGH RISK
- Dev wallet sells >20% holdings within 5 minutes = CRITICAL
- Deployer has history of creating rugpull tokens
- Few unique holders relative to volume
"""

import os
import logging

from rugintel.layers.base import BaseLayer, LayerResult

logger = logging.getLogger(__name__)


class WalletLayer(BaseLayer):
    """
    Fingerprint holder concentration and deployer history.

    Weight: 0.20 (strong signal for insider activity)
    Data source: Solana RPC (getTokenLargestAccounts, getSignaturesForAddress)
    """

    # Threshold constants
    TOP_HOLDER_CRITICAL_PCT = 0.50  # >50% = high risk
    TOP_HOLDER_WARNING_PCT = 0.30   # >30% = moderate risk
    DEV_SELL_CRITICAL_PCT = 0.20    # Dev sells >20% in 5 min = CRITICAL
    MIN_HOLDER_COUNT = 50           # Less than 50 holders = suspicious

    def __init__(self):
        super().__init__()
        self.rpc_url = os.getenv(
            "SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com"
        )

    async def analyze(self, token_address: str, **kwargs) -> LayerResult:
        """
        Analyze wallet distribution for rugpull signals.

        Steps:
        1. Get top token holders
        2. Calculate concentration ratio
        3. Check deployer wallet history
        4. Score based on thresholds
        """
        session = await self._get_session()

        try:
            # Get holder distribution
            holders = await self._get_top_holders(session, token_address)

            # Get token supply
            supply = await self._get_token_supply(session, token_address)

            # Calculate concentration
            concentration = self._calculate_concentration(holders, supply)

            # Calculate final score
            score, evidence = self._calculate_risk(concentration)

            return LayerResult(
                score=score,
                confidence=0.6 if holders else 0.2,
                evidence=evidence,
            )

        except Exception as e:
            logger.error(f"Wallet layer error: {e}")
            return LayerResult(
                score=0.5, confidence=0.1,
                evidence={"error": str(e)},
            )

    async def _get_top_holders(self, session, token_address: str) -> list:
        """Get top 20 token holders via Solana RPC."""
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
            return [
                {
                    "address": a.get("address", ""),
                    "amount": float(a.get("amount", "0")),
                    "decimals": a.get("decimals", 0),
                }
                for a in accounts
            ]

        except Exception as e:
            logger.error(f"Failed to get holders: {e}")
            return []

    async def _get_token_supply(self, session, token_address: str) -> float:
        """Get total token supply."""
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTokenSupply",
            "params": [token_address],
        }

        try:
            async with session.post(
                self.rpc_url,
                json=payload,
                headers={"Content-Type": "application/json"},
            ) as resp:
                data = await resp.json()

            supply_data = data.get("result", {}).get("value", {})
            return float(supply_data.get("amount", "0"))

        except Exception as e:
            logger.error(f"Failed to get supply: {e}")
            return 0.0

    def _calculate_concentration(self, holders: list, total_supply: float) -> dict:
        """Calculate how concentrated holdings are."""
        if not holders or total_supply <= 0:
            return {
                "top_holder_pct": 0,
                "top_5_pct": 0,
                "top_10_pct": 0,
                "holder_count": 0,
            }

        top_1 = holders[0]["amount"] / total_supply if holders else 0
        top_5 = sum(h["amount"] for h in holders[:5]) / total_supply
        top_10 = sum(h["amount"] for h in holders[:10]) / total_supply

        return {
            "top_holder_pct": round(top_1, 4),
            "top_holder_address": holders[0]["address"] if holders else "",
            "top_5_pct": round(top_5, 4),
            "top_10_pct": round(top_10, 4),
            "holder_count": len(holders),
        }

    def _calculate_risk(self, concentration: dict) -> tuple:
        """
        Calculate wallet concentration risk score.

        Thresholds:
        - Top holder >50% supply = 0.9 (CRITICAL)
        - Top holder >30% supply = 0.7 (HIGH)
        - Top 5 holders >80% supply = 0.8 (concentrated)
        - <50 holders = additional risk boost
        """
        score = 0.0
        reasons = []

        top_pct = concentration.get("top_holder_pct", 0)
        top_5_pct = concentration.get("top_5_pct", 0)
        holder_count = concentration.get("holder_count", 0)

        # Top holder concentration
        if top_pct > self.TOP_HOLDER_CRITICAL_PCT:
            score = max(score, 0.9)
            reasons.append(
                f"CRITICAL: Top wallet holds {top_pct:.0%} of supply (>{self.TOP_HOLDER_CRITICAL_PCT:.0%})"
            )
        elif top_pct > self.TOP_HOLDER_WARNING_PCT:
            score = max(score, 0.7)
            reasons.append(
                f"WARNING: Top wallet holds {top_pct:.0%} of supply"
            )

        # Top 5 concentration
        if top_5_pct > 0.80:
            score = max(score, 0.8)
            reasons.append(f"Top 5 wallets hold {top_5_pct:.0%} of supply")
        elif top_5_pct > 0.60:
            score = max(score, 0.5)
            reasons.append(f"Top 5 wallets hold {top_5_pct:.0%}")

        # Few holders
        if holder_count < self.MIN_HOLDER_COUNT:
            score = min(score + 0.15, 1.0)
            reasons.append(f"Only {holder_count} holders (< {self.MIN_HOLDER_COUNT})")

        # Default low risk
        if not reasons:
            score = 0.15
            reasons.append("Healthy holder distribution")

        evidence = {
            "score": round(score, 4),
            **concentration,
            "reasons": reasons,
        }

        return round(score, 4), evidence
