"""
Layer 5: Contract Intelligence — RugCheck API Integration

Queries RugCheck.xyz API to check token contract security.

Key signals:
- Mint authority still active (can mint unlimited tokens)
- Freeze authority active (can freeze holder accounts)
- Honeypot mechanism detected
- Note: RugCheck alone has 22% false negative — cross-verify needed
"""

import os
import logging

from rugintel.layers.base import BaseLayer, LayerResult

logger = logging.getLogger(__name__)


class ContractLayer(BaseLayer):
    """
    Check token contract for security vulnerabilities.

    Weight: 0.15 (necessary but not sufficient alone — 22% false negative)
    Data source: RugCheck.xyz API (free)
    """

    RUGCHECK_BASE = "https://api.rugcheck.xyz/v1"

    # Risk flags from RugCheck
    CRITICAL_FLAGS = [
        "mintable",          # Can mint new tokens
        "freezable",         # Can freeze accounts
        "mutable_metadata",  # Can change token metadata
    ]

    HIGH_RISK_FLAGS = [
        "low_liquidity",
        "high_holder_concentration",
        "no_social_links",
    ]

    def __init__(self):
        super().__init__()

    async def analyze(self, token_address: str, **kwargs) -> LayerResult:
        """
        Query RugCheck API for token security assessment.

        Steps:
        1. Fetch token report from RugCheck
        2. Check for critical flags (mint, freeze, honeypot)
        3. Parse risk level
        4. Return score (remember: 22% false negative rate)
        """
        session = await self._get_session()

        try:
            report = await self._fetch_rugcheck(session, token_address)

            if not report:
                return LayerResult(
                    score=0.6, confidence=0.2,
                    evidence={
                        "error": "Token not found on RugCheck",
                        "note": "Unlisted tokens are inherently riskier",
                    },
                )

            score, evidence = self._parse_report(report)

            # RugCheck has 22% false negative — cap confidence
            return LayerResult(
                score=score,
                confidence=0.65,  # Never 100% — known 22% false negative
                evidence=evidence,
            )

        except Exception as e:
            logger.error(f"Contract layer error: {e}")
            return LayerResult(
                score=0.5, confidence=0.1,
                evidence={"error": str(e)},
            )

    async def _fetch_rugcheck(self, session, token_address: str) -> dict:
        """Fetch token report from RugCheck API."""
        url = f"{self.RUGCHECK_BASE}/tokens/{token_address}/report"

        try:
            async with session.get(url) as resp:
                if resp.status == 404:
                    return {}
                if resp.status != 200:
                    logger.warning(f"RugCheck returned {resp.status}")
                    return {}

                return await resp.json()

        except Exception as e:
            logger.error(f"RugCheck API error: {e}")
            return {}

    def _parse_report(self, report: dict) -> tuple:
        """
        Parse RugCheck report into risk score.

        RugCheck provides:
        - risks: list of detected issues
        - score: overall risk score (0-100, higher = safer)
        """
        score = 0.0
        reasons = []

        # Check for risks/flags
        risks = report.get("risks", [])
        risk_names = [r.get("name", "").lower() for r in risks]

        # Critical flags
        has_mint = any("mint" in r for r in risk_names)
        has_freeze = any("freez" in r for r in risk_names)
        has_honeypot = any("honeypot" in r for r in risk_names)

        if has_mint:
            score += 0.35
            reasons.append("CRITICAL: Mint authority active — can create unlimited tokens")

        if has_freeze:
            score += 0.25
            reasons.append("WARNING: Freeze authority active — can freeze holder accounts")

        if has_honeypot:
            score += 0.30
            reasons.append("CRITICAL: Honeypot mechanism detected")

        # Check RugCheck's own score (0-100, 100 = safest)
        rugcheck_score = report.get("score", 50)
        if rugcheck_score < 20:
            score = max(score, 0.9)
            reasons.append(f"RugCheck score: {rugcheck_score}/100 (very dangerous)")
        elif rugcheck_score < 50:
            score = max(score, 0.7)
            reasons.append(f"RugCheck score: {rugcheck_score}/100 (risky)")
        elif rugcheck_score >= 80:
            score = min(score, 0.2)
            reasons.append(f"RugCheck score: {rugcheck_score}/100 (relatively safe)")

        # Count total risks
        total_risks = len(risks)
        if total_risks > 5:
            score = min(score + 0.15, 1.0)
            reasons.append(f"{total_risks} risk flags detected")

        score = min(score, 1.0)

        if not reasons:
            score = 0.15
            reasons.append("No major contract issues detected")

        evidence = {
            "score": round(score, 4),
            "rugcheck_score": rugcheck_score,
            "mint_authority": has_mint,
            "freeze_authority": has_freeze,
            "honeypot": has_honeypot,
            "total_risks": total_risks,
            "risk_names": risk_names[:10],
            "note": "RugCheck has 22% false negative rate — cross-verify with other layers",
            "reasons": reasons,
        }

        return round(score, 4), evidence
