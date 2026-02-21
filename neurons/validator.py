"""
RugIntel Validator — Bittensor Subnet Entry Point

The validator is a commodity quality verifier:
1. Discovers newly launched tokens on Solana
2. Queries 3+ miners for risk predictions via Dendrite
3. Stores predictions for 24-hour ground truth verification
4. Verifies against ground truth (Solana RPC + RugCheck + DexScreener)
5. Calculates miner accuracy and calls set_weights() on-chain
6. Yuma Consensus automatically distributes TAO based on weights

IMPORTANT: Validators do NOT distribute TAO directly.
Validators only set_weights() → Yuma Consensus handles TAO emission.

Usage:
    python neurons/validator.py \\
        --netuid <SUBNET_UID> \\
        --wallet.name rugintel_wallet \\
        --wallet.hotkey validator_hotkey \\
        --subtensor.network test
"""

import sys
import os
import asyncio
import time
import logging
import json
from collections import defaultdict
from pathlib import Path

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import bittensor as bt
from rugintel.protocol import RugIntelSynapse
from rugintel.verification import GroundTruthVerifier

logger = logging.getLogger(__name__)


class RugIntelValidator:
    """
    RugIntel Validator: Off-chain commodity quality verifier.

    CRITICAL FLOW:
    1. Query miners → Get predictions
    2. Wait 24 hours → Check ground truth
    3. Score miner accuracy → set_weights() on-chain
    4. Yuma Consensus → Auto-distribute TAO to miners
    """

    def __init__(self, config=None):
        """Initialize validator with Bittensor config and verifier."""
        self.config = config or bt.config()
        self.config.merge(RugIntelValidator.add_args())

        # Setup Bittensor
        self.wallet = bt.wallet(config=self.config)
        self.subtensor = bt.subtensor(config=self.config)
        self.metagraph = self.subtensor.metagraph(
            netuid=self.config.netuid
        )
        self.dendrite = bt.dendrite(wallet=self.wallet)

        # Initialize verifier
        self.verifier = GroundTruthVerifier()

        # Pending verifications: token_address → {miner_uid: prediction_data}
        self.pending_verifications = defaultdict(dict)

        # Miner accuracy scores (rolling window)
        self.miner_scores = defaultdict(list)

        # Persistence path
        self.data_dir = Path("data/validator")
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Load pending verifications from disk
        self._load_pending()

        logger.info("✅ RugIntel Validator initialized")
        logger.info(f"   Wallet: {self.wallet.name}")
        logger.info(f"   Subnet: {self.config.netuid}")

    @staticmethod
    def add_args():
        """Add validator-specific CLI arguments."""
        parser = bt.config.parser()
        parser.add_argument("--netuid", type=int, required=True,
                          help="RugIntel subnet UID")
        parser.add_argument("--verification_interval", type=int, default=300,
                          help="Seconds between verification checks")
        return bt.config(parser)

    async def forward(self):
        """
        Main validator loop — discover and query miners.

        1. Get newly launched tokens from Solana
        2. Send RugIntelSynapse to 3+ miners
        3. Store predictions for 24h verification
        """
        # Fetch new tokens for analysis
        new_tokens = await self.verifier.get_new_tokens(limit=5)

        if not new_tokens:
            logger.info("No new tokens to analyze")
            return

        for token in new_tokens:
            logger.info(
                f"🔍 Analyzing token: {token['symbol']} "
                f"({token['address'][:16]}...)"
            )

            # Create synapse request
            synapse = RugIntelSynapse(
                token_address=token["address"],
                launch_timestamp=token["timestamp"],
            )

            # Query all registered miners via Dendrite
            try:
                responses = await self.dendrite.forward(
                    axons=self.metagraph.axons,
                    synapse=synapse,
                    timeout=30,
                )
            except Exception as e:
                logger.error(f"Failed to query miners: {e}")
                continue

            # Store each miner's prediction for 24h verification
            miner_count = 0
            for uid, response in zip(self.metagraph.uids, responses):
                if (response and
                        hasattr(response, 'risk_score') and
                        response.risk_score is not None):
                    self.pending_verifications[token["address"]][int(uid)] = {
                        "risk_score": response.risk_score,
                        "confidence": response.confidence,
                        "evidence": response.evidence,
                        "time_to_rugpull": response.time_to_rugpull,
                        "launch_timestamp": token["timestamp"],
                        "queried_at": int(time.time()),
                    }
                    miner_count += 1

            logger.info(
                f"   📊 Received {miner_count} predictions for "
                f"{token['symbol']}"
            )

        # Persist to disk
        self._save_pending()

    async def verify_and_set_weights(self):
        """
        Check ground truth for pending tokens and set weights.

        This is the critical function:
        1. For each pending token, check 24h ground truth
        2. Calculate miner accuracy scores
        3. Set weights on-chain
        4. Yuma Consensus auto-distributes TAO
        """
        weights = defaultdict(list)
        verified_tokens = []

        for token_address, predictions in list(
            self.pending_verifications.items()
        ):
            # Get launch timestamp from any prediction
            sample_pred = next(iter(predictions.values()), {})
            launch_ts = sample_pred.get("launch_timestamp", 0)

            # Check ground truth (returns None if <24h)
            ground_truth = await self.verifier.check_24h_outcome(
                token_address, launch_ts
            )

            if ground_truth is None:
                continue  # Not yet 24 hours

            # Calculate accuracy for each miner
            for miner_uid, prediction in predictions.items():
                accuracy = self.verifier.calculate_accuracy(
                    predicted_risk=prediction["risk_score"],
                    actual_rugpull=ground_truth["is_rugpull"],
                    liquidity_drained=ground_truth["liquidity_drained"],
                    funds_moved=ground_truth["funds_moved_to_exchange"],
                )

                weights[miner_uid].append(accuracy)
                self.miner_scores[miner_uid].append(accuracy)

                verdict = "RUGPULL ✅" if ground_truth["is_rugpull"] else "SAFE ✅"
                logger.info(
                    f"   Miner {miner_uid}: predicted {prediction['risk_score']:.2f}, "
                    f"actual {verdict}, accuracy {accuracy:.4f}"
                )

            verified_tokens.append(token_address)

        # Remove verified tokens from pending
        for token in verified_tokens:
            del self.pending_verifications[token]
        self._save_pending()

        # Set weights on-chain
        if weights:
            avg_weights = {
                uid: sum(scores) / len(scores)
                for uid, scores in weights.items()
            }

            logger.info(f"⚖️ Setting weights for {len(avg_weights)} miners")

            try:
                # SET WEIGHTS ON-CHAIN
                # This is the ONLY on-chain interaction
                # Yuma Consensus will aggregate these weights from ALL validators
                # and AUTOMATICALLY distribute TAO to miners
                self.subtensor.set_weights(
                    netuid=self.config.netuid,
                    wallet=self.wallet,
                    uids=list(avg_weights.keys()),
                    weights=list(avg_weights.values()),
                )

                logger.info(
                    f"✅ Weights set on-chain → "
                    f"Yuma Consensus will auto-distribute TAO"
                )

            except Exception as e:
                logger.error(f"❌ Failed to set weights: {e}")

    def _save_pending(self):
        """Persist pending verifications to disk."""
        try:
            path = self.data_dir / "pending_verifications.json"
            # Convert defaultdict to regular dict for JSON
            data = {
                addr: {str(uid): pred for uid, pred in preds.items()}
                for addr, preds in self.pending_verifications.items()
            }
            with open(path, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save pending: {e}")

    def _load_pending(self):
        """Load pending verifications from disk."""
        try:
            path = self.data_dir / "pending_verifications.json"
            if path.exists():
                with open(path, "r") as f:
                    data = json.load(f)
                for addr, preds in data.items():
                    for uid_str, pred in preds.items():
                        self.pending_verifications[addr][int(uid_str)] = pred
                logger.info(
                    f"📂 Loaded {len(self.pending_verifications)} "
                    f"pending verifications"
                )
        except Exception as e:
            logger.error(f"Failed to load pending: {e}")

    def run(self):
        """Start the validator main loop."""
        logger.info("🚀 Starting RugIntel Validator...")

        loop = asyncio.get_event_loop()

        try:
            while True:
                # Sync metagraph
                self.metagraph.sync(subtensor=self.subtensor)

                # Phase 1: Query miners for new tokens
                loop.run_until_complete(self.forward())

                # Phase 2: Verify ground truth and set weights
                loop.run_until_complete(self.verify_and_set_weights())

                # Wait before next cycle
                interval = getattr(
                    self.config, 'verification_interval', 300
                )
                logger.info(f"💤 Sleeping {interval}s until next cycle...")
                time.sleep(interval)

        except KeyboardInterrupt:
            logger.info("🛑 Validator shutting down...")
            loop.run_until_complete(self.verifier.close())


# ── Entry Point ────────────────────────────────────────────
if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    )

    validator = RugIntelValidator()
    validator.run()
