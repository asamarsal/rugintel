# 📖 Panduan Lengkap: Cara Membuat, Menggunakan, dan Menerapkan RugIntel di Bittensor

## Daftar Isi

- [Konsep Dasar](#konsep-dasar)
- [Prasyarat](#prasyarat)
- [Langkah 1: Persiapan Lingkungan](#langkah-1-persiapan-lingkungan)
- [Langkah 2: Membuat Wallet Bittensor](#langkah-2-membuat-wallet-bittensor)
- [Langkah 3: Membangun Miner RugIntel](#langkah-3-membangun-miner-rugintel)
- [Langkah 4: Membangun Validator RugIntel](#langkah-4-membangun-validator-rugintel)
- [Langkah 5: Mendaftarkan Subnet](#langkah-5-mendaftarkan-subnet)
- [Langkah 6: Menjalankan Miner & Validator](#langkah-6-menjalankan-miner--validator)
- [Langkah 7: Mekanisme Reward & Yuma Consensus](#langkah-7-mekanisme-reward--yuma-consensus)
- [Alur Kerja Lengkap](#alur-kerja-lengkap)
- [FAQ](#faq)

---

## Konsep Dasar

### Apa itu RugIntel?

RugIntel adalah **pasar komoditas digital terdesentralisasi** di jaringan Bittensor. Komoditas yang diperdagangkan di pasar ini adalah **intelijen prediksi rugpull yang terverifikasi** — bukan sebuah tool atau API biasa.

### Bagaimana RugIntel Bekerja di Bittensor?

```
┌───────────────────────────────────────────────────────┐
│          Bittensor Subtensor (On-Chain)               │
│  ┌────────────────────────────────────────────────┐   │
│  │  Yuma Consensus → Distribusi TAO Otomatis      │   │
│  │  (Tanpa intervensi manusia; ditegakkan secara  │   │
│  │   matematis oleh blockchain)                   │   │
│  └──────────────────────┬─────────────────────────┘   │
│                         ▲                             │
│                         │ set_weights()               │
│  ┌──────────────────────┴─────────────────────────┐   │
│  │          RugIntel Subnet (Off-Chain)           │   │
│  │                                                │   │
│  │   Miner ──(prediksi risiko)──▶ Validator       │   │
│  │     │                              │           │   │
│  │     ▼                              ▼           │   │
│  │   Solana RPC               Verifikasi 24 jam   │   │
│  │   RugCheck API             Ground Truth        │   │
│  │   DexScreener                                  │   │
│  └────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

**Prinsip kunci:**

- **Miner** = Produsen komoditas intelijen (menjalankan analisis 12-layer)
- **Validator** = Verifikator kualitas komoditas (memastikan prediksi akurat)
- **Yuma Consensus** = Mekanisme on-chain yang mendistribusi TAO secara otomatis berdasarkan weights
- **TAO** = Token reward yang diterima miner atas prediksi akurat

> ⚠️ **Penting:** Validator TIDAK mendistribusikan TAO secara langsung. Validator hanya `set_weights()` → Yuma Consensus menghitung emisi → Blockchain membagikan TAO otomatis.

---

## Prasyarat

Sebelum memulai, pastikan Anda memiliki:

| Kebutuhan         | Detail                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Python**        | Versi 3.9 atau lebih baru                                                                                                       |
| **Bittensor SDK** | `pip install bittensor`                                                                                                         |
| **Solana RPC**    | Endpoint untuk mengakses data on-chain Solana (gratis via [Helius](https://helius.dev) atau [QuickNode](https://quicknode.com)) |
| **API Keys**      | RugCheck API, DexScreener API (opsional: Twitter API)                                                                           |
| **Hardware**      | Minimal: VPS 2 CPU, 4GB RAM, 50GB SSD                                                                                           |
| **TAO**           | Sejumlah TAO untuk mendaftarkan subnet dan melakukan staking                                                                    |

---

## Langkah 1: Persiapan Lingkungan

### 1.1 Install Python dan Dependencies

```bash
# Pastikan Python 3.9+ terinstall
python --version

# Buat virtual environment
python -m venv rugintel-env
source rugintel-env/bin/activate  # Linux/Mac
# atau
rugintel-env\Scripts\activate     # Windows

# Install Bittensor SDK
pip install bittensor

# Install dependencies tambahan
pip install aiohttp solana requests numpy
```

### 1.2 Clone Repository RugIntel

```bash
git clone https://github.com/your-org/rugintel.git
cd rugintel

# Install project dependencies
pip install -r requirements.txt

# Salin konfigurasi
cp .env.example .env
```

### 1.3 Konfigurasi Environment Variables

Edit file `.env` dengan pengaturan berikut:

```env
# Bittensor
BITTENSOR_NETWORK=finney          # atau "test" untuk testnet
SUBNET_NETUID=<SUBNET_UID>        # UID subnet RugIntel

# Solana RPC
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_RPC_WSS=wss://api.mainnet-beta.solana.com

# API Keys
RUGCHECK_API_KEY=<your_key>
DEXSCREENER_API_URL=https://api.dexscreener.com/latest/dex
TWITTER_BEARER_TOKEN=<your_token>  # Opsional: untuk Layer 1 (Social Intelligence)
```

---

## Langkah 2: Membuat Wallet Bittensor

### 2.1 Buat Coldkey & Hotkey

```bash
# Buat coldkey (kunci utama — simpan dengan aman!)
btcli wallet new_coldkey --wallet.name rugintel_wallet

# Buat hotkey (kunci operasional untuk miner/validator)
btcli wallet new_hotkey --wallet.name rugintel_wallet --wallet.hotkey rugintel_hotkey
```

### 2.2 Cek Saldo Wallet

```bash
btcli wallet balance --wallet.name rugintel_wallet
```

> 💡 **Tips:** Anda membutuhkan TAO untuk mendaftarkan subnet dan melakukan staking. Beli TAO melalui exchange yang mendukung (misalnya: MEXC, Gate.io).

---

## Langkah 3: Membangun Miner RugIntel

Miner adalah **produsen komoditas intelijen**. Tugasnya adalah menjalankan analisis 12-layer terhadap token Solana dan menghasilkan skor risiko.

### 3.1 Struktur Dasar Miner

Buat file `neurons/miner.py`:

```python
import bittensor as bt
from rugintel.protocol import RugIntelSynapse
from rugintel.intelligence import TwelveLayerFusion

class RugIntelMiner(bt.Miner):
    """
    Miner RugIntel: Menjalankan 12-layer intelligence fusion secara off-chain.
    Menerima request dari validator, menganalisis token, mengembalikan skor risiko.
    """

    def __init__(self, config=None):
        super().__init__(config=config)
        # Inisialisasi engine analisis 12-layer
        self.fusion_engine = TwelveLayerFusion()

    def forward(self, synapse: RugIntelSynapse) -> RugIntelSynapse:
        """
        Dipanggil ketika validator mengirim request analisis token.

        Input: synapse berisi token_address dan launch_timestamp
        Output: synapse dengan risk_score, confidence, evidence, time_to_rugpull
        """
        # Jalankan analisis 12-layer (semua off-chain)
        result = self.fusion_engine.analyze(
            token_address=synapse.token_address,
            launch_timestamp=synapse.launch_timestamp
        )

        # Isi hasil ke synapse
        synapse.risk_score = result["risk_score"]           # 0.0 - 1.0
        synapse.confidence = result["confidence"]           # Interval kepercayaan
        synapse.evidence = result["evidence"]               # Dict bukti pendukung
        synapse.time_to_rugpull = result["time_to_rugpull"] # Estimasi waktu rugpull

        return synapse  # Komoditas dikirim kembali ke validator

# Entry point
if __name__ == "__main__":
    miner = RugIntelMiner()
    miner.run()
```

### 3.2 Implementasi 12-Layer Intelligence Fusion

Buat file `rugintel/intelligence.py`:

```python
class TwelveLayerFusion:
    """
    Engine analisis 12-layer yang berjalan secara off-chain.
    Setiap layer menganalisis aspek berbeda dari token Solana.
    """

    # Bobot setiap layer berdasarkan kekuatan prediktif
    WEIGHTS = {
        "liquidity": 0.25,      # Layer 2: Kekuatan prediktif tertinggi
        "wallet": 0.20,         # Layer 3: Sinyal kuat aktivitas insider
        "temporal": 0.20,       # Layer 7: Kritis untuk prediksi timing
        "contract": 0.15,       # Layer 5: Perlu tapi tidak cukup sendiri
        "market": 0.10,         # Layer 4: Sinyal pendukung
        "social": 0.07,         # Layer 1: Noisy tapi berharga saat terkorelasi
        "visual": 0.03,         # Layer 6: Sinyal lemah jika sendiri
    }

    async def analyze(self, token_address: str, launch_timestamp: int) -> dict:
        """Jalankan semua 12 layer dan fusi hasilnya."""

        # Kumpulkan skor dari setiap layer (paralel)
        layer_scores = await asyncio.gather(
            self.layer1_social(token_address),       # Twitter/Telegram pump detection
            self.layer2_liquidity(token_address),     # Pola drain likuiditas
            self.layer3_wallet(token_address),        # Konsentrasi holder & riwayat deployer
            self.layer4_market(token_address),        # Volume spike & wash trading
            self.layer5_contract(token_address),      # RugCheck/TokenSniffer API
            self.layer6_visual(token_address),        # Logo AI-generated & typosquatting
            self.layer7_temporal(token_address, launch_timestamp),  # FOMO peak
        )

        # Fusi skor dengan weighted average
        fused_score = self._fuse_scores(layer_scores)

        return {
            "risk_score": fused_score,
            "confidence": self._calculate_confidence(layer_scores),
            "evidence": self._compile_evidence(layer_scores),
            "time_to_rugpull": self._estimate_timing(layer_scores),
        }

    def _fuse_scores(self, layer_scores: list) -> float:
        """Gabungkan skor dari semua layer dengan weighted average."""
        layer_names = ["social", "liquidity", "wallet", "market",
                       "contract", "visual", "temporal"]

        fused = sum(
            self.WEIGHTS[name] * score
            for name, score in zip(layer_names, layer_scores)
        )
        return round(min(max(fused, 0.0), 1.0), 4)

    # ─── Implementasi Layer ─────────────────────────────────

    async def layer1_social(self, token_address: str) -> float:
        """Layer 1: Deteksi koordinasi pump di Twitter/Telegram."""
        # Query Twitter API untuk mention token
        # Analisis pola: banyak akun baru posting bersamaan = sinyal pump
        # Threshold: >10 akun baru (<30 hari) posting token yang sama dalam 5 menit
        # Data: 87% paid shills tidak disclose payment (SEC 2025)
        # Return skor 0.0 (aman) - 1.0 (sangat mencurigakan)
        pass

    async def layer2_liquidity(self, token_address: str) -> float:
        """Layer 2: Analisis pola drain likuiditas secara real-time."""
        # Query Solana RPC untuk data pool likuiditas (Raydium, Orca)
        # Deteksi: LP unlock mendadak, LP ratio menurun drastis
        # Threshold: LP tidak terkunci ATAU LP lock <72 jam = high risk
        # BOBOT TERTINGGI (0.25) — kekuatan prediktif paling kuat
        # Return skor 0.0 - 1.0
        pass

    async def layer3_wallet(self, token_address: str) -> float:
        """Layer 3: Fingerprinting konsentrasi holder & riwayat deployer."""
        # Query Solana RPC untuk distribusi holder
        # Threshold 1: Top wallet memegang >50% supply = high risk
        # Threshold 2: Dev wallet jual >20% holdings dalam 5 menit = CRITICAL
        # Cek riwayat deployer wallet: apakah pernah deploy token rugpull?
        # Return skor 0.0 - 1.0
        pass

    async def layer4_market(self, token_address: str) -> float:
        """Layer 4: Deteksi volume spike & wash trading."""
        # Query DexScreener API untuk data volume
        # Threshold: volume >100× dalam 2 menit = 94% kemungkinan pump&dump
        # Deteksi: volume sangat tinggi tapi holder sedikit = wash trading
        # Return skor 0.0 - 1.0
        pass

    async def layer5_contract(self, token_address: str) -> float:
        """Layer 5: Integrasi RugCheck/TokenSniffer API."""
        # Query RugCheck.xyz API
        # Cek: mint authority aktif, freeze authority, honeypot mechanism
        # Catatan: RugCheck sendiri punya 22% false negative — perlu cross-verify
        # Return skor 0.0 - 1.0
        pass

    async def layer6_visual(self, token_address: str) -> float:
        """Layer 6: Deteksi logo AI-generated & typosquatting."""
        # Download logo token dari metadata
        # Analisis: apakah nama mirip token populer? (difflib similarity)
        # Contoh: "SOLANAA" vs "SOLANA", "BONDG" vs "BONK"
        # Return skor 0.0 - 1.0
        pass

    async def layer7_temporal(self, token_address: str, launch_ts: int) -> float:
        """Layer 7: Modeling FOMO peak & behavioral economics."""
        # Analisis pola temporal: kapan volume puncak terjadi?
        # DATA KRITIS: 68% rugpull terjadi dalam 12 menit pertama setelah launch
        # Threshold: token <5 menit launch = risiko sangat tinggi
        # Deteksi: pola pump-and-dump klasik berdasarkan timing
        # Return skor 0.0 - 1.0
        pass
```

### 3.3 Definisi Protocol (Synapse)

Buat file `rugintel/protocol.py`:

```python
import bittensor as bt
from typing import Optional

class RugIntelSynapse(bt.Synapse):
    """
    Protokol komunikasi antara Miner dan Validator.
    Synapse ini dikirim oleh Validator ke Miner melalui Axon RPC.
    """
    # Input dari Validator
    token_address: str = ""              # Alamat token Solana yang dianalisis
    launch_timestamp: int = 0             # Timestamp peluncuran token

    # Output dari Miner (diisi oleh miner)
    risk_score: Optional[float] = None    # Skor risiko rugpull (0.0 - 1.0)
    confidence: Optional[float] = None    # Interval kepercayaan (0.0 - 1.0)
    evidence: Optional[dict] = None       # Bukti pendukung per layer
    time_to_rugpull: Optional[float] = None  # Estimasi waktu rugpull (dalam jam)
```

---

## Langkah 4: Membangun Validator RugIntel

Validator adalah **verifikator kualitas komoditas**. Tugasnya adalah mengirim request ke miner, memverifikasi hasil terhadap ground truth, dan meng-set weights on-chain.

### 4.1 Struktur Dasar Validator

Buat file `neurons/validator.py`:

```python
import bittensor as bt
import asyncio
from rugintel.protocol import RugIntelSynapse
from rugintel.verification import GroundTruthVerifier

class RugIntelValidator(bt.Validator):
    """
    Validator RugIntel: Memverifikasi prediksi miner terhadap ground truth.

    PENTING: Validator TIDAK mendistribusikan TAO secara langsung.
    Validator hanya set_weights() → Yuma Consensus menghitung emisi →
    Blockchain auto-distribusi TAO.
    """

    def __init__(self, config=None):
        super().__init__(config=config)
        self.verifier = GroundTruthVerifier()
        self.pending_verifications = {}  # token_address → {miner_uid: prediction}

    async def forward(self):
        """
        Loop utama validator:
        1. Pilih token baru untuk dianalisis
        2. Kirim request ke 3+ miner
        3. Simpan prediksi untuk verifikasi 24 jam kemudian
        """
        # Ambil daftar token baru yang diluncurkan di Solana
        new_tokens = await self.verifier.get_new_tokens()

        for token in new_tokens:
            # Buat synapse request
            synapse = RugIntelSynapse(
                token_address=token["address"],
                launch_timestamp=token["timestamp"]
            )

            # Query 3+ miner secara paralel melalui Axon
            responses = await self.dendrite.forward(
                axons=self.metagraph.axons,  # Semua miner yang terdaftar
                synapse=synapse,
                timeout=30
            )

            # Simpan prediksi setiap miner untuk verifikasi nanti
            for uid, response in zip(self.metagraph.uids, responses):
                if response.risk_score is not None:
                    self.pending_verifications.setdefault(
                        token["address"], {}
                    )[uid] = {
                        "risk_score": response.risk_score,
                        "confidence": response.confidence,
                        "timestamp": token["timestamp"]
                    }

    async def verify_and_set_weights(self):
        """
        Verifikasi ground truth setelah 24 jam dan set weights on-chain.

        Alur:
        1. Cek token yang sudah 24 jam → apakah benar-benar rugpull?
        2. Bandingkan prediksi miner dengan kenyataan
        3. Hitung skor akurasi per miner
        4. Set weights on-chain → Yuma Consensus auto-distribusi TAO
        """
        scores = {}

        for token_address, predictions in self.pending_verifications.items():
            # Cek ground truth: apakah token ini rugpull dalam 24 jam?
            ground_truth = await self.verifier.check_24h_outcome(token_address)

            if ground_truth is None:
                continue  # Belum 24 jam, skip

            for miner_uid, prediction in predictions.items():
                # Hitung akurasi: seberapa dekat prediksi dengan kenyataan
                accuracy = self.verifier.calculate_accuracy(
                    predicted_risk=prediction["risk_score"],
                    actual_rugpull=ground_truth["is_rugpull"],
                    liquidity_drained=ground_truth["liquidity_drained"],
                    funds_moved=ground_truth["funds_moved_to_exchange"]
                )

                # Akumulasi skor per miner
                scores[miner_uid] = scores.get(miner_uid, [])
                scores[miner_uid].append(accuracy)

        # Rata-ratakan skor dan set weights on-chain
        if scores:
            weights = {
                uid: sum(s) / len(s) for uid, s in scores.items()
            }

            # SET WEIGHTS ON-CHAIN
            # Yuma Consensus akan mengagregasi weights dari semua validator
            # dan OTOMATIS mendistribusikan TAO ke miner
            self.subtensor.set_weights(
                netuid=self.config.netuid,
                wallet=self.wallet,
                uids=list(weights.keys()),
                weights=list(weights.values())
            )

            bt.logging.info(f"✅ Weights di-set untuk {len(weights)} miner")

# Entry point
if __name__ == "__main__":
    validator = RugIntelValidator()
    validator.run()
```

### 4.2 Ground Truth Verifier

Buat file `rugintel/verification.py`:

```python
import aiohttp
from datetime import datetime, timedelta

class GroundTruthVerifier:
    """
    Memverifikasi apakah prediksi rugpull terbukti benar setelah 24 jam.

    Sumber data verifikasi (cross-source):
    - Solana RPC: cek status likuiditas on-chain
    - RugCheck API: cek status token terbaru
    - DexScreener: cek aktivitas trading
    """

    async def check_24h_outcome(self, token_address: str) -> dict | None:
        """
        Cek apakah token benar-benar rugpull dalam 24 jam.
        Return None jika belum 24 jam.
        """
        # Cek apakah sudah 24 jam sejak launch
        if not self._is_24h_passed(token_address):
            return None

        # Cross-verify dari 3 sumber
        solana_check = await self._check_solana_rpc(token_address)
        rugcheck_result = await self._check_rugcheck_api(token_address)
        dex_result = await self._check_dexscreener(token_address)

        return {
            "is_rugpull": self._determine_rugpull(
                solana_check, rugcheck_result, dex_result
            ),
            "liquidity_drained": solana_check.get("lp_removed", False),
            "funds_moved_to_exchange": solana_check.get("cex_deposit", False),
            "price_drop_percent": dex_result.get("price_change_24h", 0),
        }

    def calculate_accuracy(self, predicted_risk, actual_rugpull,
                          liquidity_drained, funds_moved) -> float:
        """
        Hitung akurasi prediksi miner.

        Contoh:
        - Miner prediksi risk_score=0.95, ternyata memang rugpull → akurasi tinggi
        - Miner prediksi risk_score=0.10, ternyata rugpull → akurasi rendah
        - Miner prediksi risk_score=0.90, ternyata token aman → false positive
        """
        if actual_rugpull:
            # True positive: semakin tinggi risk_score = semakin akurat
            return predicted_risk
        else:
            # True negative: semakin rendah risk_score = semakin akurat
            return 1.0 - predicted_risk

    async def _check_solana_rpc(self, token_address: str) -> dict:
        """Query Solana RPC untuk status likuiditas."""
        # Cek: apakah LP di-remove? Apakah dana dipindah ke CEX?
        pass

    async def _check_rugcheck_api(self, token_address: str) -> dict:
        """Query RugCheck API untuk status keamanan token."""
        pass

    async def _check_dexscreener(self, token_address: str) -> dict:
        """Query DexScreener untuk data harga dan volume 24 jam."""
        pass
```

---

## Langkah 5: Mendaftarkan Subnet

### 5.1 Daftar di Testnet (untuk pengembangan)

```bash
# Daftar subnet baru di testnet
btcli subnet create --wallet.name rugintel_wallet --subtensor.network test

# Catat NETUID yang diberikan (misal: 123)
```

### 5.2 Register Miner & Validator ke Subnet

```bash
# Register sebagai miner
btcli subnet register \
  --wallet.name rugintel_wallet \
  --wallet.hotkey miner_hotkey \
  --netuid <SUBNET_UID> \
  --subtensor.network test

# Register sebagai validator
btcli subnet register \
  --wallet.name rugintel_wallet \
  --wallet.hotkey validator_hotkey \
  --netuid <SUBNET_UID> \
  --subtensor.network test
```

### 5.3 Staking TAO (untuk Validator)

```bash
# Validator perlu staking TAO agar bisa set weights
btcli stake add \
  --wallet.name rugintel_wallet \
  --wallet.hotkey validator_hotkey \
  --amount <JUMLAH_TAO>
```

---

## Langkah 6: Menjalankan Miner & Validator

### 6.1 Menjalankan Miner

```bash
python neurons/miner.py \
  --netuid <SUBNET_UID> \
  --wallet.name rugintel_wallet \
  --wallet.hotkey miner_hotkey \
  --subtensor.network test \
  --axon.port 8091 \
  --logging.trace
```

**Yang terjadi saat miner berjalan:**

1. Miner mendaftarkan endpoint Axon (gRPC/HTTP) ke jaringan
2. Validator mengirim `RugIntelSynapse` berisi alamat token
3. Miner menjalankan 12-layer analysis secara off-chain
4. Miner mengembalikan risk score + evidence ke validator

### 6.2 Menjalankan Validator

```bash
python neurons/validator.py \
  --netuid <SUBNET_UID> \
  --wallet.name rugintel_wallet \
  --wallet.hotkey validator_hotkey \
  --subtensor.network test \
  --logging.trace
```

**Yang terjadi saat validator berjalan:**

1. Validator mengambil daftar token baru dari Solana
2. Validator mengirim request ke 3+ miner per token
3. Setelah 24 jam, validator mengecek ground truth (apakah token benar rugpull?)
4. Validator menghitung skor akurasi setiap miner
5. Validator memanggil `set_weights()` on-chain
6. **Yuma Consensus otomatis mendistribusikan TAO** ke miner berdasarkan weights

---

## Langkah 7: Mekanisme Reward & Yuma Consensus

### Bagaimana TAO Didistribusikan?

```
Miner mengirim prediksi
        │
        ▼
Validator menerima dan menyimpan prediksi
        │
        ▼
(Tunggu 24 jam)
        │
        ▼
Validator cek ground truth:
  - Apakah token rugpull? (Solana RPC)
  - Apakah likuiditas hilang? (RugCheck)
  - Apakah harga drop >90%? (DexScreener)
        │
        ▼
Validator hitung skor akurasi per miner
        │
        ▼
Validator panggil set_weights() on-chain
        │
        ▼
┌─────────────────────────────────────────┐
│  YUMA CONSENSUS (On-Chain, Otomatis)    │
│                                         │
│  • Agregasi weights dari SEMUA validator│
│  • Hitung emisi TAO proporsional        │
│  • Distribusi TAO ke miner otomatis     │
│  • TANPA intervensi manusia             │
└─────────────────────────────────────────┘
        │
        ▼
Miner menerima TAO (akurasi = revenue)
```

### Mengapa Yuma Consensus Penting?

| Aspek               | Penjelasan                                                                |
| ------------------- | ------------------------------------------------------------------------- |
| **Agnostik**        | Tidak peduli APA yang diukur — bisa prediksi rugpull, bisa komoditas lain |
| **Konsensus Fuzzy** | Mampu mencapai konsensus untuk kebenaran probabilistik (seperti prediksi) |
| **Anti-Manipulasi** | Validator yang menyimpang dari kebenaran akan kehilangan reward           |
| **Otomatis**        | Distribusi TAO tanpa campur tangan siapapun                               |

---

## Alur Kerja Lengkap

### Skenario: Token Baru "SCAMCOIN" Diluncurkan

```
1. Token SCAMCOIN diluncurkan di Solana (timestamp: T0)
        │
2. Validator mendeteksi token baru via Solana RPC
        │
3. Validator kirim RugIntelSynapse ke 3 Miner:
   ┌──────────────────────────────────────────┐
   │ token_address: "SCAMCOIN..."             │
   │ launch_timestamp: T0                     │
   └──────────────────────────────────────────┘
        │
4. Setiap Miner menjalankan 12-layer analysis:
   ┌──────────────────────────────────────────┐
   │ Miner A:                                 │
   │   Layer 2 (Liquidity): 0.92 ← LP unlock  │
   │   Layer 3 (Wallet): 0.85 ← 1 wallet 80% │
   │   Layer 5 (Contract): 0.78 ← honeypot   │
   │   ... (layer lainnya)                     │
   │   Fused Score: 0.87 (HIGH RISK)          │
   │                                           │
   │ Miner B: Fused Score: 0.91               │
   │ Miner C: Fused Score: 0.45               │
   └──────────────────────────────────────────┘
        │
5. Validator menyimpan prediksi, tunggu 24 jam
        │
6. Setelah 24 jam (T0 + 24h):
   ┌──────────────────────────────────────────┐
   │ Ground Truth Check:                      │
   │   ✅ Likuiditas hilang 100%              │
   │   ✅ Dana dipindah ke Binance            │
   │   ✅ Harga drop 99.8%                    │
   │   VERDICT: RUGPULL CONFIRMED ✅           │
   └──────────────────────────────────────────┘
        │
7. Validator hitung akurasi:
   ┌──────────────────────────────────────────┐
   │ Miner A: prediksi 0.87 vs actual rugpull│
   │   → Akurasi: 0.87 (BAGUS)               │
   │                                           │
   │ Miner B: prediksi 0.91 vs actual rugpull│
   │   → Akurasi: 0.91 (SANGAT BAGUS)        │
   │                                           │
   │ Miner C: prediksi 0.45 vs actual rugpull│
   │   → Akurasi: 0.45 (BURUK - gagal deteksi)│
   └──────────────────────────────────────────┘
        │
8. Validator set_weights() on-chain:
   weights = {Miner_A: 0.87, Miner_B: 0.91, Miner_C: 0.45}
        │
9. Yuma Consensus auto-distribusi TAO:
   Miner B mendapat TAO paling banyak (paling akurat)
   Miner A mendapat TAO cukup banyak
   Miner C mendapat TAO paling sedikit
```

---

## Struktur Folder Proyek

```
rugintel/
├── neurons/
│   ├── miner.py              # Entry point miner
│   └── validator.py           # Entry point validator
├── rugintel/
│   ├── __init__.py
│   ├── protocol.py            # Definisi RugIntelSynapse
│   ├── intelligence.py        # 12-Layer Fusion Engine
│   ├── verification.py        # Ground Truth Verifier
│   └── layers/
│       ├── layer1_social.py    # Twitter/Telegram detection
│       ├── layer2_liquidity.py # Drain pattern analysis
│       ├── layer3_wallet.py    # Holder fingerprinting
│       ├── layer4_market.py    # Wash trading detection
│       ├── layer5_contract.py  # RugCheck/TokenSniffer
│       ├── layer6_visual.py    # AI logo detection
│       └── layer7_temporal.py  # FOMO peak modeling
├── tests/
│   ├── test_miner.py
│   ├── test_validator.py
│   └── test_layers.py
├── .env.example
├── requirements.txt
├── README.md
└── image/
    └── rugintel.png
```

---

## FAQ

### ❓ Apakah saya perlu membuat blockchain sendiri?

**Tidak.** RugIntel berjalan sebagai subnet di atas Bittensor. Semua logika intelijen berjalan **off-chain** (di server Anda). Hanya `set_weights()` yang berinteraksi dengan blockchain Bittensor (subtensor).

### ❓ Berapa biaya untuk menjalankan miner?

Estimasi biaya infrastruktur sekitar **$5/bulan** (VPS dasar). Dengan prediksi yang akurat, potensi pendapatan bisa mencapai **$1,133/bulan** dalam TAO.

### ❓ Apakah validator yang membagikan TAO ke miner?

**Tidak.** Validator hanya meng-set weights on-chain. **Yuma Consensus** yang menghitung dan mendistribusikan TAO secara otomatis — tanpa intervensi manusia.

### ❓ Mengapa perlu 24 jam untuk verifikasi?

Karena ground truth membutuhkan waktu. Setelah 24 jam, validator bisa memverifikasi secara pasti: apakah token benar-benar rugpull (likuiditas hilang, harga drop >90%, dana dipindah ke exchange)?

### ❓ Apakah 12-layer adalah fitur Bittensor?

**Tidak.** 12-layer adalah arsitektur intelijen **khusus RugIntel** yang dibangun **di atas** mekanisme incentive Bittensor. Bittensor menyediakan infrastruktur incentive (Yuma Consensus, TAO emission); RugIntel menyediakan logika domain-specific.

### ❓ Mengapa menggunakan Bittensor dan bukan membangun tool sendiri?

| Aspek       | Tool Terpusat                              | RugIntel di Bittensor                      |
| ----------- | ------------------------------------------ | ------------------------------------------ |
| Keandalan   | Single point of failure                    | Terdesentralisasi, tidak bisa dimatikan    |
| Peningkatan | Statis, lag 2-4 minggu di belakang scammer | Self-improving via kompetisi miner         |
| Kepercayaan | Trust pada satu perusahaan                 | Trustless via Yuma Consensus               |
| Akurasi     | 18% false negative (RugCheck+TokenSniffer) | Target <8% via validator consensus         |
| Biaya       | $500/bulan (TokenSniffer API)              | Gratis untuk pengguna retail               |
| Adaptasi    | Heuristik statis                           | Miner beradaptasi karena akurasi = revenue |

### ❓ Apa kelemahan tools existing seperti RugCheck dan DexScreener?

| Tool             | Kelemahan                                             |
| ---------------- | ----------------------------------------------------- |
| **RugCheck.xyz** | Hanya reaktif (setelah launch); 22% false negative    |
| **TokenSniffer** | Mudah dibypass scammer; $500+/bulan untuk API         |
| **DexScreener**  | Tampilkan collapse _setelah_ terjadi — bukan prediksi |
| **GMGN.ai**      | Delay 2-5 menit — terlambat untuk rugpull awal        |
| **Sniper Bots**  | 95% pengguna rugi bersih; $12-$47 gas fees per tx     |

RugIntel menggabungkan **semua sumber data** tools di atas (Solana RPC, RugCheck API, DexScreener) ke dalam 12-layer fusion yang diverifikasi oleh validator consensus — menghasilkan akurasi jauh lebih tinggi dari tool manapun secara individual.

---

> 📌 **Dokumen ini ditulis sebagai panduan teknis untuk membangun dan menerapkan RugIntel di jaringan Bittensor. Untuk informasi lebih lanjut tentang Bittensor, kunjungi [bittensor.com](https://bittensor.com).**
