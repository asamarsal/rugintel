# Layer 06: Visual Intelligence (3% Weight)

Visual Intelligence is the "Brand Protection" layer. It identifies low-effort clones, impersonators, and AI-generated scam assets by analyzing the token's visual and textual branding.

---

## 1. Screening Methodology

This layer uses computer vision and string comparison algorithms:

1. **Typosquatting Detection:** Finding name/ticker variations that mimic high-reputation projects (e.g., `PEPE` vs. `PEPEE`).
2. **Visual DNA Matching:** Comparing the MD5/Perceptual hashes of the token logo against a database of known rugs.
3. **AI Generation Signature:** Detecting if a logo and website assets are high-volume, low-effort AI generations without unique design intent.

---

## 2. Key Parameters & Thresholds

| Parameter            | Threshold            | Influence    | Detection Logic                                                                 |
| :------------------- | :------------------- | :----------- | :------------------------------------------------------------------------------ |
| **Typosquatting**    | Dist < 2 chars       | 🔴 High Risk | Flags names like `PUMP.FUNN` or `USDC_PRO` that impersonate real platforms.     |
| **Logo Hash Match**  | 100% Match           | 🔴 High Risk | Identifies reused logos from previous 99% crash tokens.                         |
| **Generic Template** | Known SCAM UI        | 🔴 High Risk | Detects website structures used in "Factory Rugs" (mass-produced scams).        |
| **Unique Branding**  | Original Assets      | 🟢 Safe      | Custom-designed logos and websites that don't match known scam patterns.        |
| **Coherent Theme**   | Logic across Socials | ✅ SECURE    | Visual consistency between the contract metadata, Twitter profile, and website. |

---

## 3. Logical Screening Scenarios

### 🔴 High Risk (Rugpull Probability Boost)

- **The Imposter:** Token name is `SOLANA_OFFICIAL`. This is a classic "Visual Trap" designed to trick beginners into thinking it's an official airdrop.
- **The Recycling Bin:** Miner detects that the logo used is identical to a "Moon" token that rugged exactly 45 minutes ago.
- **The AI Factory:** The website contains 0 original text and uses AI-generated images of "Dogs in Space" that are identical in style to 500 other current scam coins.

### 🟢 Low Risk (Safe Indicator)

- **High-Effort Identity:** Unique hand-drawn art or professional branding that has not been seen on-chain before.
- **Social Proofing:** The visual branding is verified and remains consistent over several days of pre-launch marketing.

---

## 4. Technical Requirements for Miners

Miners in this layer focus on **Pattern Recognition** and **Image Processing**.

### A. Levenshtein Distance Algorithms

- **Usage:** Comparing the token name against the Top 1000 Tokens by Market Cap.
- **Logic:** If `Distance(Token_A, Top_100_Token) == 1`, flag for Typosquatting.

### B. Perceptual Hashing (pHash)

- **Usage:** Unlike MD5, pHash detects if an image is "Very Similar" even if the colors or resolution are slightly different.
- **Tooling:** Python `ImageHash` library.

### C. Google Cloud Vision / Azure OCR

- **Usage:** Reading text _inside_ the logo to see if it claims to be a different project.
- **API Requirement:** Low-volume API calls for confirmation of suspected impersonators.

---

## 5. Scoring Formula (Layer 06)

`L6_Score = (Typosquatting_Penalty * 0.6) + (Logo_Match_Penalty * 0.4)`

**NOTE for Miners:** While this layer only has 3% weight, it is a high-speed "Early Warning" system. Impersontators usually rug faster than original memes because their goal is quick deception.
