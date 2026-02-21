"""
RugIntel Layer Tests

Tests for all 7 intelligence layers using mocked API responses.
All tests run offline — no API keys or network access needed.
"""

import asyncio
import json
from unittest.mock import AsyncMock, patch, MagicMock

import pytest
import pytest_asyncio

from rugintel.layers.base import BaseLayer, LayerResult
from rugintel.layers.layer1_social import SocialLayer
from rugintel.layers.layer2_liquidity import LiquidityLayer
from rugintel.layers.layer3_wallet import WalletLayer
from rugintel.layers.layer4_market import MarketLayer
from rugintel.layers.layer5_contract import ContractLayer
from rugintel.layers.layer6_visual import VisualLayer
from rugintel.layers.layer7_temporal import TemporalLayer


# ── Test Fixtures ──────────────────────────────────────────


FAKE_TOKEN = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"


# ── Layer 1: Social ───────────────────────────────────────


class TestSocialLayer:
    """Test social intelligence layer."""

    @pytest.mark.asyncio
    async def test_no_api_key_fallback(self):
        """Without Twitter API key, should return low-confidence heuristic."""
        layer = SocialLayer()
        layer.twitter_bearer = ""

        result = await layer.analyze(FAKE_TOKEN)

        assert isinstance(result, LayerResult)
        assert result.score == 0.3  # Heuristic baseline
        assert result.confidence == 0.1
        assert result.evidence["source"] == "heuristic_fallback"

        await layer.close()

    def test_pump_signal_detection(self):
        """Test pump signal analysis logic."""
        layer = SocialLayer()

        # Simulate tweets from mostly new accounts with shill keywords
        tweets = [
            {"text": "This is the next 100x gem! LFG", "author_id": f"user_{i}"}
            for i in range(15)
        ]
        users = {
            f"user_{i}": {
                "id": f"user_{i}",
                "created_at": "2026-02-15T00:00:00Z",  # New account
                "public_metrics": {"followers_count": 10},
            }
            for i in range(15)
        }

        signals = layer._detect_pump_signals(tweets, users)

        assert signals["score"] > 0.5  # Should detect pump signals
        assert signals["new_accounts"] >= 10
        assert signals["shill_keywords"] > 0
        assert signals["low_follower_bots"] > 0


# ── Layer 2: Liquidity ─────────────────────────────────────


class TestLiquidityLayer:
    """Test liquidity intelligence layer."""

    def test_risk_calculation_no_pool(self):
        """No pool found should score 0.8."""
        layer = LiquidityLayer()

        lp_info = {"pool_found": False}
        lock_status = {"locked": False}

        score, evidence = layer._calculate_risk(lp_info, lock_status)

        assert score == 0.8
        assert "No liquidity pool found" in evidence["reasons"]

    def test_risk_calculation_unlocked(self):
        """Unlocked LP should score 0.9."""
        layer = LiquidityLayer()

        lp_info = {"pool_found": True}
        lock_status = {"locked": False}

        score, evidence = layer._calculate_risk(lp_info, lock_status)

        assert score == 0.9
        assert "NOT locked" in evidence["reasons"][0]

    def test_risk_calculation_short_lock(self):
        """LP locked < 72h should score 0.7."""
        layer = LiquidityLayer()

        lp_info = {"pool_found": True}
        lock_status = {"locked": True, "lock_duration_hours": 48}

        score, evidence = layer._calculate_risk(lp_info, lock_status)

        assert score == 0.7


# ── Layer 3: Wallet ────────────────────────────────────────


class TestWalletLayer:
    """Test wallet intelligence layer."""

    def test_high_concentration(self):
        """Top holder >50% should score 0.9."""
        layer = WalletLayer()

        concentration = {
            "top_holder_pct": 0.55,
            "top_5_pct": 0.85,
            "top_10_pct": 0.90,
            "holder_count": 30,
        }

        score, evidence = layer._calculate_risk(concentration)

        assert score >= 0.9
        assert "CRITICAL" in evidence["reasons"][0]

    def test_healthy_distribution(self):
        """Well-distributed token should score low."""
        layer = WalletLayer()

        concentration = {
            "top_holder_pct": 0.05,
            "top_5_pct": 0.20,
            "top_10_pct": 0.30,
            "holder_count": 500,
        }

        score, evidence = layer._calculate_risk(concentration)

        assert score <= 0.15
        assert "Healthy" in evidence["reasons"][0]


# ── Layer 4: Market ────────────────────────────────────────


