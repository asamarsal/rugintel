# 📖 Complete Guide: How to Build, Use, and Deploy RugIntel on Bittensor

## Table of Contents

- [Core Concepts](#core-concepts)
- [Prerequisites](#prerequisites)
- [Step 1: Environment Setup](#step-1-environment-setup)
- [Step 2: Creating a Bittensor Wallet](#step-2-creating-a-bittensor-wallet)
- [Step 3: Building the RugIntel Miner](#step-3-building-the-rugintel-miner)
- [Step 4: Building the RugIntel Validator](#step-4-building-the-rugintel-validator)
- [Step 5: Registering the Subnet](#step-5-registering-the-subnet)
- [Step 6: Running Miner & Validator](#step-6-running-miner--validator)
- [Step 7: Reward Mechanism & Yuma Consensus](#step-7-reward-mechanism--yuma-consensus)
- [Complete Workflow](#complete-workflow)
- [FAQ](#faq)

---

## Core Concepts

### What is RugIntel?

RugIntel is a **decentralized digital commodity market** on the Bittensor network. The commodity traded in this market is **verified rugpull prediction intelligence** — not a simple tool or API.

### How Does RugIntel Work on Bittensor?

```
┌───────────────────────────────────────────────────────┐
│          Bittensor Subtensor (On-Chain)               │
│  ┌────────────────────────────────────────────────┐   │
│  │  Yuma Consensus → Automatic TAO Distribution   │   │
│  │  (No human intervention; mathematically         │   │
│  │   enforced by the blockchain)                   │   │
│  └──────────────────────┬─────────────────────────┘   │
│                         ▲                             │
│                         │ set_weights()               │
│  ┌──────────────────────┴─────────────────────────┐   │
│  │          RugIntel Subnet (Off-Chain)            │   │
│  │                                                 │   │
│  │   Miner ──(risk prediction)──▶ Validator        │   │
│  │     │                              │            │   │
│  │     ▼                              ▼            │   │
│  │   Solana RPC               24h Verification     │   │
│  │   RugCheck API             Ground Truth         │   │
│  │   DexScreener                                   │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

**Key principles:**

- **Miner** = Intelligence commodity producer (runs 12-layer analysis)
- **Validator** = Commodity quality verifier (ensures prediction accuracy)
- **Yuma Consensus** = On-chain mechanism that automatically distributes TAO based on weights
- **TAO** = Reward token that miners receive for accurate predictions

> ⚠️ **Important:** Validators do NOT distribute TAO directly. Validators only `set_weights()` → Yuma Consensus calculates emission → Blockchain distributes TAO automatically.

---

## Prerequisites

Before starting, make sure you have:

| Requirement       | Details                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Python**        | Version 3.9 or later                                                                                                      |
| **Bittensor SDK** | `pip install bittensor`                                                                                                   |
| **Solana RPC**    | Endpoint for accessing Solana on-chain data (free via [Helius](https://helius.dev) or [QuickNode](https://quicknode.com)) |
| **API Keys**      | RugCheck API, DexScreener API (optional: Twitter API)                                                                     |
| **Hardware**      | Minimum: VPS 2 CPU, 4GB RAM, 50GB SSD                                                                                     |
| **TAO**           | Some TAO for subnet registration and staking                                                                              |

---

## Step 1: Environment Setup

### 1.1 Install Python and Dependencies

```bash
# Ensure Python 3.9+ is installed
python --version

# Create virtual environment
python -m venv rugintel-env
source rugintel-env/bin/activate  # Linux/Mac
# or
rugintel-env\Scripts\activate     # Windows

# Install Bittensor SDK
pip install bittensor

# Install additional dependencies
pip install aiohttp solana requests numpy
```

### 1.2 Clone the RugIntel Repository

```bash
git clone https://github.com/your-org/rugintel.git
cd rugintel

# Install project dependencies
pip install -r requirements.txt

# Copy configuration
cp .env.example .env
```

### 1.3 Configure Environment Variables

Edit the `.env` file with the following settings:

```env
# Bittensor
BITTENSOR_NETWORK=finney          # or "test" for testnet
SUBNET_NETUID=<SUBNET_UID>        # RugIntel subnet UID

# Solana RPC
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_RPC_WSS=wss://api.mainnet-beta.solana.com

# API Keys
RUGCHECK_API_KEY=<your_key>
DEXSCREENER_API_URL=https://api.dexscreener.com/latest/dex
TWITTER_BEARER_TOKEN=<your_token>  # Optional: for Layer 1 (Social Intelligence)
```

---

## Step 2: Creating a Bittensor Wallet

### 2.1 Create Coldkey & Hotkey

```bash
# Create coldkey (master key — store securely!)
btcli wallet new_coldkey --wallet.name rugintel_wallet

# Create hotkey (operational key for miner/validator)
btcli wallet new_hotkey --wallet.name rugintel_wallet --wallet.hotkey rugintel_hotkey
```

### 2.2 Check Wallet Balance

```bash
btcli wallet balance --wallet.name rugintel_wallet
```

> 💡 **Tip:** You need TAO to register a subnet and stake. Purchase TAO through supported exchanges (e.g., MEXC, Gate.io).

---

## Step 3: Building the RugIntel Miner

The miner is an **intelligence commodity producer**. Its job is to run 12-layer analysis on Solana tokens and produce risk scores.

### 3.1 Basic Miner Structure

Create the file `neurons/miner.py`:

```python
import bittensor as bt
from rugintel.protocol import RugIntelSynapse
from rugintel.intelligence import TwelveLayerFusion

class RugIntelMiner(bt.Miner):
    """
    RugIntel Miner: Runs 12-layer intelligence fusion off-chain.
    Receives requests from validators, analyzes tokens, returns risk scores.
    """

    def __init__(self, config=None):
        super().__init__(config=config)
        # Initialize the 12-layer analysis engine
        self.fusion_engine = TwelveLayerFusion()

    def forward(self, synapse: RugIntelSynapse) -> RugIntelSynapse:
        """
        Called when a validator sends a token analysis request.

        Input: synapse containing token_address and launch_timestamp
        Output: synapse with risk_score, confidence, evidence, time_to_rugpull
        """
        # Run 12-layer analysis (all off-chain)
        result = self.fusion_engine.analyze(
            token_address=synapse.token_address,
            launch_timestamp=synapse.launch_timestamp
        )

        # Populate results into synapse
        synapse.risk_score = result["risk_score"]           # 0.0 - 1.0
        synapse.confidence = result["confidence"]           # Confidence interval
        synapse.evidence = result["evidence"]               # Supporting evidence dict
        synapse.time_to_rugpull = result["time_to_rugpull"] # Estimated time to rugpull

        return synapse  # Commodity sent back to validator

# Entry point
if __name__ == "__main__":
    miner = RugIntelMiner()
    miner.run()
```

### 3.2 Implementing the 12-Layer Intelligence Fusion

Create the file `rugintel/intelligence.py`:

```python
class TwelveLayerFusion:
    """
    12-layer analysis engine that runs entirely off-chain.
    Each layer analyzes a different aspect of Solana tokens.
    """

    # Weight per layer based on predictive strength
    WEIGHTS = {
        "liquidity": 0.25,      # Layer 2: Highest predictive power
        "wallet": 0.20,         # Layer 3: Strong insider activity signal
        "temporal": 0.20,       # Layer 7: Critical for timing prediction
        "contract": 0.15,       # Layer 5: Necessary but not sufficient alone
        "market": 0.10,         # Layer 4: Supporting signal
        "social": 0.07,         # Layer 1: Noisy but valuable when correlated
        "visual": 0.03,         # Layer 6: Weak signal in isolation
    }

    async def analyze(self, token_address: str, launch_timestamp: int) -> dict:
        """Run all 12 layers and fuse the results."""

        # Collect scores from each layer (parallel)
        layer_scores = await asyncio.gather(
            self.layer1_social(token_address),       # Twitter/Telegram pump detection
            self.layer2_liquidity(token_address),     # Liquidity drain patterns
            self.layer3_wallet(token_address),        # Holder concentration & deployer history
            self.layer4_market(token_address),        # Volume spikes & wash trading
            self.layer5_contract(token_address),      # RugCheck/TokenSniffer API
            self.layer6_visual(token_address),        # AI-generated logos & typosquatting
            self.layer7_temporal(token_address, launch_timestamp),  # FOMO peak
        )

        # Fuse scores with weighted average
        fused_score = self._fuse_scores(layer_scores)

        return {
            "risk_score": fused_score,
            "confidence": self._calculate_confidence(layer_scores),
            "evidence": self._compile_evidence(layer_scores),
            "time_to_rugpull": self._estimate_timing(layer_scores),
        }

    def _fuse_scores(self, layer_scores: list) -> float:
        """Combine scores from all layers using weighted average."""
        layer_names = ["social", "liquidity", "wallet", "market",
                       "contract", "visual", "temporal"]

        fused = sum(
            self.WEIGHTS[name] * score
            for name, score in zip(layer_names, layer_scores)
        )
        return round(min(max(fused, 0.0), 1.0), 4)

    # ─── Layer Implementations ─────────────────────────────────

    async def layer1_social(self, token_address: str) -> float:
        """Layer 1: Detect coordinated pump activity on Twitter/Telegram."""
        # Query Twitter API for token mentions
        # Analyze patterns: many new accounts posting simultaneously = pump signal
        # Return score 0.0 (safe) - 1.0 (highly suspicious)
        pass

    async def layer2_liquidity(self, token_address: str) -> float:
        """Layer 2: Analyze real-time liquidity drain patterns."""
        # Query Solana RPC for liquidity pool data (Raydium, Orca)
        # Detect: sudden LP unlock, rapidly declining LP ratio
        # Return score 0.0 - 1.0
        pass

    async def layer3_wallet(self, token_address: str) -> float:
        """Layer 3: Fingerprint holder concentration & deployer history."""
        # Query Solana RPC for holder distribution
        # Check deployer wallet history: has it deployed rugpull tokens before?
        # Return score 0.0 - 1.0
        pass

    async def layer4_market(self, token_address: str) -> float:
        """Layer 4: Detect volume spikes & wash trading."""
        # Query DexScreener API for volume data
        # Detect: very high volume but few holders = wash trading
        # Return score 0.0 - 1.0
        pass

    async def layer5_contract(self, token_address: str) -> float:
        """Layer 5: Integrate RugCheck/TokenSniffer API."""
        # Query RugCheck.xyz API
        # Check: hidden mint functions, honeypot mechanisms, etc.
        # Return score 0.0 - 1.0
        pass

    async def layer6_visual(self, token_address: str) -> float:
        """Layer 6: Detect AI-generated logos & typosquatting."""
        # Download token logo from metadata
        # Analyze: is the logo AI-generated? Is the name similar to popular tokens?
        # Return score 0.0 - 1.0
        pass

    async def layer7_temporal(self, token_address: str, launch_ts: int) -> float:
        """Layer 7: Model FOMO peak & behavioral economics."""
        # Analyze temporal patterns: when does peak volume occur?
        # Detect: classic pump-and-dump patterns based on timing
        # Return score 0.0 - 1.0
        pass
```

### 3.3 Protocol Definition (Synapse)

Create the file `rugintel/protocol.py`:

```python
import bittensor as bt
from typing import Optional

class RugIntelSynapse(bt.Synapse):
    """
    Communication protocol between Miner and Validator.
    This synapse is sent by Validators to Miners via Axon RPC.
    """
    # Input from Validator
    token_address: str = ""              # Solana token address to analyze
    launch_timestamp: int = 0             # Token launch timestamp

    # Output from Miner (populated by the miner)
    risk_score: Optional[float] = None    # Rugpull risk score (0.0 - 1.0)
    confidence: Optional[float] = None    # Confidence interval (0.0 - 1.0)
    evidence: Optional[dict] = None       # Supporting evidence per layer
    time_to_rugpull: Optional[float] = None  # Estimated time to rugpull (in hours)
```

---

## Step 4: Building the RugIntel Validator

The validator is a **commodity quality verifier**. Its job is to send requests to miners, verify results against ground truth, and set weights on-chain.

### 4.1 Basic Validator Structure

Create the file `neurons/validator.py`:

```python
import bittensor as bt
import asyncio
from rugintel.protocol import RugIntelSynapse
from rugintel.verification import GroundTruthVerifier

class RugIntelValidator(bt.Validator):
    """
    RugIntel Validator: Verifies miner predictions against ground truth.

    IMPORTANT: Validators do NOT distribute TAO directly.
    Validators only set_weights() → Yuma Consensus calculates emission →
    Blockchain auto-distributes TAO.
    """

    def __init__(self, config=None):
        super().__init__(config=config)
        self.verifier = GroundTruthVerifier()
        self.pending_verifications = {}  # token_address → {miner_uid: prediction}

    async def forward(self):
        """
        Main validator loop:
        1. Select new tokens to analyze
        2. Send requests to 3+ miners
        3. Store predictions for 24-hour verification
        """
        # Get list of newly launched tokens on Solana
        new_tokens = await self.verifier.get_new_tokens()

        for token in new_tokens:
            # Create synapse request
            synapse = RugIntelSynapse(
                token_address=token["address"],
                launch_timestamp=token["timestamp"]
            )

            # Query 3+ miners in parallel via Axon
            responses = await self.dendrite.forward(
                axons=self.metagraph.axons,  # All registered miners
                synapse=synapse,
                timeout=30
            )

            # Store each miner's prediction for later verification
            for uid, response in zip(self.metagraph.uids, responses):
                if response.risk_score is not None:
                    self.pending_verifications.setdefault(
                        token["address"], {}
                    )[uid] = {
                        "risk_score": response.risk_score,
                        "confidence": response.confidence,
                        "timestamp": token["timestamp"]
                    }

    async def verify_and_set_weights(self):
        """
        Verify ground truth after 24 hours and set weights on-chain.

        Flow:
        1. Check tokens that are 24h old → did they actually rugpull?
        2. Compare miner predictions against reality
        3. Calculate accuracy score per miner
        4. Set weights on-chain → Yuma Consensus auto-distributes TAO
        """
        scores = {}

        for token_address, predictions in self.pending_verifications.items():
            # Check ground truth: did this token rugpull within 24 hours?
            ground_truth = await self.verifier.check_24h_outcome(token_address)

            if ground_truth is None:
                continue  # Not yet 24h, skip

            for miner_uid, prediction in predictions.items():
                # Calculate accuracy: how close was the prediction to reality
                accuracy = self.verifier.calculate_accuracy(
                    predicted_risk=prediction["risk_score"],
                    actual_rugpull=ground_truth["is_rugpull"],
                    liquidity_drained=ground_truth["liquidity_drained"],
                    funds_moved=ground_truth["funds_moved_to_exchange"]
                )

                # Accumulate scores per miner
                scores[miner_uid] = scores.get(miner_uid, [])
                scores[miner_uid].append(accuracy)

        # Average scores and set weights on-chain
        if scores:
            weights = {
                uid: sum(s) / len(s) for uid, s in scores.items()
            }

            # SET WEIGHTS ON-CHAIN
            # Yuma Consensus will aggregate weights from all validators
            # and AUTOMATICALLY distribute TAO to miners
            self.subtensor.set_weights(
                netuid=self.config.netuid,
                wallet=self.wallet,
                uids=list(weights.keys()),
                weights=list(weights.values())
            )

            bt.logging.info(f"✅ Weights set for {len(weights)} miners")

# Entry point
if __name__ == "__main__":
    validator = RugIntelValidator()
    validator.run()
```

### 4.2 Ground Truth Verifier

Create the file `rugintel/verification.py`:

```python
import aiohttp
from datetime import datetime, timedelta

class GroundTruthVerifier:
    """
    Verifies whether rugpull predictions were correct after 24 hours.

    Verification data sources (cross-source):
    - Solana RPC: check on-chain liquidity status
    - RugCheck API: check latest token security status
    - DexScreener: check trading activity
    """

    async def check_24h_outcome(self, token_address: str) -> dict | None:
        """
        Check whether a token actually rugpulled within 24 hours.
        Returns None if 24 hours have not yet passed.
        """
        # Check if 24 hours have elapsed since launch
        if not self._is_24h_passed(token_address):
            return None

        # Cross-verify from 3 sources
        solana_check = await self._check_solana_rpc(token_address)
        rugcheck_result = await self._check_rugcheck_api(token_address)
        dex_result = await self._check_dexscreener(token_address)

        return {
            "is_rugpull": self._determine_rugpull(
                solana_check, rugcheck_result, dex_result
            ),
            "liquidity_drained": solana_check.get("lp_removed", False),
            "funds_moved_to_exchange": solana_check.get("cex_deposit", False),
            "price_drop_percent": dex_result.get("price_change_24h", 0),
        }

    def calculate_accuracy(self, predicted_risk, actual_rugpull,
                          liquidity_drained, funds_moved) -> float:
        """
        Calculate miner prediction accuracy.

        Examples:
        - Miner predicted risk_score=0.95, token actually rugpulled → high accuracy
        - Miner predicted risk_score=0.10, token actually rugpulled → low accuracy
        - Miner predicted risk_score=0.90, token turned out safe → false positive
        """
        if actual_rugpull:
            # True positive: higher risk_score = more accurate
            return predicted_risk
        else:
            # True negative: lower risk_score = more accurate
            return 1.0 - predicted_risk

    async def _check_solana_rpc(self, token_address: str) -> dict:
        """Query Solana RPC for liquidity status."""
        # Check: was LP removed? Were funds moved to a CEX?
        pass

    async def _check_rugcheck_api(self, token_address: str) -> dict:
        """Query RugCheck API for token security status."""
        pass

    async def _check_dexscreener(self, token_address: str) -> dict:
        """Query DexScreener for 24-hour price and volume data."""
        pass
```

---

## Step 5: Registering the Subnet

### 5.1 Register on Testnet (for development)

```bash
# Register a new subnet on testnet
btcli subnet create --wallet.name rugintel_wallet --subtensor.network test

# Note the assigned NETUID (e.g., 123)
```

### 5.2 Register Miner & Validator to the Subnet

```bash
# Register as a miner
btcli subnet register \
  --wallet.name rugintel_wallet \
  --wallet.hotkey miner_hotkey \
  --netuid <SUBNET_UID> \
  --subtensor.network test

# Register as a validator
btcli subnet register \
  --wallet.name rugintel_wallet \
  --wallet.hotkey validator_hotkey \
  --netuid <SUBNET_UID> \
  --subtensor.network test
```

### 5.3 Staking TAO (for Validators)

```bash
# Validators need to stake TAO to be able to set weights
btcli stake add \
  --wallet.name rugintel_wallet \
  --wallet.hotkey validator_hotkey \
  --amount <TAO_AMOUNT>
```

---

## Step 6: Running Miner & Validator

### 6.1 Running the Miner

```bash
python neurons/miner.py \
  --netuid <SUBNET_UID> \
  --wallet.name rugintel_wallet \
  --wallet.hotkey miner_hotkey \
  --subtensor.network test \
  --axon.port 8091 \
  --logging.trace
```

**What happens when the miner is running:**

1. Miner registers its Axon endpoint (gRPC/HTTP) to the network
2. Validator sends `RugIntelSynapse` containing the token address
3. Miner runs 12-layer analysis entirely off-chain
4. Miner returns risk score + evidence to the validator

### 6.2 Running the Validator

```bash
python neurons/validator.py \
  --netuid <SUBNET_UID> \
  --wallet.name rugintel_wallet \
  --wallet.hotkey validator_hotkey \
  --subtensor.network test \
  --logging.trace
```

**What happens when the validator is running:**

1. Validator fetches list of newly launched tokens from Solana
2. Validator sends requests to 3+ miners per token
3. After 24 hours, validator checks ground truth (did the token actually rugpull?)
4. Validator calculates accuracy score for each miner
5. Validator calls `set_weights()` on-chain
6. **Yuma Consensus automatically distributes TAO** to miners based on weights

---

## Step 7: Reward Mechanism & Yuma Consensus

### How is TAO Distributed?

```
Miner sends prediction
        │
        ▼
Validator receives and stores prediction
        │
        ▼
(Wait 24 hours)
        │
        ▼
Validator checks ground truth:
  - Did the token rugpull? (Solana RPC)
  - Was liquidity drained? (RugCheck)
  - Did the price drop >90%? (DexScreener)
        │
        ▼
Validator calculates accuracy score per miner
        │
        ▼
Validator calls set_weights() on-chain
        │
        ▼
┌─────────────────────────────────────────┐
│  YUMA CONSENSUS (On-Chain, Automatic)   │
│                                         │
│  • Aggregates weights from ALL          │
│    validators                           │
│  • Calculates proportional TAO emission │
│  • Distributes TAO to miners            │
│    automatically                        │
│  • NO human intervention                │
└─────────────────────────────────────────┘
        │
        ▼
Miner receives TAO (accuracy = revenue)
```

### Why is Yuma Consensus Important?

| Aspect                | Explanation                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- |
| **Agnostic**          | Doesn't care WHAT is being measured — could be rugpull prediction or any commodity |
| **Fuzzy Consensus**   | Capable of reaching consensus on probabilistic truths (like predictions)           |
| **Anti-Manipulation** | Validators that deviate from ground truth will lose rewards                        |
| **Automatic**         | TAO distribution without anyone's intervention                                     |

---

## Complete Workflow

### Scenario: New Token "SCAMCOIN" Launched

```
1. Token SCAMCOIN launches on Solana (timestamp: T0)
        │
2. Validator detects new token via Solana RPC
        │
3. Validator sends RugIntelSynapse to 3 Miners:
   ┌──────────────────────────────────────────┐
   │ token_address: "SCAMCOIN..."             │
   │ launch_timestamp: T0                     │
   └──────────────────────────────────────────┘
        │
4. Each Miner runs 12-layer analysis:
   ┌──────────────────────────────────────────┐
   │ Miner A:                                 │
   │   Layer 2 (Liquidity): 0.92 ← LP unlock  │
   │   Layer 3 (Wallet): 0.85 ← 1 wallet 80% │
   │   Layer 5 (Contract): 0.78 ← honeypot   │
   │   ... (other layers)                      │
   │   Fused Score: 0.87 (HIGH RISK)          │
   │                                           │
   │ Miner B: Fused Score: 0.91               │
   │ Miner C: Fused Score: 0.45               │
   └──────────────────────────────────────────┘
        │
5. Validator stores predictions, waits 24 hours
        │
6. After 24 hours (T0 + 24h):
   ┌──────────────────────────────────────────┐
   │ Ground Truth Check:                      │
   │   ✅ Liquidity drained 100%              │
   │   ✅ Funds moved to Binance              │
   │   ✅ Price dropped 99.8%                 │
   │   VERDICT: RUGPULL CONFIRMED ✅           │
   └──────────────────────────────────────────┘
        │
7. Validator calculates accuracy:
   ┌──────────────────────────────────────────┐
   │ Miner A: predicted 0.87 vs actual rug   │
   │   → Accuracy: 0.87 (GOOD)               │
   │                                           │
   │ Miner B: predicted 0.91 vs actual rug   │
   │   → Accuracy: 0.91 (EXCELLENT)           │
   │                                           │
   │ Miner C: predicted 0.45 vs actual rug   │
   │   → Accuracy: 0.45 (POOR - failed)      │
   └──────────────────────────────────────────┘
        │
8. Validator set_weights() on-chain:
   weights = {Miner_A: 0.87, Miner_B: 0.91, Miner_C: 0.45}
        │
9. Yuma Consensus auto-distributes TAO:
   Miner B receives the most TAO (most accurate)
   Miner A receives a good amount of TAO
   Miner C receives the least TAO
```

---

## Project Folder Structure

```
rugintel/
├── neurons/
│   ├── miner.py              # Miner entry point
│   └── validator.py           # Validator entry point
├── rugintel/
│   ├── __init__.py
│   ├── protocol.py            # RugIntelSynapse definition
│   ├── intelligence.py        # 12-Layer Fusion Engine
│   ├── verification.py        # Ground Truth Verifier
│   └── layers/
│       ├── layer1_social.py    # Twitter/Telegram detection
│       ├── layer2_liquidity.py # Drain pattern analysis
│       ├── layer3_wallet.py    # Holder fingerprinting
│       ├── layer4_market.py    # Wash trading detection
│       ├── layer5_contract.py  # RugCheck/TokenSniffer
│       ├── layer6_visual.py    # AI logo detection
│       └── layer7_temporal.py  # FOMO peak modeling
├── tests/
│   ├── test_miner.py
│   ├── test_validator.py
│   └── test_layers.py
├── .env.example
├── requirements.txt
├── README.md
└── image/
    └── rugintel.png
```

---

## FAQ

### ❓ Do I need to build my own blockchain?

**No.** RugIntel runs as a subnet on top of Bittensor. All intelligence logic runs **off-chain** (on your server). Only `set_weights()` interacts with the Bittensor blockchain (subtensor).

### ❓ How much does it cost to run a miner?

Estimated infrastructure cost is around **$5/month** (basic VPS). With accurate predictions, potential earnings can reach **$1,133/month** in TAO.

### ❓ Do validators distribute TAO to miners?

**No.** Validators only set weights on-chain. **Yuma Consensus** calculates and distributes TAO automatically — without any human intervention.

### ❓ Why does verification require 24 hours?

Because ground truth takes time. After 24 hours, validators can definitively verify: did the token actually rugpull (liquidity drained, price dropped >90%, funds moved to an exchange)?

### ❓ Is the 12-layer architecture a Bittensor feature?

**No.** The 12-layer architecture is an intelligence framework **specific to RugIntel**, built **on top of** Bittensor's incentive mechanism. Bittensor provides the incentive infrastructure (Yuma Consensus, TAO emission); RugIntel provides the domain-specific logic.

### ❓ Why use Bittensor instead of building a standalone tool?

| Aspect      | Centralized Tool                 | RugIntel on Bittensor                   |
| ----------- | -------------------------------- | --------------------------------------- |
| Reliability | Single point of failure          | Decentralized, cannot be shut down      |
| Improvement | Static, depends on internal team | Self-improving via miner competition    |
| Trust       | Trust a single company           | Trustless via Yuma Consensus            |
| Cost        | $500/month (TokenSniffer API)    | Free for retail users                   |
| Adaptation  | Static heuristics                | Miners adapt because accuracy = revenue |

---

> 📌 **This document serves as a technical guide for building and deploying RugIntel on the Bittensor network. For more information about Bittensor, visit [bittensor.com](https://bittensor.com).**
