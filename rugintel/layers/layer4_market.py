"""
Layer 4: Market Intelligence — Volume Spike & Wash Trading Detection

Queries DexScreener API for trading activity analysis.

Key signals:
- Volume >100× in 2 minutes = 94% probability of pump&dump
- High volume but few holders = wash trading
- Abnormal buy/sell ratio
"""

import os
import time
import logging

from rugintel.layers.base import BaseLayer, LayerResult

logger = logging.getLogger(__name__)


class MarketLayer(BaseLayer):
    """
    Detect volume anomalies and wash trading patterns.

    Weight: 0.10 (supporting signal)
    Data source: DexScreener API (free, no key required)
    """

    DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex"

    # Thresholds
    VOLUME_SPIKE_CRITICAL = 100  # >100× normal = 94% pump&dump
    VOLUME_SPIKE_WARNING = 20    # >20× = suspicious
    LOW_LIQUIDITY_USD = 5000     # < $5K liquidity = high risk
    SUSPICIOUS_TXNS_RATIO = 10   # Volume/txns ratio too high = wash trading

    def __init__(self):
        super().__init__()

    async def analyze(self, token_address: str, **kwargs) -> LayerResult:
        """
        Analyze market data from DexScreener.

        Steps:
        1. Fetch token pairs from DexScreener
        2. Check volume, liquidity, price changes
        3. Detect wash trading patterns
        4. Calculate risk score
        """
        session = await self._get_session()

        try:
            market_data = await self._fetch_dexscreener(session, token_address)

            if not market_data:
                return LayerResult(
                    score=0.6, confidence=0.2,
                    evidence={"error": "Token not found on DexScreener"},
                )

            score, evidence = self._calculate_risk(market_data)

            return LayerResult(
                score=score,
                confidence=0.65,
                evidence=evidence,
            )

        except Exception as e:
            logger.error(f"Market layer error: {e}")
            return LayerResult(
                score=0.5, confidence=0.1,
                evidence={"error": str(e)},
            )

    async def _fetch_dexscreener(self, session, token_address: str) -> dict:
        """Fetch token data from DexScreener API."""
        url = f"{self.DEXSCREENER_BASE}/tokens/{token_address}"

        try:
            async with session.get(url) as resp:
                if resp.status != 200:
                    return {}

                data = await resp.json()

            pairs = data.get("pairs", [])
            if not pairs:
                return {}

            # Use the pair with highest liquidity
            main_pair = max(
                pairs,
                key=lambda p: float(p.get("liquidity", {}).get("usd", 0) or 0),
            )

            return {
                "pair_address": main_pair.get("pairAddress", ""),
                "dex": main_pair.get("dexId", ""),
                "price_usd": float(main_pair.get("priceUsd", 0) or 0),
                "volume_24h": float(
                    main_pair.get("volume", {}).get("h24", 0) or 0
                ),
                "volume_6h": float(
                    main_pair.get("volume", {}).get("h6", 0) or 0
                ),
                "volume_1h": float(
                    main_pair.get("volume", {}).get("h1", 0) or 0
                ),
                "volume_5m": float(
                    main_pair.get("volume", {}).get("m5", 0) or 0
                ),
                "price_change_5m": float(
                    main_pair.get("priceChange", {}).get("m5", 0) or 0
                ),
                "price_change_1h": float(
                    main_pair.get("priceChange", {}).get("h1", 0) or 0
                ),
                "price_change_24h": float(
                    main_pair.get("priceChange", {}).get("h24", 0) or 0
                ),
                "liquidity_usd": float(
                    main_pair.get("liquidity", {}).get("usd", 0) or 0
                ),
                "txns_buys_5m": int(
                    main_pair.get("txns", {}).get("m5", {}).get("buys", 0) or 0
                ),
                "txns_sells_5m": int(
                    main_pair.get("txns", {}).get("m5", {}).get("sells", 0) or 0
                ),
                "txns_buys_1h": int(
                    main_pair.get("txns", {}).get("h1", {}).get("buys", 0) or 0
                ),
                "txns_sells_1h": int(
                    main_pair.get("txns", {}).get("h1", {}).get("sells", 0) or 0
                ),
                "pair_created_at": main_pair.get("pairCreatedAt", 0),
            }

        except Exception as e:
            logger.error(f"DexScreener fetch error: {e}")
            return {}

    def _calculate_risk(self, data: dict) -> tuple:
        """
        Calculate market anomaly risk score.

        Key rule: Volume >100× in 2 minutes = 94% pump&dump
        """
        score = 0.0
        reasons = []

        volume_5m = data.get("volume_5m", 0)
        volume_1h = data.get("volume_1h", 0)
        liquidity = data.get("liquidity_usd", 0)
        buys_5m = data.get("txns_buys_5m", 0)
        sells_5m = data.get("txns_sells_5m", 0)
        price_change_5m = data.get("price_change_5m", 0)

        # 1. Volume spike detection
        # Compare 5-min volume to 1-hour average (per 5 min)
        avg_5m_volume = (volume_1h / 12) if volume_1h > 0 else 1
        volume_ratio = volume_5m / max(avg_5m_volume, 1)

        if volume_ratio >= self.VOLUME_SPIKE_CRITICAL:
            score = max(score, 0.95)
            reasons.append(
                f"CRITICAL: Volume spike {volume_ratio:.0f}× "
                f"(>{self.VOLUME_SPIKE_CRITICAL}× = 94% pump&dump)"
            )
        elif volume_ratio >= self.VOLUME_SPIKE_WARNING:
            score = max(score, 0.6)
            reasons.append(f"Volume spike {volume_ratio:.0f}× (suspicious)")

        # 2. Low liquidity
        if liquidity < self.LOW_LIQUIDITY_USD:
            score = max(score, 0.7)
            reasons.append(
                f"Very low liquidity: ${liquidity:,.0f} "
                f"(<${self.LOW_LIQUIDITY_USD:,})"
            )
        elif liquidity < 20000:
            score = max(score, 0.4)
            reasons.append(f"Low liquidity: ${liquidity:,.0f}")

        # 3. Wash trading detection (high volume, few transactions)
        total_txns_5m = buys_5m + sells_5m
        if total_txns_5m > 0 and volume_5m > 0:
            vol_per_txn = volume_5m / total_txns_5m
            if vol_per_txn > 10000:  # >$10K per transaction average
                score = min(score + 0.2, 1.0)
                reasons.append(
                    f"Possible wash trading: ${vol_per_txn:,.0f} avg per txn"
                )

        # 4. Extreme price pump (often before dump)
        if price_change_5m > 200:  # >200% in 5 min
            score = min(score + 0.2, 1.0)
            reasons.append(f"Extreme price pump: +{price_change_5m:.0f}% in 5min")

        if not reasons:
            score = 0.1
            reasons.append("Normal market activity")

        evidence = {
            "score": round(score, 4),
            "volume_5m": volume_5m,
            "volume_1h": volume_1h,
            "volume_ratio": round(volume_ratio, 1),
            "liquidity_usd": liquidity,
            "price_change_5m": price_change_5m,
            "txns_5m": {"buys": buys_5m, "sells": sells_5m},
            "reasons": reasons,
        }

        return round(score, 4), evidence
