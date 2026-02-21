"""
Base Layer — Abstract class for all intelligence layers.

Each layer must implement the `analyze()` method and return a LayerResult.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional
from abc import ABC, abstractmethod

import aiohttp
import logging

logger = logging.getLogger(__name__)


@dataclass
class LayerResult:
    """Standard result from any intelligence layer."""
    score: float = 0.0
    """Risk score from this layer (0.0 = safe, 1.0 = high risk)."""

    confidence: float = 0.0
    """How confident is this layer in its score (0.0 - 1.0)."""

    evidence: Dict[str, Any] = field(default_factory=dict)
    """Supporting evidence/data that led to this score."""

    error: Optional[str] = None
    """Error message if the layer failed to analyze."""


class BaseLayer(ABC):
    """
    Abstract base class for all RugIntel intelligence layers.

    Each layer:
    1. Receives a Solana token address
    2. Queries relevant APIs (Solana RPC, DexScreener, etc.)
    3. Analyzes the data for rugpull signals
    4. Returns a LayerResult with score, confidence, and evidence
    """

    def __init__(self):
        self._session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create an aiohttp session for API calls."""
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15)
            )
        return self._session

    async def close(self):
        """Close the HTTP session."""
        if self._session and not self._session.closed:
            await self._session.close()

    @abstractmethod
    async def analyze(self, token_address: str, **kwargs) -> LayerResult:
        """
        Analyze a token for rugpull signals.

        Args:
            token_address: Solana token mint address (base58).
            **kwargs: Additional arguments (e.g., launch_timestamp).

        Returns:
            LayerResult with score (0.0-1.0), confidence, and evidence.
        """
        pass

    async def safe_analyze(self, token_address: str, **kwargs) -> LayerResult:
        """
        Wrapper around analyze() that catches exceptions and returns
        a safe default result instead of crashing the fusion engine.
        """
        try:
            return await self.analyze(token_address, **kwargs)
        except Exception as e:
            logger.error(f"{self.__class__.__name__} failed: {e}")
            return LayerResult(
                score=0.5,  # Neutral score on failure
                confidence=0.0,  # Zero confidence
                evidence={},
                error=str(e),
            )
