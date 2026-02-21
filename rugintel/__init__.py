"""
RugIntel — Decentralized Rugpull Intelligence Market on Bittensor

A Bittensor subnet where the digital commodity is verified rugpull
prediction intelligence. Miners compete to produce accurate risk
assessments via 12-layer signal fusion. Validators verify against
24-hour ground truth and set on-chain weights.
"""

__version__ = "0.1.0"

from rugintel.protocol import RugIntelSynapse
from rugintel.intelligence import TwelveLayerFusion
from rugintel.verification import GroundTruthVerifier

__all__ = [
    "RugIntelSynapse",
    "TwelveLayerFusion",
    "GroundTruthVerifier",
]
