# ============================================================
#  ScholarAgent — Algorand Configuration
#  File: algorand/utils/config.py
# ============================================================

# Network configuration
NETWORK = "testnet"  # Change to "mainnet" for production

ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN   = ""  # Public node — no token required

INDEXER_ADDRESS = "https://testnet-idx.algonode.cloud"
INDEXER_TOKEN   = ""

# App IDs (set after deployment)
SCHOLARSHIP_APP_ID = None   # TODO: fill after deployment
SCHOLAR_ASSET_ID   = None   # TODO: fill after ASA creation

# Wallet addresses (load from env in production)
TREASURY_WALLET    = None   # TODO: load from .env
AI_AGENT_WALLET    = None   # TODO: load from .env

# Policy constants
MAX_PER_STUDENT_MONTHLY  = 10_000   # SCHOLAR tokens (₹10,000)
MAX_MONTHLY_TREASURY     = 50_000   # SCHOLAR tokens (₹50,000)
MIN_MARKS_PERCENTAGE     = 70       # Academic marks threshold
MIN_ATTENDANCE_PERCENT   = 75       # Attendance threshold
MAX_FAMILY_INCOME        = 250_000  # INR

# IPFS (for storing application documents)
IPFS_GATEWAY = "https://ipfs.io/ipfs/"
