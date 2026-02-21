# Layer 07: Temporal Intelligence (20% Weight)

Temporal Intelligence is the "Predictive Timing" layer. It models the lifespan of a token based on historical "Rugpull Windows" and the velocity of behavioral economics (FOMO cycles).

---

## 1. Screening Methodology

This layer applies statistical models to time-series data:

1. **The 12-Minute Trap Analysis:** Monitoring the probability of failure as a function of time since the first liquidity injection.
2. **FOMO Decay Modeling:** Measuring the exhaustion point of buy pressure combined with social volume spikes.
3. **Consolidation Verification:** Identifying the "Safe Zone" where a project transitions from a volatile launch to a stable community-held token.

---

## 2. Key Parameters & Thresholds

| Parameter             | Threshold        | Influence    | Detection Logic                                                                           |
| :-------------------- | :--------------- | :----------- | :---------------------------------------------------------------------------------------- |
| **Rug Window**        | 0 - 12 Minutes   | 🔴 CRITICAL  | Statistical peak for rugpulls. RPS is naturally high during this window.                  |
| **Peak FOMO**         | >200% Social Vol | 🔴 High Risk | When price surge meets extreme social shill (classic "Exit Liquidity" event).             |
| **Maturity Age**      | > 30 Minutes     | 🟢 Safe      | If the LP is still there after 30 mins, the probability of an "Instant Rug" drops by 85%. |
| **Price Stability**   | < 10% Volatility | 🟢 Safe      | Post-launch consolidation indicates organic holding rather than bot churning.             |
| **Holder Sustenance** | Net Positive     | ✅ SECURE    | Holder count increasing while initial "snipers" are exiting.                              |

---

## 3. Logical Screening Scenarios

### 🔴 High Risk (Rugpull Probability Boost)

- **The "High-Frequency" Rug:** Liquidity is added, 3 minutes later the price is up 500% with massive social botting. The "12-minute" clock is ticking; any miner detection of wallet clustering triggers a 99% RPS.
- **The Parabolic Exit:** A vertical price candle coincides with the developer wallet making several small "Test Removals" of liquidity. This is the peak risk moment for a total drain.

### 🟢 Low Risk (Safe Indicator)

- **The "Floor Builder":** After 30 minutes of trading, the token has survived the initial sniper dump and is building a stable price floor with decreasing social "noise".
- **Gradual Maturation:** Project age crosses the 1-hour mark with consistent holder growth and transparent dev communication.

---

## 4. Technical Requirements for Miners

Miners in this layer focus on **Statistical Modeling** and **Time-Series Forecasting**.

### A. Real-Time Event Bus

- **Usage:** Tracking the exact block-timestamp of the `LiquidityAdd` event to start the internal "Rug Clock".
- **Logic:** `current_time - launch_time`. If `< 12min`, apply `Temporal_Risk_Multiplier`.

### B. Behavioral Analysis Algorithms

- **Tooling:** Python `scipy` or `statsmodels` to calculate the "Velocity of FOMO".
- **Logic:** Correlate transaction frequency per second with social mention frequency.

### C. Historical Dataset

- **Usage:** Miners maintain specialized datasets of previous rugpulls (over 100,000+ events) to train their temporal models for "Signature" move detection.

---

## 5. Scoring Formula (Layer 07)

`L7_Score = (Window_Risk_Multiplier) * ((Price_Velocity * 0.5) + (Social_Exhaustion * 0.5))`

**NOTE for Miners:** This is a dynamic layer. The score _changes_ every minute. A coin that is "High Risk" at minute 5 can become "Stable" at minute 35 if it survives the 12-minute trap.
