"""
Layer 7: Temporal Intelligence — FOMO Peak & Behavioral Economics Modeling

Analyzes time-based patterns that correlate with rugpull timing.

CRITICAL DATA:
- 68% of rugpulls happen within 12 minutes of launch
- Token <5 minutes since launch = very high risk window
- Classic pump-and-dump follows predictable temporal arc

Data source: DexScreener API + launch_timestamp
"""

import os
import time
import logging

from rugintel.layers.base import BaseLayer, LayerResult

logger = logging.getLogger(__name__)


class TemporalLayer(BaseLayer):
    """
    Model FOMO peak timing and pump-and-dump temporal patterns.

    Weight: 0.20 (critical for timing prediction)
    Data source: DexScreener API + launch_timestamp
    """

    # Temporal risk windows (minutes since launch)
    EXTREME_RISK_WINDOW = 5      # <5 minutes = extreme risk
    HIGH_RISK_WINDOW = 12        # <12 minutes = high risk (68% of rugpulls)
    MODERATE_RISK_WINDOW = 30    # <30 minutes = elevated risk
    LOW_RISK_WINDOW = 60         # <60 minutes = moderate risk

    DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex"

    def __init__(self):
        super().__init__()

    async def analyze(self, token_address: str, **kwargs) -> LayerResult:
        """
        Analyze temporal patterns for rugpull timing.

        Steps:
        1. Calculate time since launch
        2. Assess FOMO phase
        3. Check price/volume trajectory for pump-dump arc
        4. Score based on temporal risk windows
        """
        launch_timestamp = kwargs.get("launch_timestamp", 0)

        session = await self._get_session()

        try:
            # Get current market data for trajectory analysis
            market_data = await self._fetch_market_data(session, token_address)

            # Calculate time metrics
            time_metrics = self._calculate_time_metrics(
                launch_timestamp, market_data
            )

            # Score
            score, evidence = self._calculate_risk(time_metrics, market_data)

            return LayerResult(
                score=score,
                confidence=0.7 if launch_timestamp > 0 else 0.3,
                evidence=evidence,
            )

        except Exception as e:
            logger.error(f"Temporal layer error: {e}")
            return LayerResult(
                score=0.5, confidence=0.1,
                evidence={"error": str(e)},
            )

    async def _fetch_market_data(self, session, token_address: str) -> dict:
        """Fetch temporal market data from DexScreener."""
        url = f"{self.DEXSCREENER_BASE}/tokens/{token_address}"

        try:
            async with session.get(url) as resp:
                if resp.status != 200:
                    return {}

                data = await resp.json()

            pairs = data.get("pairs", [])
            if not pairs:
                return {}

            pair = pairs[0]

            return {
                "pair_created_at": pair.get("pairCreatedAt", 0),
                "price_change_5m": float(
                    pair.get("priceChange", {}).get("m5", 0) or 0
                ),
                "price_change_1h": float(
                    pair.get("priceChange", {}).get("h1", 0) or 0
                ),
                "price_change_6h": float(
                    pair.get("priceChange", {}).get("h6", 0) or 0
                ),
                "price_change_24h": float(
                    pair.get("priceChange", {}).get("h24", 0) or 0
                ),
                "volume_5m": float(
                    pair.get("volume", {}).get("m5", 0) or 0
                ),
                "volume_1h": float(
                    pair.get("volume", {}).get("h1", 0) or 0
                ),
            }

        except Exception as e:
            logger.error(f"DexScreener temporal fetch error: {e}")
            return {}

    def _calculate_time_metrics(self, launch_timestamp: int,
                                 market_data: dict) -> dict:
        """Calculate temporal metrics since launch."""
        now = int(time.time())

        # Use launch_timestamp or pair creation time
        if launch_timestamp > 0:
            token_age_seconds = now - launch_timestamp
        elif market_data.get("pair_created_at"):
            # pairCreatedAt is in milliseconds
            pair_ts = market_data["pair_created_at"] / 1000
            token_age_seconds = now - pair_ts
        else:
            token_age_seconds = -1  # Unknown

        minutes_since_launch = token_age_seconds / 60 if token_age_seconds > 0 else -1
        hours_since_launch = token_age_seconds / 3600 if token_age_seconds > 0 else -1

        return {
            "minutes_since_launch": round(minutes_since_launch, 1),
            "hours_since_launch": round(hours_since_launch, 2),
            "token_age_seconds": token_age_seconds,
        }

    def _calculate_risk(self, time_metrics: dict, market_data: dict) -> tuple:
        """
        Calculate temporal risk score.

        Key insight: 68% of rugpulls happen within 12 minutes of launch.
        """
        score = 0.0
        reasons = []

        minutes = time_metrics.get("minutes_since_launch", -1)
        price_5m = market_data.get("price_change_5m", 0)
        price_1h = market_data.get("price_change_1h", 0)

        # === Time-based risk windows ===
        if minutes < 0:
            score = 0.5
            reasons.append("Unknown launch time — cannot assess temporal risk")

        elif minutes < self.EXTREME_RISK_WINDOW:
            score = 0.95
            reasons.append(
                f"EXTREME RISK: Token is only {minutes:.0f} min old "
                f"(<{self.EXTREME_RISK_WINDOW} min)"
            )

        elif minutes < self.HIGH_RISK_WINDOW:
            score = 0.85
            reasons.append(
                f"HIGH RISK: Token is {minutes:.0f} min old — "
                f"68% of rugpulls happen within 12 min of launch"
            )

        elif minutes < self.MODERATE_RISK_WINDOW:
            score = 0.6
            reasons.append(
                f"ELEVATED: Token is {minutes:.0f} min old — "
                f"still in high-risk window"
            )

        elif minutes < self.LOW_RISK_WINDOW:
            score = 0.35
            reasons.append(
                f"MODERATE: Token is {minutes:.0f} min old — "
                f"passed peak risk window"
            )

        else:
            # >1 hour old
            hours = time_metrics.get("hours_since_launch", 0)
            score = max(0.1, 0.3 - (hours * 0.01))
            reasons.append(
                f"LOW: Token is {hours:.1f} hours old — "
                f"past initial risk window"
            )

        # === Pump-dump trajectory detection ===
        if minutes > 0 and minutes < 30:
            # Classic pump-dump: massive pump in first minutes, then crash
            if price_5m > 500:  # >500% in 5 min
                score = min(score + 0.1, 1.0)
                reasons.append(
                    f"Pump phase detected: +{price_5m:.0f}% in 5 min"
                )

            # Price already crashing after pump
            if price_5m < -50 and price_1h > 100:
                score = min(score + 0.15, 1.0)
                reasons.append(
                    "Dump phase: price crashing after initial pump"
                )

        # === FOMO phase detection ===
        if 0 < minutes < 15 and price_5m > 100:
            reasons.append(
                "FOMO PHASE: Rapid price increase in first 15 minutes — "
                "peak risk for rug"
            )

        evidence = {
            "score": round(score, 4),
            **time_metrics,
            "price_change_5m": price_5m,
            "price_change_1h": price_1h,
            "risk_window": self._get_risk_window(minutes),
            "fomo_phase": 0 < minutes < 15 and price_5m > 50,
            "reasons": reasons,
        }

        return round(score, 4), evidence

    def _get_risk_window(self, minutes: float) -> str:
        """Classify the current temporal risk window."""
        if minutes < 0:
            return "UNKNOWN"
        if minutes < self.EXTREME_RISK_WINDOW:
            return "EXTREME"
        if minutes < self.HIGH_RISK_WINDOW:
            return "HIGH"
        if minutes < self.MODERATE_RISK_WINDOW:
            return "ELEVATED"
        if minutes < self.LOW_RISK_WINDOW:
            return "MODERATE"
        return "LOW"
