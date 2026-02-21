"""
RugIntel Protocol — Bittensor Synapse Definition

Defines the communication contract between Miners and Validators.
Validators send RugIntelSynapse requests via Axon RPC;
Miners populate the output fields and return the synapse.
"""

import bittensor as bt
from typing import Optional, Dict, Any


class RugIntelSynapse(bt.Synapse):
    """
    Communication protocol between RugIntel Validator and Miner.

    Flow:
        1. Validator creates synapse with token_address + launch_timestamp
        2. Validator sends synapse to Miner via Axon RPC (dendrite.forward)
        3. Miner runs 12-layer analysis OFF-CHAIN
        4. Miner populates risk_score, confidence, evidence, time_to_rugpull
        5. Miner returns synapse to Validator
        6. Validator stores prediction for 24h ground truth verification
    """

    # ── Input Fields (set by Validator) ────────────────────────
    token_address: str = ""
    """Solana token mint address to analyze (base58 encoded)."""

    launch_timestamp: int = 0
    """Unix timestamp of when the token was first seen on-chain."""

    # ── Output Fields (set by Miner) ──────────────────────────
    risk_score: Optional[float] = None
    """
    Overall rugpull risk score (0.0 - 1.0).
    0.0 = very safe, 1.0 = almost certainly a rugpull.
    This is the weighted fusion of all 7 intelligence layers.
    """

    confidence: Optional[float] = None
    """
    Prediction confidence interval (0.0 - 1.0).
    Higher = more data sources confirm the score.
    Low confidence may indicate insufficient data (new token, few transactions).
    """

    evidence: Optional[Dict[str, Any]] = None
    """
    Supporting evidence dictionary from each layer.
    Example:
    {
        "social": {"pump_accounts": 12, "score": 0.75},
        "liquidity": {"lp_locked": False, "lock_duration_hours": 0, "score": 0.95},
        "wallet": {"top_holder_pct": 0.82, "deployer_rugs": 3, "score": 0.88},
        "market": {"volume_spike_x": 150, "holders": 45, "score": 0.91},
        "contract": {"mint_authority": True, "freeze_authority": True, "score": 0.85},
        "visual": {"name_similarity": 0.12, "similar_to": None, "score": 0.10},
        "temporal": {"minutes_since_launch": 3, "fomo_phase": True, "score": 0.78},
    }
    """

    time_to_rugpull: Optional[float] = None
    """
    Estimated time until rugpull occurs (in hours).
    Based on temporal analysis and historical patterns.
    None if rugpull is unlikely (risk_score < 0.5).
    """
