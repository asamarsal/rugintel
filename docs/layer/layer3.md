# Layer 03: Wallet Intelligence (20% Weight)

Wallet Intelligence is the "Detective" layer. It focuses on identifying the individuals behind the token by analyzing their previous transaction history and the relationships between top holders.

---

## 1. Screening Methodology

This layer uses graph-based analysis to find hidden connections:

1. **Historical Fingerprinting:** Checking if the deployer wallet (or its funding source) is linked to previous failed launches.
2. **Cluster Detection:** Identifying "Sybil" attacks where one person uses 100+ wallets to make the token look popular.
3. **Sniper Analysis:** Identifying bot activity that buys up supply before retail investors can participate.

---

## 2. Key Parameters & Thresholds

| Parameter            | Threshold          | Influence    | Detection Logic                                                       |
| :------------------- | :----------------- | :----------- | :-------------------------------------------------------------------- |
| **Deployer History** | >3 Failed Coins    | 🔴 CRITICAL  | If the dev has launched rugs before, this is a "Serial Rugger" alert. |
| **Top 10 Supply**    | > 50% Supply       | 🔴 High Risk | High concentration allows insiders to "dump" the price instantly.     |
| **Supply Source**    | Same Parent Wallet | 🔴 High Risk | Flags if top holders all received their funds from the same source.   |
| **Sniper Impact**    | > 15% in <0.5s     | 🔴 High Risk | Bots own too much supply; they will use retail as exit liquidity.     |
| **Holder Diversity** | Top 10 < 20%       | 🟢 Safe      | Distributed supply indicates a fair launch and lower crash risk.      |
| **Veteran Dev**      | >2 Long-term Coins | ✅ SECURE    | History of "Honest" launches builds significant trust.                |

---

## 3. Logical Screening Scenarios

### 🔴 High Risk (Rugpull Probability Boost)

- **The "Family" Cluster:** 5 wallets buy 5% each within the same block. Tracking back their funds reveals they were all funded by the same "Master Wallet" 10 minutes prior.
- **The Serial Rugger:** Deployer `0xABC...` has a history of 5 tokens on Raydium that all lasted <15 minutes before the LP was pulled.
- **The Sniper Wall:** 30% of the supply is held by addresses that bought at exactly Block 0.

### 🟢 Low Risk (Safe Indicator)

- **Known Entity:** Deployer wallet is linked to a public profile or has a "reputation score" from previous successful cycles.
- **Organic Distribution:** Tokens are bought by hundreds of unique wallets with varied transaction histories and balances.

---

## 4. Technical Requirements for Miners

Miners in this layer must be experts in **On-Chain Data Science**.

### A. Graph Database (e.g., Neo4j)

- **Usage:** Miners often maintain a graph of wallet relationships to detect "Spider" networks (one wallet funding many).
- **Tooling:** Using Python libraries like `NetworkX` to calculate clustering coefficients.

### B. High-Performance Indexing

- **BitQuery / Birdeye API:** To quickly pull the "Top Holders" list and their previous transaction count.
- **Solana Digital Asset Standard (DAS) API:** To fetch all tokens ever held by a specific wallet to build a "Reputation Profile".

### C. Large-Scale Blacklist

- **Logic:** Building an internal "Serial Rugger Database" by tagging every wallet involved in a 99% price crash.

---

## 5. Scoring Formula (Layer 03)

`L3_Score = (History_Penalty * 0.5) + (Clustering_Penalty * 0.3) + (Sniper_Penalty * 0.2)`

**PRO TIP for Miners:** Finding a link to a "Master Rugger" wallet is the most valuable signal. This can lead to a 100% accurate prediction even if other layers look green.
