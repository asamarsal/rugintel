# RugIntel Miner — Infrastructure Requirements

Panduan lengkap apa yang dibutuhkan untuk menjalankan RugIntel Miner di jaringan Bittensor.

---

## 🖥️ Hardware (VPS)

| Komponen      | Minimum          | Recommended      | Catatan                               |
| ------------- | ---------------- | ---------------- | ------------------------------------- |
| **CPU**       | 2 vCPU           | 4 vCPU           | Async I/O, bukan CPU-intensive        |
| **RAM**       | 4 GB             | 8 GB             | Untuk analisis paralel 7 layer        |
| **Storage**   | 20 GB SSD        | 50 GB SSD        | Log + cache API responses             |
| **Bandwidth** | 1 TB/bulan       | Unlimited        | API calls ke Solana RPC + DexScreener |
| **OS**        | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS | Python 3.9+ required                  |

### Estimasi Biaya VPS

| Provider         | Spek                       | Harga/bulan |
| ---------------- | -------------------------- | ----------- |
| **Contabo**      | 4 vCPU, 8GB RAM, 200GB SSD | ~$6.99      |
| **Hetzner**      | CX21 (2 vCPU, 4GB RAM)     | ~€4.15      |
| **DigitalOcean** | Basic Droplet 2 vCPU, 4GB  | ~$24        |
| **Vultr**        | Cloud Compute 2 vCPU, 4GB  | ~$24        |
| **OVH**          | VPS Starter                | ~$6         |

> 💡 **Rekomendasi:** Contabo atau Hetzner untuk rasio harga/performa terbaik. Estimasi ~**$5–7/bulan**.

---

## 🔑 API Requirements

### API Gratis (Wajib)

| API             | Endpoint                              | Rate Limit (Free) | Digunakan Oleh |
| --------------- | ------------------------------------- | ----------------- | -------------- |
| **Solana RPC**  | `https://api.mainnet-beta.solana.com` | ~100 req/10s      | Layer 2, 3     |
| **RugCheck**    | `https://api.rugcheck.xyz/v1`         | ~60 req/min       | Layer 5        |
| **DexScreener** | `https://api.dexscreener.com`         | ~300 req/min      | Layer 4, 7     |

### API Gratis (Recommended — Higher Rate Limits)

| Provider                   | Free Tier                | Benefit                         |
| -------------------------- | ------------------------ | ------------------------------- |
| **Helius** (Solana RPC)    | 100K credits/bulan       | 10x lebih cepat dari public RPC |
| **QuickNode** (Solana RPC) | 50 req/s free            | Dedicated endpoint              |
| **Alchemy** (Solana RPC)   | 300M compute units/bulan | Reliable uptime                 |

### API Opsional

| API                  | Fungsi                | Gratis?                         | Layer   |
| -------------------- | --------------------- | ------------------------------- | ------- |
| **Twitter API v2**   | Social pump detection | ✅ Free tier (100 tweets/bulan) | Layer 1 |
| **Telegram Bot API** | Group monitoring      | ✅ Gratis                       | Layer 1 |

> ⚠️ **Tidak ada API berbayar yang wajib.** Semua layer bisa berjalan dengan API gratis. Twitter API opsional — Layer 1 tetap berfungsi dengan heuristik jika tidak ada API key.

---

## 💰 TAO Budget

| Item                    | Estimasi Biaya                | Catatan                 |
| ----------------------- | ----------------------------- | ----------------------- |
| **Subnet registration** | ~0.1 TAO (testnet gratis)     | Satu kali               |
| **Miner registration**  | ~0.1 TAO                      | Satu kali per hotkey    |
| **Minimum stake**       | Tidak ada minimum untuk miner | Miner tidak perlu stake |
| **Gas fees**            | ~0.001 TAO per transaksi      | Sangat kecil            |

> 💡 **Total startup cost:** ~0.2 TAO + $5–7/bulan VPS. Pada harga TAO $400, ini sekitar **$80 + $5/bulan**.

---

## 📊 Estimasi Penghasilan vs Biaya

```
Biaya bulanan:
  VPS:          $5–7/bulan
  API:          $0 (semua gratis)
  TAO gas:      ~$0.40/bulan
  ─────────────────────────
  TOTAL:        ~$5–8/bulan

Potensi penghasilan (jika akurasi tinggi):
  TAO emission per epoch × accuracy weight
  Estimasi kasar: $100–1,133/bulan*

  * Bergantung pada:
    - Jumlah miner di subnet (semakin sedikit = semakin besar share)
    - Akurasi prediksi (accuracy = revenue)
    - Total TAO emission untuk subnet ini
```

---

## 🌐 Network Requirements

| Setting      | Value                   | Catatan                                             |
| ------------ | ----------------------- | --------------------------------------------------- |
| **Port**     | 8091 (configurable)     | Untuk Axon endpoint (gRPC/HTTP)                     |
| **Firewall** | Port 8091 harus terbuka | Validator harus bisa reach miner                    |
| **IP**       | Static IP recommended   | Untuk konsistensi endpoint                          |
| **Uptime**   | 99%+ target             | Miner offline = tidak dapat query = tidak dapat TAO |

---

## 🐍 Software Requirements

```bash
# Python
Python 3.9+ (recommended: 3.11)

# System packages (Ubuntu)
sudo apt update
sudo apt install python3 python3-pip python3-venv git

# Bittensor CLI
pip install bittensor

# RugIntel dependencies
pip install -r requirements.txt
```

---

## 📁 Checklist Sebelum Menjalankan Miner

- [ ] VPS sudah aktif dengan Ubuntu 22.04
- [ ] Python 3.9+ terinstall
- [ ] Bittensor SDK terinstall (`btcli --version`)
- [ ] Wallet sudah dibuat (coldkey + hotkey)
- [ ] Wallet memiliki TAO yang cukup untuk registrasi
- [ ] `.env` file sudah dikonfigurasi
- [ ] Port 8091 terbuka di firewall
- [ ] Solana RPC bisa diakses (test: `curl https://api.mainnet-beta.solana.com -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'`)
- [ ] Miner terdaftar di subnet (`btcli subnet register`)
