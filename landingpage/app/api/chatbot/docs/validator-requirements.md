# RugIntel Validator — Infrastructure Requirements

Panduan lengkap apa yang dibutuhkan untuk menjalankan RugIntel Validator di jaringan Bittensor.

---

## 🖥️ Hardware (VPS)

| Komponen      | Minimum          | Recommended      | Catatan                              |
| ------------- | ---------------- | ---------------- | ------------------------------------ |
| **CPU**       | 4 vCPU           | 8 vCPU           | Harus query semua miner + verifikasi |
| **RAM**       | 8 GB             | 16 GB            | Menyimpan pending verifikasi 24 jam  |
| **Storage**   | 50 GB SSD        | 100 GB SSD       | Database verifikasi + log            |
| **Bandwidth** | 2 TB/bulan       | Unlimited        | Query ke semua miner + API calls     |
| **OS**        | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS | Python 3.9+ required                 |

### Estimasi Biaya VPS

| Provider         | Spek                        | Harga/bulan |
| ---------------- | --------------------------- | ----------- |
| **Contabo**      | 6 vCPU, 16GB RAM, 400GB SSD | ~$12.99     |
| **Hetzner**      | CX31 (4 vCPU, 8GB RAM)      | ~€7.45      |
| **DigitalOcean** | 4 vCPU, 8GB RAM             | ~$48        |
| **OVH**          | VPS Essential               | ~$12        |

> 💡 **Rekomendasi:** Contabo atau Hetzner. Estimasi ~**$12–15/bulan**.

---

## 🔑 API Requirements

### API Gratis (Wajib — Untuk Verifikasi Ground Truth)

| API             | Endpoint                              | Digunakan Untuk                 |
| --------------- | ------------------------------------- | ------------------------------- |
| **Solana RPC**  | `https://api.mainnet-beta.solana.com` | Cek LP status, wallet movements |
| **RugCheck**    | `https://api.rugcheck.xyz/v1`         | Cross-verify token security     |
| **DexScreener** | `https://api.dexscreener.com`         | Cek price drop 24h, volume      |

### API Recommended (Higher Rate Limits)

| Provider                | Mengapa?                                                                 |
| ----------------------- | ------------------------------------------------------------------------ |
| **Helius** (Solana RPC) | Validator perlu rate limit lebih tinggi — query semua miner + verifikasi |
| **QuickNode**           | Dedicated endpoint untuk reliability                                     |

> ⚠️ **Validator membutuhkan rate limit lebih tinggi** dari miner karena harus query banyak miner + cross-verify semua prediksi. Free tier Solana RPC mungkin terlalu lambat untuk validator aktif.

---

## 💰 TAO Budget

| Item                       | Estimasi Biaya                | Catatan                                 |
| -------------------------- | ----------------------------- | --------------------------------------- |
| **Subnet registration**    | ~0.1 TAO                      | Satu kali                               |
| **Validator registration** | ~0.1 TAO                      | Satu kali per hotkey                    |
| **Staking (WAJIB)**        | Minimum ~100 TAO              | Validator HARUS stake untuk set weights |
| **Gas fees**               | ~0.01 TAO per `set_weights()` | Setiap kali set weights on-chain        |

> ⚠️ **Penting:** Validator HARUS stake TAO yang cukup untuk mendapatkan voting power. Semakin besar stake = semakin besar pengaruh weight. Minimum ~100 TAO recommended.

> 💡 **Total startup cost:** ~100.2 TAO + $12–15/bulan VPS. Pada harga TAO $400, ini sekitar **$40,080 + $15/bulan**.

---

## 🗄️ Storage Requirements

Validator menyimpan data verifikasi pending selama 24 jam:

```
Data per token:
  - token_address (44 bytes)
  - launch_timestamp (8 bytes)
  - miner_predictions (N miners × ~200 bytes)
  - ground_truth_result (~100 bytes)

Estimasi per hari:
  - ~500 token baru per hari (Solana average)
  - ~500 × 3 miners × 200 bytes = ~300 KB/hari
  - Dengan margin: ~5 MB/hari = ~150 MB/bulan

Storage bukan bottleneck — SSD 50GB lebih dari cukup.
```

---

## 🌐 Network Requirements

| Setting      | Value                                       | Catatan                                                        |
| ------------ | ------------------------------------------- | -------------------------------------------------------------- |
| **Outbound** | Harus bisa reach semua miner Axon endpoints | Port 8091+                                                     |
| **Dendrite** | Bittensor dendrite untuk query miners       | Built into SDK                                                 |
| **IP**       | Static IP recommended                       | Konsistensi                                                    |
| **Uptime**   | 99.5%+ target                               | Validator offline = weights tidak diupdate = kehilangan reward |

---

## 📋 Validator vs Miner — Perbandingan

| Aspek          | Miner                        | Validator                        |
| -------------- | ---------------------------- | -------------------------------- |
| **VPS**        | $5–7/bulan                   | $12–15/bulan                     |
| **TAO stake**  | Tidak perlu                  | ~100 TAO minimum                 |
| **API rate**   | Normal                       | Higher (query semua miner)       |
| **Complexity** | Run analisis                 | Query + verify + set weights     |
| **Storage**    | Minimal                      | Database pending verifikasi      |
| **Risiko**     | Akurasi rendah = sedikit TAO | Deviasi dari consensus = penalty |

---

## 📁 Checklist Sebelum Menjalankan Validator

- [ ] VPS sudah aktif (4+ vCPU, 8+ GB RAM)
- [ ] Python 3.9+ terinstall
- [ ] Bittensor SDK terinstall
- [ ] Wallet sudah dibuat (coldkey + hotkey)
- [ ] Wallet memiliki TAO yang cukup (~100+ TAO)
- [ ] TAO sudah di-stake ke validator hotkey
- [ ] `.env` file sudah dikonfigurasi
- [ ] Solana RPC endpoint bisa diakses (recommend Helius/QuickNode)
- [ ] Validator terdaftar di subnet
- [ ] Test koneksi ke miner Axon endpoints
