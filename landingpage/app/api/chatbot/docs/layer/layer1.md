# Layer 01: Social Intelligence (7% Weight)

Social Intelligence focuses on detecting coordinated manipulation and inorganic growth signals across major social platforms (Twitter/X and Telegram).

---

## 1. Screening Methodology

The screening process follows a three-step heuristic:

1. **Exposure Detection:** Tracking how many unique accounts are posting the token address/ticker.
2. **Coordination Profiling:** Analyzing the timing and metadata of these posts to detect "raiding" or "botting".
3. **Sentiment & Legitimacy Check:** Distinguishing between real community hype and paid shill operations.

---

## 2. Key Parameters & Thresholds

| Parameter              | Threshold              | Influence    | Detection Logic                                                                |
| :--------------------- | :--------------------- | :----------- | :----------------------------------------------------------------------------- |
| **Account Age**        | < 24 Hours             | 🔴 High Risk | Flags "burner" accounts used for temporary shilling.                           |
| **Post Velocity**      | > 20 Posts/Min         | 🔴 High Risk | Detects automated bot scripts or coordinated Telegram raids.                   |
| **Follower Ratio**     | < 5 Follower/Following | 🔴 High Risk | Low-quality shill accounts often have high following counts but few followers. |
| **Sentiment Polarity** | Vertical Surge         | 🟡 Info      | Checks if the hype is purely positive/repetitive (potential scripts).          |
| **Doxxed Devs**        | Verified Links         | 🟢 Safe      | Cross-references Twitter bio links with known developer profiles.              |

---

## 3. Logical Screening Scenarios

### 🔴 High Risk (Rugpull Probability Boost)

- **The "Burner Surge":** 50+ mentions in 5 minutes from accounts created in the last 48 hours.
- **Bot Cluster:** Multiple accounts posting the exact same text + image (copy-paste shills).
- **Silent Launch Trap:** 0 social presence followed by a vertical volume spike (100% chance of insider wash trading).

### 🟢 Low Risk (Safe Indicator)

- **Organic Growth:** Mentions from accounts with various ages, follower counts, and non-repetitive engagement.
- **Authority Validation:** Inclusion in a list or mention by a "KOL" with a history of organic (non-paid) calls.

---

## 4. API Integration Details

To implement this layer, the following APIs/Tools are utilized:

### A. Twitter/X API (v2)

- **Endpoint:** `GET /2/tweets/search/recent`
- **Usage:** Search for the token contract address and ticker.
- **Parameters:** `tweet.fields=created_at,author_id`, `user.fields=created_at,public_metrics`.

### B. Telegram Bot API (via Telethon/Pyrogram)

- **Logic:** Scraping a specific "Scraper List" of 200+ known pump-and-dump channels.
- **Usage:** Detect if the token appeared in these channels _before_ or _immediately after_ the liquidity launch.

### C. TweetScraper (Internal Tool)

- **Purpose:** Analyzing account metadata (PFPs, bio keywords) for cluster detection.

---

## 5. Technical Flow: How it Works

The process is fully automated within the Bittensor network. There is **no manual link input**; instead, it follows this protocol:

1. **Request (Validator → Miner):** The Validator sends a `RugIntelSynapse` containing only the `token_address` (e.g., `7xKp...mPqR`).
2. **Detection (Miner Side):**
   - The Miner's script automatically triggers a search on the **Twitter API** for that specific address.
   - The Miner's Telegram engine scans the history of **1,000+ monitored groups** to see if that address was posted.
3. **Database Check:** The Miner cross-references the Twitter handles found against their internal "Alpha" (Safe) and "Shill" (Blacklist) databases.
4. **Response (Miner → Validator):** The Miner sends back the final Risk Score and formatted evidence.

## 6. Miner Data Ingestion Source

To earn high rewards, Miners must "ingest" (monitor) the following sources 24/7:

- **Telegram:** A collection of Telegram Channel IDs (`-100...`) representing known insider groups, community raiders, and influencer call channels.
- **Twitter:** A list of User IDs of crypto influencers (KOLs) and known scam-deployer handles.
- **API Keys:** Miners MUST have their own Twitter Developer API keys or high-quality scraping proxies.

---

## 7. Scoring Formula (Layer 01)

`L1_Score = (Coordinated_Signal_Penalty * 0.6) + (New_Account_Penalty * 0.4)`

If `Coordinated_Signal` is detected, the score is forced to `CRITICAL` regardless of other factors, as this is the leading indicator of a coordinated dump.
