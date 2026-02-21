"""
RugIntel Intelligence Engine — 12-Layer Fusion

Orchestrates all 7 intelligence layers (Phase 1 MVP) in parallel,
applies weighted fusion, and produces a composite risk assessment.

Architecture:
    - All layers run off-chain via asyncio.gather()
    - Each layer returns a LayerResult (score, confidence, evidence)
    - Weighted average produces the final risk_score
    - Confidence is computed from layer agreement
"""

import asyncio
import logging
import time
from typing import Dict, Any, Optional

from rugintel.layers.base import LayerResult
from rugintel.layers.layer1_social import SocialLayer
from rugintel.layers.layer2_liquidity import LiquidityLayer
from rugintel.layers.layer3_wallet import WalletLayer
from rugintel.layers.layer4_market import MarketLayer
from rugintel.layers.layer5_contract import ContractLayer
from rugintel.layers.layer6_visual import VisualLayer
from rugintel.layers.layer7_temporal import TemporalLayer

logger = logging.getLogger(__name__)


class TwelveLayerFusion:
    """
    12-Layer Intelligence Fusion Engine.

    Phase 1 MVP implements layers 1-7 with weighted fusion.
    Layers 8-12 are reserved for Phase 2 (post-mainnet).

    Weight calibration (sums to 1.0):
        liquidity: 0.25  — Highest predictive power
        wallet:    0.20  — Strong insider activity signal
        temporal:  0.20  — Critical for timing prediction
        contract:  0.15  — Necessary but 22% false negative alone
        market:    0.10  — Supporting signal
        social:    0.07  — Noisy but valuable when correlated
        visual:    0.03  — Weak signal in isolation
    """

    LAYER_WEIGHTS = {
        "social":    0.07,
        "liquidity": 0.25,
        "wallet":    0.20,
        "market":    0.10,
        "contract":  0.15,
        "visual":    0.03,
        "temporal":  0.20,
    }

    LAYER_NAMES = [
        "social", "liquidity", "wallet", "market",
        "contract", "visual", "temporal",
    ]

    def __init__(self):
        """Initialize all intelligence layers."""
        self.layers = {
            "social": SocialLayer(),
            "liquidity": LiquidityLayer(),
            "wallet": WalletLayer(),
            "market": MarketLayer(),
            "contract": ContractLayer(),
            "visual": VisualLayer(),
            "temporal": TemporalLayer(),
        }

    async def analyze(self, token_address: str,
                      launch_timestamp: int = 0,
                      token_name: str = "",
                      token_symbol: str = "") -> Dict[str, Any]:
        """
        Run all 7 layers in parallel and fuse results.

        Args:
            token_address: Solana token mint address.
            launch_timestamp: Unix timestamp of token launch.
            token_name: Token name (for Layer 6 typosquatting check).
            token_symbol: Token symbol (for Layer 6).

        Returns:
            Dict with risk_score, confidence, evidence, time_to_rugpull.
        """
        start_time = time.time()

        # Run all layers in parallel — this is the core of off-chain computation
        results = await asyncio.gather(
            self.layers["social"].safe_analyze(token_address),
            self.layers["liquidity"].safe_analyze(token_address),
            self.layers["wallet"].safe_analyze(token_address),
            self.layers["market"].safe_analyze(token_address),
            self.layers["contract"].safe_analyze(token_address),
            self.layers["visual"].safe_analyze(
                token_address,
                token_name=token_name,
                token_symbol=token_symbol,
            ),
            self.layers["temporal"].safe_analyze(
                token_address,
                launch_timestamp=launch_timestamp,
            ),
        )

        # Map results to layer names
        layer_results = dict(zip(self.LAYER_NAMES, results))

        # Calculate fused score
        fused_score = self._fuse_scores(layer_results)

        # Calculate overall confidence
        confidence = self._calculate_confidence(layer_results)

        # Compile evidence from all layers
        evidence = self._compile_evidence(layer_results)

        # Estimate time to rugpull
        time_to_rugpull = self._estimate_timing(layer_results, fused_score)

        elapsed = time.time() - start_time
        logger.info(
            f"Analysis complete in {elapsed:.2f}s | "
            f"Score: {fused_score:.4f} | "
            f"Confidence: {confidence:.4f}"
        )

        return {
            "risk_score": fused_score,
            "confidence": confidence,
            "evidence": evidence,
            "time_to_rugpull": time_to_rugpull,
            "analysis_time_seconds": round(elapsed, 3),
        }

    def _fuse_scores(self, layer_results: Dict[str, LayerResult]) -> float:
        """
        Combine layer scores using weighted average.

        Score = Σ(weight_i × score_i) for all layers
        """
        fused = sum(
            self.LAYER_WEIGHTS[name] * result.score
            for name, result in layer_results.items()
            if name in self.LAYER_WEIGHTS
        )
        return round(min(max(fused, 0.0), 1.0), 4)

    def _calculate_confidence(self,
                               layer_results: Dict[str, LayerResult]) -> float:
        """
        Calculate overall prediction confidence.

        Confidence is higher when:
        1. More layers return high confidence (more data available)
        2. Layers agree on direction (all high or all low risk)
        3. High-weight layers have high confidence
        """
        # Weighted confidence average
        weighted_conf = sum(
            self.LAYER_WEIGHTS[name] * result.confidence
            for name, result in layer_results.items()
            if name in self.LAYER_WEIGHTS
        )

        # Layer agreement bonus: if all layers agree, boost confidence
        scores = [r.score for r in layer_results.values()]
        if scores:
            import numpy as np
            # Low std dev = high agreement
            std_dev = float(np.std(scores))
            agreement_bonus = max(0, 0.2 - std_dev)
            weighted_conf += agreement_bonus

        # Penalty for layers that errored
        error_count = sum(
            1 for r in layer_results.values() if r.error
        )
        error_penalty = error_count * 0.05

        confidence = min(max(weighted_conf - error_penalty, 0.0), 1.0)
        return round(confidence, 4)

    def _compile_evidence(self,
                           layer_results: Dict[str, LayerResult]) -> Dict[str, Any]:
        """Compile evidence from all layers into a single dict."""
        evidence = {}
        for name, result in layer_results.items():
            evidence[name] = {
                "score": result.score,
                "confidence": result.confidence,
                "weight": self.LAYER_WEIGHTS.get(name, 0),
                "weighted_score": round(
                    result.score * self.LAYER_WEIGHTS.get(name, 0), 4
                ),
                "evidence": result.evidence,
                "error": result.error,
            }
        return evidence

    def _estimate_timing(self, layer_results: Dict[str, LayerResult],
                          fused_score: float) -> Optional[float]:
        """
        Estimate time until rugpull (hours).

        Based on temporal layer data + overall risk score.
        Returns None if rugpull is unlikely (score < 0.5).
        """
        if fused_score < 0.5:
            return None  # Low risk — no timing estimate needed

        temporal_evidence = layer_results.get("temporal", LayerResult()).evidence
        minutes_since = temporal_evidence.get("minutes_since_launch", -1)
        risk_window = temporal_evidence.get("risk_window", "UNKNOWN")

        if minutes_since < 0:
            return None

        # Heuristic timing estimate based on risk window
        if risk_window == "EXTREME":
            return round(max(0.1, (12 - minutes_since) / 60), 2)
        elif risk_window == "HIGH":
            return round(max(0.5, (30 - minutes_since) / 60), 2)
        elif risk_window == "ELEVATED":
            return round(max(1.0, (120 - minutes_since) / 60), 2)
        else:
            return round(max(2.0, 24 - (minutes_since / 60)), 2)

    async def close(self):
        """Clean up all layer HTTP sessions."""
        for layer in self.layers.values():
            await layer.close()
