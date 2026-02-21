"""
RugIntel Miner — Bittensor Subnet Entry Point

The miner is an intelligence commodity producer:
1. Receives RugIntelSynapse requests from validators via Axon
2. Runs 12-layer intelligence fusion entirely off-chain
3. Returns risk scores, confidence, evidence, and timing estimates
4. Earns TAO via Yuma Consensus based on prediction accuracy

Usage:
    python neurons/miner.py \\
        --netuid <SUBNET_UID> \\
        --wallet.name rugintel_wallet \\
        --wallet.hotkey miner_hotkey \\
        --subtensor.network test \\
        --axon.port 8091
"""

import sys
import os
import asyncio
import logging

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import bittensor as bt
from rugintel.protocol import RugIntelSynapse
from rugintel.intelligence import TwelveLayerFusion

logger = logging.getLogger(__name__)


class RugIntelMiner:
    """
    RugIntel Miner: Off-chain intelligence commodity producer.

    Receives token analysis requests from validators,
    runs the 12-layer fusion engine, and returns risk assessments.
    This is the commodity that gets priced by Yuma Consensus.
    """

    def __init__(self, config=None):
        """Initialize miner with Bittensor config and fusion engine."""
        # Parse Bittensor config
        self.config = config or bt.config()
        self.config.merge(RugIntelMiner.add_args())

        # Setup Bittensor components
        self.wallet = bt.wallet(config=self.config)
        self.subtensor = bt.subtensor(config=self.config)
        self.metagraph = self.subtensor.metagraph(
            netuid=self.config.netuid
        )

        # Initialize Axon (endpoint that validators query)
        self.axon = bt.axon(
            wallet=self.wallet,
            config=self.config,
        )

        # Attach synapse handler
        self.axon.attach(
            forward_fn=self.forward,
            blacklist_fn=self.blacklist,
        )

        # Initialize the 12-layer analysis engine
        self.fusion_engine = TwelveLayerFusion()

        logger.info("✅ RugIntel Miner initialized")
        logger.info(f"   Wallet: {self.wallet.name}")
        logger.info(f"   Hotkey: {self.wallet.hotkey.ss58_address}")
        logger.info(f"   Subnet: {self.config.netuid}")

    @staticmethod
    def add_args():
        """Add miner-specific CLI arguments."""
        parser = bt.config.parser()
        parser.add_argument("--netuid", type=int, required=True,
                          help="RugIntel subnet UID")
        return bt.config(parser)

    async def forward(self, synapse: RugIntelSynapse) -> RugIntelSynapse:
        """
        Handle incoming analysis request from a validator.

        This is the core miner function:
        1. Receive token address from validator
        2. Run 12-layer off-chain analysis
        3. Return risk assessment (the commodity)

        Args:
            synapse: RugIntelSynapse with token_address and launch_timestamp

        Returns:
            Same synapse populated with risk_score, confidence, evidence
        """
        logger.info(
            f"📥 Received request: {synapse.token_address[:16]}... "
            f"(launched {synapse.launch_timestamp})"
        )

        try:
            # Run the 12-layer fusion engine (all off-chain)
            result = await self.fusion_engine.analyze(
                token_address=synapse.token_address,
                launch_timestamp=synapse.launch_timestamp,
            )

            # Populate output fields
            synapse.risk_score = result["risk_score"]
            synapse.confidence = result["confidence"]
            synapse.evidence = result["evidence"]
            synapse.time_to_rugpull = result["time_to_rugpull"]

            logger.info(
                f"📤 Response: risk={result['risk_score']:.4f}, "
                f"confidence={result['confidence']:.4f}, "
                f"timing={result['time_to_rugpull']}h"
            )

        except Exception as e:
            logger.error(f"❌ Analysis failed: {e}")
            # Return partial result on failure
            synapse.risk_score = 0.5
            synapse.confidence = 0.0
            synapse.evidence = {"error": str(e)}

        return synapse

    def blacklist(self, synapse: RugIntelSynapse) -> tuple:
        """
        Blacklist check for incoming requests.

        Only allow registered validators to query this miner.
        """
        caller_hotkey = synapse.dendrite.hotkey

        if caller_hotkey not in self.metagraph.hotkeys:
            return True, "Caller not registered in subnet"

        return False, ""

    def run(self):
        """Start the miner and begin serving requests."""
        logger.info("🚀 Starting RugIntel Miner...")

        # Serve the Axon endpoint
        self.axon.serve(
            netuid=self.config.netuid,
            subtensor=self.subtensor,
        )

        self.axon.start()
        logger.info(f"🟢 Miner serving on port {self.config.axon.port}")

        # Keep running
        try:
            while True:
                # Sync metagraph periodically
                self.metagraph.sync(subtensor=self.subtensor)
                import time
                time.sleep(60)  # Sync every 60 seconds
        except KeyboardInterrupt:
            logger.info("🛑 Miner shutting down...")
            self.axon.stop()
            asyncio.get_event_loop().run_until_complete(
                self.fusion_engine.close()
            )


# ── Entry Point ────────────────────────────────────────────
if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    )

    miner = RugIntelMiner()
    miner.run()
