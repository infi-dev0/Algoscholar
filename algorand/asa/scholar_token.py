# ============================================================
#  ScholarAgent — SCHOLAR ASA Token Creation
#  File: algorand/asa/scholar_token.py
#  Purpose: Create and manage SCHOLAR ASA on Algorand
# ============================================================

from algosdk import transaction, account, mnemonic
from algosdk.v2client import algod
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'utils'))
from config import ALGOD_ADDRESS, ALGOD_TOKEN


def get_algod_client():
    return algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)


def create_scholar_token(algod_client, creator_private_key, creator_address):
    """
    Create the SCHOLAR ASA token on Algorand.
    Returns: asset_id (int)
    """
    params = algod_client.suggested_params()

    txn = transaction.AssetConfigTxn(
        sender=creator_address,
        sp=params,
        total=10_000_000,       # 10 million tokens
        decimals=2,             # Each token = ₹1.00
        unit_name="SCHOLAR",
        asset_name="ScholarAgent Token",
        url="https://scholaragent.in",
        manager=creator_address,
        reserve=creator_address,
        freeze=creator_address,     # Treasury controls freezing
        clawback=creator_address,   # Treasury can clawback
        default_frozen=False,
        metadata_hash=b"ScholarAgentASAv1\x00" * 2,  # 32 bytes
    )

    signed_txn = txn.sign(creator_private_key)
    tx_id = algod_client.send_transaction(signed_txn)
    print(f"📤 ASA creation tx sent: {tx_id}")

    result = transaction.wait_for_confirmation(algod_client, tx_id, 4)
    asset_id = result["asset-index"]
    print(f"✅ SCHOLAR token created — Asset ID: {asset_id}")

    return asset_id


def opt_in_student(algod_client, student_private_key, student_address, asset_id):
    """
    Student opts in to receive SCHOLAR tokens.
    Must be called before any token transfer.
    """
    params = algod_client.suggested_params()

    txn = transaction.AssetTransferTxn(
        sender=student_address,
        sp=params,
        receiver=student_address,
        amt=0,
        index=asset_id,
    )

    signed_txn = txn.sign(student_private_key)
    tx_id = algod_client.send_transaction(signed_txn)
    print(f"📤 Opt-in tx sent: {tx_id}")

    transaction.wait_for_confirmation(algod_client, tx_id, 4)
    print(f"✅ Student {student_address[:8]}... opted in to SCHOLAR (asset {asset_id})")

    return tx_id


def transfer_scholar_tokens(algod_client, sender_key, receiver_address, asset_id, amount):
    """
    Transfer SCHOLAR tokens from treasury to student.
    Amount is in base units (e.g., 10000 = ₹10,000.00 with 2 decimals → 1000000).
    """
    params = algod_client.suggested_params()

    txn = transaction.AssetTransferTxn(
        sender=account.address_from_private_key(sender_key),
        sp=params,
        receiver=receiver_address,
        amt=amount * 100,  # Convert to base units (2 decimals)
        index=asset_id,
    )

    signed_txn = txn.sign(sender_key)
    tx_id = algod_client.send_transaction(signed_txn)
    print(f"📤 Transfer tx sent: {tx_id} — {amount} SCHOLAR → {receiver_address[:8]}...")

    result = transaction.wait_for_confirmation(algod_client, tx_id, 4)
    print(f"✅ Transfer confirmed in round {result['confirmed-round']}")

    return tx_id


def get_asset_balance(algod_client, address, asset_id):
    """Get SCHOLAR token balance for an address"""
    account_info = algod_client.account_info(address)
    for asset in account_info.get("assets", []):
        if asset["asset-id"] == asset_id:
            return asset["amount"] / 100  # Convert from base units
    return 0


if __name__ == "__main__":
    print("=" * 50)
    print("  SCHOLAR ASA Token Manager")
    print("=" * 50)
    print("\nUsage:")
    print("  from scholar_token import create_scholar_token")
    print("  asset_id = create_scholar_token(client, key, addr)")
