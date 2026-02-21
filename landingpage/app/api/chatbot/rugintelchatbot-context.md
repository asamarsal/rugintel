# RugIntel Knowledge Base

## Overview

RugIntel is a decentralized intelligence subnet on the Bittensor network. Its primary mission is to protect DeFi users, specifically on the Solana blockchain, from rugpulls and malicious token deployments.

## Core Mechanism

- **Miners:** Produces verified rugpull prediction intelligence by running a 12-layer fusion engine off-chain.
- **Validators:** Verify miner predictions against 24-hour ground truth outcomes and set on-chain weights.
- **Incentive:** Miners are rewarded with TAO tokens based on their prediction accuracy (accuracy = revenue).

## The 12 Intelligence Layers

RugIntel analyzes tokens using 12 non-overlapping intelligence layers:

1. **Layer 01: Social Intelligence:** Detects coordinated pump activity on Twitter/Telegram (pump detection).
2. **Layer 02: Liquidity Intelligence:** Analyzes real-time liquidity drain patterns (strongest predictive power).
3. **Layer 03: Wallet Intelligence:** Fingerprints holder concentration and developer history.
4. **Layer 04: Market Intelligence:** Detects volume spikes and wash trading.
5. **Layer 05: Contract Intelligence:** Integrates with RugCheck/TokenSniffer for static analysis (mint/freeze authority).
6. **Layer 06: Visual Intelligence:** Identifies AI-generated logos and typosquatting.
7. **Layer 07: Temporal Intelligence:** Models FOMO peaks and behavioral economics (68% rugpulls happen <12m).
8. **Layer 08-11:** Advanced analysis (Cross-chain, Exchange Flow, MEV, Tokenomics).
9. **Layer 12: Adversarial Learning:** Self-improving network that learns from missed rugpulls.

## Business Model

- **Retail:** Free basic scans for everyone.
- **Pro ($99/mo):** Unlimited real-time alerts for active traders.
- **Institutional ($499/mo):** API access for Hedge Funds and Market Makers.

## For Developers & Participants

- **Miners:** Need Ubuntu 22.04 VPS (2vCPU, 4GB RAM), Solana RPC, and API keys.
- **Validators:** Need Ubuntu 22.04 VPS (4vCPU, 8GB RAM) and minimum 3,000 TAO stake.

## FAQ

- **How is TAO distributed?** Automatically via Yuma Consensus based on validator weights.
- **Why 24-hour verification?** To observe the final outcome (did the token actually rug?) for ground truth calibration.
