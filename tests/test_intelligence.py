"""
RugIntel Intelligence Engine Tests

Tests for the TwelveLayerFusion engine using mocked layer results.
All tests run offline — no API keys or network access needed.
"""

import asyncio
from unittest.mock import AsyncMock, patch, MagicMock

import pytest

from rugintel.layers.base import LayerResult
from rugintel.intelligence import TwelveLayerFusion
from rugintel.verification import GroundTruthVerifier


# ── Fusion Engine Tests ───────────────────────────────────


class TestTwelveLayerFusion:
    """Test the 12-layer fusion engine."""

    def test_weight_sum(self):
        """All layer weights must sum to 1.0."""
        fusion = TwelveLayerFusion()
        total = sum(fusion.LAYER_WEIGHTS.values())
        assert abs(total - 1.0) < 0.001, f"Weights sum to {total}, expected 1.0"

    def test_fuse_scores_all_high(self):
        """When all layers report high risk, fused score should be high."""
        fusion = TwelveLayerFusion()

        results = {
            name: LayerResult(score=0.9, confidence=0.8)
            for name in fusion.LAYER_NAMES
        }

        score = fusion._fuse_scores(results)
        assert score > 0.85

    def test_fuse_scores_all_low(self):
        """When all layers report low risk, fused score should be low."""
        fusion = TwelveLayerFusion()

        results = {
            name: LayerResult(score=0.1, confidence=0.8)
            for name in fusion.LAYER_NAMES
        }

        score = fusion._fuse_scores(results)
        assert score < 0.15

    def test_fuse_scores_mixed(self):
        """Mixed signals should produce moderate score."""
        fusion = TwelveLayerFusion()

        results = {
            "social": LayerResult(score=0.3, confidence=0.5),
            "liquidity": LayerResult(score=0.9, confidence=0.8),
            "wallet": LayerResult(score=0.7, confidence=0.6),
            "market": LayerResult(score=0.5, confidence=0.5),
            "contract": LayerResult(score=0.2, confidence=0.7),
            "visual": LayerResult(score=0.1, confidence=0.9),
            "temporal": LayerResult(score=0.8, confidence=0.7),
        }

        score = fusion._fuse_scores(results)
        # Weighted: 0.3*0.07 + 0.9*0.25 + 0.7*0.20 + 0.5*0.10 +
        #           0.2*0.15 + 0.1*0.03 + 0.8*0.20 = 0.634
        assert 0.5 < score < 0.75

    def test_liquidity_weight_dominance(self):
        """Liquidity layer (weight=0.25) should dominate when all else is 0."""
        fusion = TwelveLayerFusion()

        results = {
            name: LayerResult(score=0.0, confidence=0.8)
            for name in fusion.LAYER_NAMES
        }
        results["liquidity"] = LayerResult(score=1.0, confidence=0.9)

        score = fusion._fuse_scores(results)
        assert abs(score - 0.25) < 0.001

    def test_confidence_increases_with_agreement(self):
        """When layers agree, confidence should be higher."""
        fusion = TwelveLayerFusion()

        # All agree: high risk
        agreed = {
            name: LayerResult(score=0.85, confidence=0.7)
            for name in fusion.LAYER_NAMES
        }

        # Disagree: mixed
        mixed = {
            "social": LayerResult(score=0.1, confidence=0.7),
            "liquidity": LayerResult(score=0.9, confidence=0.7),
            "wallet": LayerResult(score=0.2, confidence=0.7),
            "market": LayerResult(score=0.8, confidence=0.7),
            "contract": LayerResult(score=0.3, confidence=0.7),
            "visual": LayerResult(score=0.7, confidence=0.7),
            "temporal": LayerResult(score=0.4, confidence=0.7),
        }

        conf_agreed = fusion._calculate_confidence(agreed)
        conf_mixed = fusion._calculate_confidence(mixed)

        assert conf_agreed > conf_mixed

    def test_estimate_timing_low_risk_returns_none(self):
        """Low risk score should return no timing estimate."""
        fusion = TwelveLayerFusion()

        results = {
            name: LayerResult(score=0.1, confidence=0.5)
            for name in fusion.LAYER_NAMES
        }

        timing = fusion._estimate_timing(results, fused_score=0.1)
        assert timing is None

    def test_compile_evidence_includes_all_layers(self):
        """Evidence dict should include all 7 layers."""
        fusion = TwelveLayerFusion()

        results = {
            name: LayerResult(score=0.5, confidence=0.5, evidence={"test": True})
            for name in fusion.LAYER_NAMES
        }

        evidence = fusion._compile_evidence(results)
        assert len(evidence) == 7
        for name in fusion.LAYER_NAMES:
            assert name in evidence
            assert "score" in evidence[name]
            assert "weight" in evidence[name]


# ── Ground Truth Verifier Tests ────────────────────────────


class TestGroundTruthVerifier:
    """Test the ground truth verification logic."""

    def test_accuracy_true_positive(self):
        """Correctly predicted rugpull → high accuracy."""
        verifier = GroundTruthVerifier()

        accuracy = verifier.calculate_accuracy(
            predicted_risk=0.95,
            actual_rugpull=True,
        )

        assert accuracy == 0.95

    def test_accuracy_true_negative(self):
        """Correctly predicted safe → high accuracy."""
        verifier = GroundTruthVerifier()

        accuracy = verifier.calculate_accuracy(
            predicted_risk=0.05,
            actual_rugpull=False,
        )

        assert accuracy == 0.95

    def test_accuracy_false_negative(self):
        """Missed rugpull → low accuracy."""
        verifier = GroundTruthVerifier()

        accuracy = verifier.calculate_accuracy(
            predicted_risk=0.10,
            actual_rugpull=True,
        )

        assert accuracy == 0.10

    def test_accuracy_false_positive(self):
        """False alarm → low accuracy."""
        verifier = GroundTruthVerifier()

        accuracy = verifier.calculate_accuracy(
            predicted_risk=0.90,
            actual_rugpull=False,
        )

        assert accuracy == 0.10

    def test_determine_rugpull_price_drop(self):
        """90% price drop should confirm rugpull."""
        verifier = GroundTruthVerifier()

        result = verifier._determine_rugpull(
            solana={"lp_removed": False},
            rugcheck={"status": "unknown"},
            dex={"price_change_24h": -95},
        )

        assert result is True

    def test_determine_rugpull_lp_drained(self):
        """LP removed should confirm rugpull."""
        verifier = GroundTruthVerifier()

        result = verifier._determine_rugpull(
            solana={"lp_removed": True},
            rugcheck={"status": "clean"},
            dex={"price_change_24h": -10},
        )

        assert result is True

    def test_determine_safe_token(self):
        """No rugpull signals should return False."""
        verifier = GroundTruthVerifier()

        result = verifier._determine_rugpull(
            solana={"lp_removed": False},
            rugcheck={"status": "clean"},
            dex={"price_change_24h": -20},
        )

        assert result is False
