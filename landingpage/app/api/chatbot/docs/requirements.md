# RugIntel Subnet — Infrastructure & Financial Requirements

This document provides the technical specifications, API requirements, and financial estimates for participating in the RugIntel Subnet as a Miner or Validator.

---

## 🖥️ Hardware Requirements (VPS)

Running a node requires a stable VPS with Ubuntu 22.04 LTS.

| Component        | Miner (Detection) | Validator (Verification) | Recommended Provider |
| :--------------- | :---------------- | :----------------------- | :------------------- |
| **vCPU**         | 2 Core (Min)      | 4 Core (Min)             | Hetzner / Contabo    |
| **RAM**          | 4 GB              | 8 GB                     | -                    |
| **Storage**      | 20 GB SSD         | 50 GB SSD                | -                    |
| **Bandwidth**    | 1 TB / Month      | 2 TB / Month             | -                    |
| **Monthly Cost** | ~$5 – $7          | ~$12 – $15               | -                    |

---

## 🔑 API Requirements

Both roles require access to on-chain data and security scanners.

| API Provider    | Type            | Frequency | Free Tier Available?   |
| :-------------- | :-------------- | :-------- | :--------------------- |
| **Solana RPC**  | Blockchain Data | High      | ✅ (Helius, QuickNode) |
| **RugCheck**    | Security Audit  | Medium    | ✅ (Free API)          |
| **DexScreener** | Market Data     | Medium    | ✅ (Free API)          |
| **Twitter v2**  | Social (L1)     | Low       | ✅ (Optional)          |

> [!IMPORTANT]
> **Validators** generally require higher rate limits than Miners because they must query multiple miners and cross-verify all predictions against ground truth.

---

## 💰 Financial Requirements (TAO Budget)

Participating in the Bittensor network requires a small amount of TAO for registration and a larger amount for validating.

| Item               | Miner        | Validator   | Notes                       |
| :----------------- | :----------- | :---------- | :-------------------------- |
| **Reg. Cost**      | ~0.1 TAO     | ~0.1 TAO    | Dynamic cost (Burn)         |
| **Stake (Voting)** | 0 TAO        | ~100+ TAO   | **Required for validators** |
| **Emissions**      | High Revenue | Fee Sharing | Rewarded in TAO             |

---

## 📊 Estimated ROI (Return on Investment)

| Profile       | Startup Cost       | Operating Cost | Potential Monthly Revenue |
| :------------ | :----------------- | :------------- | :------------------------ |
| **Miner**     | ~$80 (0.2 TAO)     | ~$5 (VPS)      | **$100 - $1,100+**        |
| **Validator** | ~$40,000 (100 TAO) | ~$15 (VPS)     | **Stake Rewards + APY**   |

_Estimated based on TAO price of $400. Revenue depends on prediction accuracy and total subnet emission._

---

## 📁 Pre-Flight Checklist

### Common

- [ ] Wallet created (Coldkey + Hotkey).
- [ ] Wallet has sufficient TAO for registration.
- [ ] Docker & Python 3.9+ installed on VPS.
- [ ] `.env` file configured with RPC and API keys.

### Miner Specific

- [ ] Port 8091 (Axon) open in firewall.
- [ ] Registered on Netuid via `btcli subnet register`.

### Validator Specific

- [ ] Minimum 100 TAO staked to hotkey.
- [ ] Outbound connection to all miner endpoints verified.
