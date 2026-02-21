"""
Layer 6: Visual Intelligence — Typosquatting Detection

Detects token impersonation via name/symbol similarity to popular tokens.
No external API needed — uses Python's difflib for string similarity.

Key signals:
- Token name/symbol very similar to known top tokens
- Examples: "SOLANAA" vs "SOLANA", "BONDG" vs "BONK"
- Common scam tactic: copy popular token identity to lure buyers
"""

import difflib
import logging

from rugintel.layers.base import BaseLayer, LayerResult

logger = logging.getLogger(__name__)

# Top 50 Solana tokens that scammers commonly impersonate
KNOWN_TOKENS = {
    # Symbol: Full Name
    "SOL": "Solana",
    "USDC": "USD Coin",
    "USDT": "Tether",
    "BONK": "Bonk",
    "WIF": "dogwifhat",
    "JTO": "Jito",
    "JUP": "Jupiter",
    "PYTH": "Pyth Network",
    "RAY": "Raydium",
    "ORCA": "Orca",
    "MNGO": "Mango Markets",
    "SAMO": "Samoyed Coin",
    "FIDA": "Bonfida",
    "SRM": "Serum",
    "STEP": "Step Finance",
    "COPE": "Cope",
    "ATLAS": "Star Atlas",
    "POLIS": "Star Atlas DAO",
    "RNDR": "Render Token",
    "HNT": "Helium",
    "MOBILE": "Helium Mobile",
    "W": "Wormhole",
    "TENSOR": "Tensor",
    "KMNO": "Kamino",
    "DRIFT": "Drift Protocol",
    "POPCAT": "Popcat",
    "MEW": "cat in a dogs world",
    "BOME": "BOOK OF MEME",
    "WEN": "Wen",
    "MYRO": "Myro",
    "SLERF": "SLERF",
    "TRUMP": "TRUMP",
    "PEPE": "Pepe",
    "DOGE": "Dogecoin",
    "SHIB": "Shiba Inu",
    "LINK": "Chainlink",
    "UNI": "Uniswap",
    "AAVE": "Aave",
    "BTC": "Bitcoin",
    "ETH": "Ethereum",
    "BNB": "BNB",
    "ADA": "Cardano",
    "DOT": "Polkadot",
    "AVAX": "Avalanche",
    "MATIC": "Polygon",
    "ARB": "Arbitrum",
    "OP": "Optimism",
    "SUI": "Sui",
    "APT": "Aptos",
    "SEI": "Sei",
}

# Similarity threshold
CRITICAL_SIMILARITY = 0.85   # >85% similar = likely impersonation
WARNING_SIMILARITY = 0.70    # >70% similar = suspicious


class VisualLayer(BaseLayer):
    """
    Detect token name/symbol typosquatting.

    Weight: 0.03 (weak signal alone, but strong when combined)
    Data source: None (offline analysis using difflib)
    """

    def __init__(self):
        super().__init__()

    async def analyze(self, token_address: str, **kwargs) -> LayerResult:
        """
        Check if token name/symbol is suspiciously similar to known tokens.

        This layer can work with just the token name and symbol
        passed via kwargs, or it can fetch metadata from chain.
        """
        token_name = kwargs.get("token_name", "")
        token_symbol = kwargs.get("token_symbol", "")

        if not token_name and not token_symbol:
            # Try to get from DexScreener data if available
            return LayerResult(
                score=0.0, confidence=0.1,
                evidence={"note": "No token name/symbol provided"},
            )

        # Check both name and symbol against known tokens
        name_match = self._check_similarity(token_name, "name")
        symbol_match = self._check_similarity(token_symbol, "symbol")

        # Use the higher risk match
        if name_match["similarity"] > symbol_match["similarity"]:
            best_match = name_match
        else:
            best_match = symbol_match

        score = self._calculate_score(best_match)

        evidence = {
            "score": round(score, 4),
            "token_name": token_name,
            "token_symbol": token_symbol,
            "name_match": name_match,
            "symbol_match": symbol_match,
            "reasons": best_match.get("reasons", []),
        }

        return LayerResult(
            score=round(score, 4),
            confidence=0.8 if best_match["similarity"] > 0.5 else 0.4,
            evidence=evidence,
        )

    def _check_similarity(self, value: str, check_type: str) -> dict:
        """
        Check string similarity against all known tokens.

        Returns:
            Dict with best match info, similarity score, and reasons.
        """
        if not value:
            return {"similarity": 0.0, "match": None, "reasons": []}

        value_upper = value.upper().strip()
        best_similarity = 0.0
        best_match = None
        reasons = []

        for symbol, name in KNOWN_TOKENS.items():
            if check_type == "symbol":
                compare_against = symbol
            else:
                compare_against = name.upper()

            # Exact match = not a typosquat, it's the real token (or an exact copy)
            if value_upper == compare_against.upper():
                # Could be the real token or an exact impersonation
                # Can't tell from name alone — other layers handle this
                return {
                    "similarity": 1.0,
                    "match": f"{symbol} ({name})",
                    "exact_match": True,
                    "reasons": [f"Exact match with known token {symbol}"],
                }

            # Calculate similarity
            similarity = difflib.SequenceMatcher(
                None, value_upper, compare_against.upper()
            ).ratio()

            if similarity > best_similarity:
                best_similarity = similarity
                best_match = f"{symbol} ({name})"

        if best_similarity >= CRITICAL_SIMILARITY:
            reasons.append(
                f"CRITICAL: Name '{value}' is {best_similarity:.0%} similar "
                f"to known token {best_match}"
            )
        elif best_similarity >= WARNING_SIMILARITY:
            reasons.append(
                f"WARNING: Name '{value}' is {best_similarity:.0%} similar "
                f"to {best_match}"
            )

        return {
            "similarity": round(best_similarity, 4),
            "match": best_match,
            "exact_match": False,
            "reasons": reasons,
        }

    def _calculate_score(self, match: dict) -> float:
        """
        Convert similarity to risk score.

        - >85% similar = 0.85 risk (likely impersonation)
        - >70% similar = 0.5 risk (suspicious)
        - <70% = low risk (probably original)
        - Exact match = 0.0 (likely real token)
        """
        similarity = match.get("similarity", 0.0)

        if match.get("exact_match"):
            return 0.0  # Exact match — probably real token

        if similarity >= CRITICAL_SIMILARITY:
            return 0.85

        if similarity >= WARNING_SIMILARITY:
            # Linear scale from 0.3 to 0.5
            return 0.3 + (similarity - WARNING_SIMILARITY) * 1.33

        return max(0.0, similarity * 0.2)  # Low risk for low similarity
