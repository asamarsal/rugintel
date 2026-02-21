# Layer 02: Liquidity Intelligence (25% Weight)

Liquidity Intelligence is the most critical technical layer. It focuses on the "physical" ability of the deployer to execute a rugpull by analyzing the Liquidity Pool (LP) status and depth.

---

## 1. Screening Methodology

This layer performs deep-chain analysis on the decentralized exchange (DEX) where the token is traded (e.g., Raydium, Orca on Solana; Uniswap on ETH).

1. **Security Audit:** Checking if the "Keys to the House" (LP Tokens) have been destroyed or locked.
2. **Dynamic Analysis:** Monitoring real-time LP transaction flows for withdrawal patterns.
3. **Market Depth Check:** Calculating how much capital is required to collapse the price.

---

## 2. Key Parameters & Thresholds

| Parameter           | Threshold        | Influence    | Detection Logic                                                       |
| :------------------ | :--------------- | :----------- | :-------------------------------------------------------------------- |
| **LP Burn Status**  | NOT Burnt        | 🔴 CRITICAL  | If LP tokens are in the deployer wallet, they can "pull" at any time. |
| **Lock Duration**   | < 1 Month        | 🔴 High Risk | Short locks are often used to gain fake trust before a delayed rug.   |
| **Large Removals**  | > 10% Vol        | 🔴 High Risk | Detects "Slow Rugging" where liquidity is drained in small batches.   |
| **Liq-to-MC Ratio** | < 5%             | 🔴 High Risk | "Thin" liquidity makes the price highly volatile and easy to crash.   |
| **Liq-to-MC Ratio** | > 20%            | 🟢 Safe      | High liquidity relative to market cap indicates a stable launch.      |
| **LP 100% Burnt**   | Address `111...` | ✅ SECURE    | Proves the liquidity is permanently locked and inaccessible.          |

---

## 3. Logical Screening Scenarios

### 🔴 High Risk (Rugpull Probability Boost)

- **The "Unlocked Trap":** Token has $100k volume but 0% of liquidity is locked or burnt. Deployer is waiting for a certain price target to pull.
- **Micro-Drainage:** Multiple LP removal transactions of 2-3% each, totaling >10% within 1 hour.
- **Flash-Liquidity:** Liquidity is added and immediately locked for only 24 hours (classic FOMO bait).

### 🟢 Low Risk (Safe Indicator)

- **The Gold Standard:** LP tokens are sent to a known burn address (`11111111111111111111111111111111`) immediately after the pool is created.
- **Deep Pools:** Liquidity depth is sufficient to withstand a $5,000 sell order with less than 2% price impact.

---

## 4. Technical Requirements for Miners

To run this layer effectively, Miners do **not** use social APIs. Instead, they require direct access to the blockchain ledger.

### A. Solana RPC Node (for SOL Tokens)

- **Usage:** Miners need a high-performance RPC provider (e.g., Helius, Triton, or Alchemy).
- **Function:** `getSignaturesForAddress` to track LP creation and `getTransaction` to analyze if LP tokens were transferred to a burn address.
- **API Cost:** Usually requires a paid tier for high-frequency requests during peak launch times.

### B. DEX SDKs

- **Raydium/Orca SDK:** Used to calculate real-time reserves in the pool and price impact (slippage).

### C. Geyser Plugin (Advanced)

- For top-tier miners, using a **Geyser** stream allows for sub-millisecond detection of LP removals, giving them the "First Mover" advantage in predictions.

---

## 5. Scoring Formula (Layer 02)

`L2_Score = (Burn_Status_Penalty * 0.7) + (Liquidity_Depth_Factor * 0.3)`

**CRITICAL RULE:** If LP is **NOT** burnt and **NOT** locked, the Layer 02 score is automatically **95%+ Risk**. This acts as a "Circuit Breaker" for the entire RugIntel system.
