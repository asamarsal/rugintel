# Layer 05: Contract Intelligence (15% Weight)

Contract Intelligence is the "X-Ray" layer. It performs deep binary and source code analysis to detect hidden malicious functions that could be used to exploit investors.

---

## 1. Screening Methodology

This layer uses both internal static analysis and third-party security APIs:

1. **Authority Audit:** Checking who "commands" the token contract (Owner vs. Renounced).
2. **Permission Analysis:** Scanning for "Dangerous Permissions" like the ability to freeze accounts or mint unlimited supply.
3. **Logic Verification:** Running simulations to detect "Honeypot" logic (where users can buy but not sell).

---

## 2. Key Parameters & Thresholds

| Parameter            | Threshold          | Influence   | Detection Logic                                                               |
| :------------------- | :----------------- | :---------- | :---------------------------------------------------------------------------- |
| **Mint Function**    | Active / Enabled   | 🔴 CRITICAL | Allows the dev to create infinite tokens and dump them on the market.         |
| **Freeze Authority** | Not Revoked        | 🔴 CRITICAL | Allows the dev to "blacklist" specific wallets, preventing them from selling. |
| **Honeypot Status**  | Positive Match     | 🔴 CRITICAL | Specific code patterns that block the `Sell` function for ordinary users.     |
| **Renounced**        | Ownership = `None` | 🟢 Safe     | The creator no longer has any special power over the token settings.          |
| **Standard SPL**     | Verifiable Code    | ✅ SECURE   | Token follows standard protocols without modified or obfuscated logic.        |

---

## 3. Logical Screening Scenarios

### 🔴 High Risk (Rugpull Probability Boost)

- **The "Admin" Trap:** The contract has a hidden `setTax` function that allows the owner to change the sell tax to 100% at any time.
- **The Selective Freeze:** Small holders can sell, but any wallet holding >1% of supply is automatically "Frozen" by the contract bot.
- **The Unlimited Mint:** Miner detects that the `Mint Authority` is still held by a wallet that has been active in previous rugpulls.

### 🟢 Low Risk (Safe Indicator)

- **Top-Tier Security:** Contract passes all 20+ checks on RugCheck.xyz and has its ownership permanently renounced to the "NULL" address.
- **Audited Source:** Code is verified on Solana Explorer and matches a standard, safe template.

---

## 4. Technical Requirements for Miners

Miners in this layer act as **Automated Security Auditors**.

### A. RugCheck & TokenSniffer APIs

- **Usage:** Miners use these as the first line of defense to gather a "Security Snapshot".
- **API Endpoint:** `GET /v1/tokens/{address}/report` (RugCheck).

### B. Static Analysis Engines

- **Slither / Mythril (for EVM):** Modified for SPL tokens to scan for risky bytecode patterns.
- **Function Signature Scanning:** Checking if the contract contains known "Scam signatures" (e.g., specific honeypot variable names).

### C. Simulation Proxies

- **Usage:** Attempting a "Dry Run" transaction. If a simulated `Sell` order fails for a test wallet despite the wallet having enough balance/slippage, the coin is flagged as a Honeypot.

---

## 5. Scoring Formula (Layer 05)

`L5_Score = (Mint_Authority_Penalty * 0.45) + (Freeze_Authority_Penalty * 0.45) + (Renounced_Bonus * 0.1)`

**RED ALERT for Miners:** If both `Mint` and `Freeze` authorities are active, the koin should be flagged as **100% Risk**, as this is the "Master Setup" for a long-term scam.