class TestMarketLayer:
    """Test market intelligence layer."""

    def test_volume_spike_critical(self):
        """100× volume spike should trigger 94% pump&dump alert."""
        layer = MarketLayer()

        data = {
            "volume_5m": 100000,
            "volume_1h": 12000,  # Avg 1000 per 5min, so 100× spike
            "liquidity_usd": 50000,
            "txns_buys_5m": 10,
            "txns_sells_5m": 5,
            "price_change_5m": 50,
        }

        score, evidence = layer._calculate_risk(data)

        assert score >= 0.9
        assert "94% pump&dump" in evidence["reasons"][0]

    def test_low_liquidity(self):
        """< $5K liquidity should flag high risk."""
        layer = MarketLayer()

        data = {
            "volume_5m": 100,
            "volume_1h": 1200,
            "liquidity_usd": 2000,
            "txns_buys_5m": 5,
            "txns_sells_5m": 5,
            "price_change_5m": 10,
        }

        score, evidence = layer._calculate_risk(data)

        assert score >= 0.7
        assert "low liquidity" in evidence["reasons"][0].lower()


# ── Layer 5: Contract ──────────────────────────────────────


class TestContractLayer:
    """Test contract intelligence layer."""

    def test_dangerous_token(self):
        """Token with mint + freeze authority should score high."""
        layer = ContractLayer()

        report = {
            "risks": [
                {"name": "Mintable"},
                {"name": "Freezable"},
                {"name": "Low Liquidity"},
            ],
            "score": 15,
        }

        score, evidence = layer._parse_report(report)

        assert score >= 0.8
        assert evidence["mint_authority"] is True
        assert evidence["freeze_authority"] is True

    def test_safe_token(self):
        """Clean token should score low."""
        layer = ContractLayer()

        report = {
            "risks": [],
            "score": 90,
        }

        score, evidence = layer._parse_report(report)

        assert score <= 0.2


# ── Layer 6: Visual ────────────────────────────────────────


class TestVisualLayer:
    """Test visual/typosquatting layer."""

    @pytest.mark.asyncio
    async def test_typosquat_detection(self):
        """Similar name to known token should flag high risk."""
        layer = VisualLayer()

        result = await layer.analyze(
            FAKE_TOKEN,
            token_name="Solanaa",
            token_symbol="SOLL",
        )

        assert result.score > 0.3  # Should detect similarity to SOL/Solana
        await layer.close()

    @pytest.mark.asyncio
    async def test_original_name(self):
        """Unique name should score low."""
        layer = VisualLayer()

        result = await layer.analyze(
            FAKE_TOKEN,
            token_name="QuantumFluxProtocol",
            token_symbol="QFP",
        )

        assert result.score < 0.3  # Not similar to any known token
        await layer.close()


# ── Layer 7: Temporal ──────────────────────────────────────


class TestTemporalLayer:
    """Test temporal FOMO layer."""

    def test_extreme_risk_window(self):
        """Token < 5 min old should score ~0.95."""
        layer = TemporalLayer()

        import time
        now = int(time.time())

        time_metrics = {
            "minutes_since_launch": 3,
            "hours_since_launch": 0.05,
            "token_age_seconds": 180,
        }
        market_data = {"price_change_5m": 0, "price_change_1h": 0}

        score, evidence = layer._calculate_risk(time_metrics, market_data)

        assert score >= 0.9
        assert "EXTREME" in evidence["reasons"][0]

    def test_low_risk_old_token(self):
        """Token > 1 hour old should score low."""
        layer = TemporalLayer()

        time_metrics = {
            "minutes_since_launch": 120,
            "hours_since_launch": 2.0,
            "token_age_seconds": 7200,
        }
        market_data = {"price_change_5m": 0, "price_change_1h": 0}

        score, evidence = layer._calculate_risk(time_metrics, market_data)

        assert score < 0.3


# ── Base Layer ─────────────────────────────────────────────


class TestBaseLayer:
    """Test base layer safe_analyze error handling."""

    @pytest.mark.asyncio
    async def test_safe_analyze_catches_exception(self):
        """safe_analyze should catch errors and return neutral result."""

        class BrokenLayer(BaseLayer):
            async def analyze(self, token_address, **kwargs):
                raise RuntimeError("API exploded")

        layer = BrokenLayer()
        result = await layer.safe_analyze(FAKE_TOKEN)

        assert result.score == 0.5  # Neutral
        assert result.confidence == 0.0
        assert result.error is not None
        assert "exploded" in result.error
