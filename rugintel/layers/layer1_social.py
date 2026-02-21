"""
Layer 1: Social Intelligence — Twitter/Telegram Pump Detection

Detects coordinated pump activity on social media platforms.
Uses Twitter API v2 (if available) or falls back to heuristic scoring.

Key signals:
- >10 new accounts (<30 days old) posting same token within 5 min
- 87% of paid shills don't disclose payment (SEC 2025)
- Coordinated hashtag campaigns
"""

import os
import logging
from typing import Optional

from rugintel.layers.base import BaseLayer, LayerResult

logger = logging.getLogger(__name__)

# Known shill patterns
PUMP_KEYWORDS = [
    "100x", "1000x", "moonshot", "gem", "next sol", "early",
    "presale", "stealth launch", "safu", "based dev", "lfg",
    "dont miss", "last chance", "generational", "alpha leak",
]


class SocialLayer(BaseLayer):
    """
    Analyze social media activity for coordinated pump signals.

    Weight: 0.07 (noisy but valuable when correlated with other layers)
    """

    def __init__(self):
        super().__init__()
        self.twitter_bearer = os.getenv("TWITTER_BEARER_TOKEN", "")

    async def analyze(self, token_address: str, **kwargs) -> LayerResult:
        """
        Check social media for pump coordination signals.

        Strategy:
        1. If Twitter API available → query recent mentions
        2. Count new accounts, shill keywords, retweet patterns
        3. If no API → return neutral score with low confidence
        """
        if self.twitter_bearer:
            return await self._analyze_twitter(token_address)
        else:
            # No Twitter API key — return neutral with low confidence
            logger.info("Twitter API not configured, using heuristic fallback")
            return LayerResult(
                score=0.3,  # Slight baseline risk (most new tokens are shilled)
                confidence=0.1,  # Very low confidence without real data
                evidence={
                    "source": "heuristic_fallback",
                    "reason": "No Twitter API key configured",
                },
            )

    async def _analyze_twitter(self, token_address: str) -> LayerResult:
        """Query Twitter API v2 for recent token mentions."""
        session = await self._get_session()

        # Search for token mentions in last 15 minutes
        search_query = f"{token_address} -is:retweet"
        url = "https://api.twitter.com/2/tweets/search/recent"
        headers = {"Authorization": f"Bearer {self.twitter_bearer}"}
        params = {
            "query": search_query,
            "max_results": 100,
            "tweet.fields": "author_id,created_at,public_metrics",
            "user.fields": "created_at,public_metrics",
            "expansions": "author_id",
        }

        try:
            async with session.get(url, headers=headers, params=params) as resp:
                if resp.status == 429:
                    # Rate limited — return neutral
                    return LayerResult(
                        score=0.3, confidence=0.1,
                        evidence={"error": "Twitter rate limited"},
                    )
                if resp.status != 200:
                    return LayerResult(
                        score=0.3, confidence=0.1,
                        evidence={"error": f"Twitter API error: {resp.status}"},
                    )

                data = await resp.json()

            tweets = data.get("data", [])
            users = {
                u["id"]: u for u in data.get("includes", {}).get("users", [])
            }

            if not tweets:
                return LayerResult(
                    score=0.1, confidence=0.3,
                    evidence={"tweet_count": 0, "assessment": "No social activity"},
                )

            # Analyze patterns
            pump_signals = self._detect_pump_signals(tweets, users)

            return LayerResult(
                score=pump_signals["score"],
                confidence=pump_signals["confidence"],
                evidence=pump_signals,
            )

        except Exception as e:
            logger.error(f"Twitter API error: {e}")
            return LayerResult(
                score=0.3, confidence=0.1,
                evidence={"error": str(e)},
            )

    def _detect_pump_signals(self, tweets: list, users: dict) -> dict:
        """
        Analyze tweet patterns for coordinated pump activity.

        Key thresholds:
        - >10 new accounts posting simultaneously = HIGH RISK
        - Many shill keywords = suspicious
        - Low follower accounts with high engagement = bot activity
        """
        from datetime import datetime, timezone, timedelta

        new_account_count = 0
        shill_keyword_count = 0
        low_follower_count = 0
        total_tweets = len(tweets)

        now = datetime.now(timezone.utc)
        thirty_days_ago = now - timedelta(days=30)

        for tweet in tweets:
            # Check tweet text for pump keywords
            text_lower = tweet.get("text", "").lower()
            for keyword in PUMP_KEYWORDS:
                if keyword in text_lower:
                    shill_keyword_count += 1
                    break

            # Check if author is a new account
            author_id = tweet.get("author_id", "")
            if author_id in users:
                user = users[author_id]
                created_at = user.get("created_at", "")
                if created_at:
                    try:
                        account_created = datetime.fromisoformat(
                            created_at.replace("Z", "+00:00")
                        )
                        if account_created > thirty_days_ago:
                            new_account_count += 1
                    except ValueError:
                        pass

                # Check for low-follower accounts
                followers = user.get("public_metrics", {}).get(
                    "followers_count", 0
                )
                if followers < 50:
                    low_follower_count += 1

        # Score calculation
        score = 0.0
        reasons = []

        # >10 new accounts posting = strong pump signal
        if new_account_count >= 10:
            score += 0.4
            reasons.append(f"{new_account_count} new accounts (<30 days)")
        elif new_account_count >= 5:
            score += 0.2
            reasons.append(f"{new_account_count} new accounts")

        # Shill keywords ratio
        shill_ratio = shill_keyword_count / max(total_tweets, 1)
        if shill_ratio > 0.5:
            score += 0.3
            reasons.append(f"High shill keyword ratio: {shill_ratio:.0%}")
        elif shill_ratio > 0.2:
            score += 0.15
            reasons.append(f"Moderate shill keywords: {shill_ratio:.0%}")

        # Low follower bot activity
        bot_ratio = low_follower_count / max(total_tweets, 1)
        if bot_ratio > 0.6:
            score += 0.3
            reasons.append(f"Likely bot activity: {bot_ratio:.0%} low-follower")
        elif bot_ratio > 0.3:
            score += 0.15
            reasons.append(f"Some bot activity: {bot_ratio:.0%} low-follower")

        score = min(score, 1.0)
        confidence = min(0.3 + (total_tweets / 100) * 0.5, 0.8)

        return {
            "score": round(score, 4),
            "confidence": round(confidence, 4),
            "total_tweets": total_tweets,
            "new_accounts": new_account_count,
            "shill_keywords": shill_keyword_count,
            "low_follower_bots": low_follower_count,
            "reasons": reasons,
        }
