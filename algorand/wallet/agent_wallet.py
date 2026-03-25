# ============================================================
#  ScholarAgent — Algorand Agent Wallet Functions
#  File: algorand/wallet/agent_wallet.py
#  Purpose: SCHOLAR token transfer, soul-bound credentials, opt-in check
#  ← CONNECTS TO: backend/routes/agent.js (amount from scoring engine)
# ============================================================

import os
import json
import time

try:
    from algosdk import account, mnemonic, transaction
    from algosdk.v2client import algod
    ALGOSDK_AVAILABLE = True
except ImportError:
    ALGOSDK_AVAILABLE = False
    print("⚠️ algosdk not installed. Algorand functions disabled.")

from dotenv import load_dotenv
load_dotenv()

# Environment variables
ALGOD_TOKEN    = os.getenv('ALGOD_TOKEN', 'a' * 64)
ALGOD_URL      = os.getenv('ALGOD_URL', 'https://testnet-api.algonode.cloud')
INDEXER_URL    = os.getenv('INDEXER_URL', 'https://testnet-idx.algonode.cloud')
SCHOLAR_ASA_ID = os.getenv('SCHOLAR_ASA_ID', '0')


def _get_client():
    """Create Algorand client (TestNet only)"""
    return algod.AlgodClient(ALGOD_TOKEN, ALGOD_URL)


# ══════════════════════════════════════════════════════════════
#  FUNCTION 1 — send_scholar_tokens
#  Sends SCHOLAR ASA tokens. Amount from scoring engine, NOT hardcoded.
# ══════════════════════════════════════════════════════════════

def send_scholar_tokens(student_wallet: str, amount: int, ref_number: str) -> str:
    """
    Send SCHOLAR ASA tokens to student.

    Args:
        student_wallet: Student's Algorand address
        amount: Tier amount calculated by scoring engine (NOT hardcoded)
                ← Comes from calculate_score().amount
        ref_number: Portal reference number

    Returns:
        Transaction ID string
    """
    if not ALGOSDK_AVAILABLE:
        print("⚠️ algosdk not available, skipping token transfer")
        return "MOCK_TX_" + str(int(time.time()))

    agent_mnemonic = os.getenv('AGENT_MNEMONIC')
    if not agent_mnemonic:
        print("⚠️ AGENT_MNEMONIC not set, skipping token transfer")
        return "MOCK_TX_NO_MNEMONIC"

    algod_client = _get_client()
    private_key  = mnemonic.to_private_key(agent_mnemonic)
    sender       = account.address_from_private_key(private_key)
    params       = algod_client.suggested_params()

    txn = transaction.AssetTransferTxn(
        sender   = sender,
        sp       = params,
        receiver = student_wallet,
        amt      = amount,              # ← from scoring engine, not hardcoded
        index    = int(SCHOLAR_ASA_ID),
        note     = f"AlgoScholar:{ref_number}".encode()
    )
    signed = txn.sign(private_key)
    tx_id  = algod_client.send_transaction(signed)
    transaction.wait_for_confirmation(algod_client, tx_id, 4)
    print(f"✅ Sent {amount} SCHOLAR tokens → {student_wallet} | TX: {tx_id}")
    return tx_id


# ══════════════════════════════════════════════════════════════
#  FUNCTION 2 — mint_soulbound_credential
#  Non-transferable ASA. Score and amount from scoring engine.
# ══════════════════════════════════════════════════════════════

def mint_soulbound_credential(student_wallet: str, app_id: str,
                               score: float, amount: int) -> str:
    """
    Mint a non-transferable (soul-bound) ASA credential.

    Args:
        student_wallet: Student's Algorand address
        app_id: Application ID (e.g. "APP-00014")
        score: Eligibility score from calculate_score() (NOT hardcoded)
        amount: Tier amount from calculate_score() (NOT hardcoded)

    Returns:
        Transaction ID string
    """
    if not ALGOSDK_AVAILABLE:
        print("⚠️ algosdk not available, skipping credential mint")
        return "MOCK_SBT_TX_" + str(int(time.time()))

    agent_mnemonic = os.getenv('AGENT_MNEMONIC')
    if not agent_mnemonic:
        print("⚠️ AGENT_MNEMONIC not set, skipping credential mint")
        return "MOCK_SBT_NO_MNEMONIC"

    algod_client = _get_client()
    private_key  = mnemonic.to_private_key(agent_mnemonic)
    sender       = account.address_from_private_key(private_key)
    params       = algod_client.suggested_params()

    metadata = json.dumps({
        "standard":   "arc69",
        "description": "AlgoScholar EBC Scholarship 2025-26",
        "properties": {
            "app_id":           app_id,
            "eligibility_score": score,    # ← from scoring engine
            "amount_disbursed": amount,    # ← from scoring engine
            "scheme":           "EBC Scholarship 2025-26",
            "issued_at":        int(time.time())
        }
    })

    txn = transaction.AssetConfigTxn(
        sender        = sender,
        sp            = params,
        total         = 1,
        decimals      = 0,
        default_frozen= True,       # NON-TRANSFERABLE (soul-bound)
        asset_name    = f"SCHLR-{app_id}",
        unit_name     = "SCHLRCRD",
        manager       = "",         # No manager = immutable forever
        reserve       = "",
        freeze        = "",
        clawback      = "",
        note          = metadata.encode()
    )
    signed = txn.sign(private_key)
    tx_id  = algod_client.send_transaction(signed)
    transaction.wait_for_confirmation(algod_client, tx_id, 4)
    print(f"🏅 Soul-Bound credential minted | TX: {tx_id}")
    return tx_id


# ══════════════════════════════════════════════════════════════
#  FUNCTION 3 — check_opt_in
#  Verifies if student has opted in to the SCHOLAR ASA.
# ══════════════════════════════════════════════════════════════

def check_opt_in(student_wallet: str, asa_id: int = None) -> bool:
    """
    Check if student's wallet has opted in to the SCHOLAR ASA.

    Args:
        student_wallet: Student's Algorand address
        asa_id: ASA ID to check (defaults to SCHOLAR_ASA_ID)

    Returns:
        True if opted in, False otherwise
    """
    if not ALGOSDK_AVAILABLE:
        print("⚠️ algosdk not available, assuming opt-in")
        return True

    if asa_id is None:
        asa_id = int(SCHOLAR_ASA_ID)

    try:
        algod_client = _get_client()
        account_info = algod_client.account_info(student_wallet)
        assets       = account_info.get('assets', [])
        return any(a['asset-id'] == asa_id for a in assets)
    except Exception as e:
        print(f"⚠️ Could not check opt-in: {e}")
        return False


# ── CLI test ─────────────────────────────────────────────────
if __name__ == "__main__":
    print("AlgoScholar Agent Wallet")
    print(f"  ALGOD_URL:      {ALGOD_URL}")
    print(f"  SCHOLAR_ASA_ID: {SCHOLAR_ASA_ID}")
    print(f"  ALGOSDK:        {'✅' if ALGOSDK_AVAILABLE else '❌'}")
