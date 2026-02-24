# ============================================================
#  ScholarAgent — AI-Controlled Treasury Wallet
#  File: algorand/wallet/treasury_wallet.py
#  Purpose: A2A Autonomous Payment — AI Agent wallet
# ============================================================

import os, sys
from algosdk import transaction, account, mnemonic, encoding
from algosdk.v2client import algod
from algosdk.atomic_transaction_composer import (
    AtomicTransactionComposer,
    TransactionWithSigner,
    AccountTransactionSigner,
)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'utils'))
from config import (
    ALGOD_ADDRESS, ALGOD_TOKEN,
    MAX_PER_STUDENT_MONTHLY, MAX_MONTHLY_TREASURY,
)


def get_algod_client():
    return algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)


class TreasuryWallet:
    """AI-Governed Treasury Wallet — A2A Autonomous Payment Core"""

    def __init__(self, treasury_mnemonic=None, agent_mnemonic=None,
                 app_id=None, asset_id=None):
        """
        Initialize with wallet mnemonics (from env vars in production).
        """
        treasury_mn = treasury_mnemonic or os.getenv("TREASURY_MNEMONIC", "")
        agent_mn    = agent_mnemonic or os.getenv("AGENT_MNEMONIC", "")

        if treasury_mn:
            self.treasury_key     = mnemonic.to_private_key(treasury_mn)
            self.treasury_address = account.address_from_private_key(self.treasury_key)
        else:
            self.treasury_key = None
            self.treasury_address = os.getenv("TREASURY_ADDRESS")

        if agent_mn:
            self.agent_key     = mnemonic.to_private_key(agent_mn)
            self.agent_address = account.address_from_private_key(self.agent_key)
        else:
            self.agent_key = None
            self.agent_address = os.getenv("AGENT_ADDRESS")

        self.app_id   = app_id or int(os.getenv("SCHOLARSHIP_APP_ID", "0"))
        self.asset_id = asset_id or int(os.getenv("SCHOLAR_ASSET_ID", "0"))
        self.client   = get_algod_client()

    def authorize_payment(self, student_address, amount, eligibility_data):
        """
        AI Agent authorizes payment by calling the smart contract.
        Returns: tx_id on success, None on failure.
        """
        if amount > MAX_PER_STUDENT_MONTHLY:
            print(f"❌ Amount {amount} exceeds per-student limit {MAX_PER_STUDENT_MONTHLY}")
            return None

        # Check current monthly usage
        balance_info = self.get_treasury_state()
        if balance_info:
            remaining = balance_info["monthly_limit"] - balance_info["total_distributed"]
            if amount > remaining:
                print(f"❌ Amount {amount} exceeds remaining monthly budget {remaining}")
                return None

        score = eligibility_data.get("score", 0)

        # Call smart contract: approve(student_addr, amount, score)
        params = self.client.suggested_params()
        txn = transaction.ApplicationCallTxn(
            sender=self.agent_address,
            sp=params,
            index=self.app_id,
            on_complete=transaction.OnComplete.NoOpOC,
            app_args=[
                b"approve",
                amount.to_bytes(8, "big"),
                int(score * 100).to_bytes(8, "big"),
            ],
            accounts=[student_address],
        )

        signed = txn.sign(self.agent_key)
        tx_id = self.client.send_transaction(signed)
        result = transaction.wait_for_confirmation(self.client, tx_id, 4)
        print(f"✅ Payment authorized — tx: {tx_id}, round: {result['confirmed-round']}")
        return tx_id

    def execute_atomic_disbursement(self, student_address, amount):
        """
        Execute atomic transaction: app call + ASA transfer in one group.
        Ensures either both happen or neither.
        """
        params = self.client.suggested_params()
        signer = AccountTransactionSigner(self.treasury_key)
        agent_signer = AccountTransactionSigner(self.agent_key)

        atc = AtomicTransactionComposer()

        # Tx 1: App call to record approval
        app_txn = transaction.ApplicationCallTxn(
            sender=self.agent_address,
            sp=params,
            index=self.app_id,
            on_complete=transaction.OnComplete.NoOpOC,
            app_args=[
                b"approve",
                amount.to_bytes(8, "big"),
                int(0).to_bytes(8, "big"),
            ],
            accounts=[student_address],
        )
        atc.add_transaction(TransactionWithSigner(app_txn, agent_signer))

        # Tx 2: ASA token transfer
        transfer_txn = transaction.AssetTransferTxn(
            sender=self.treasury_address,
            sp=params,
            receiver=student_address,
            amt=amount * 100,  # base units
            index=self.asset_id,
        )
        atc.add_transaction(TransactionWithSigner(transfer_txn, signer))

        # Execute atomically
        result = atc.execute(self.client, 4)
        tx_ids = [r.tx_id for r in result.tx_ids] if hasattr(result, 'tx_ids') else [str(result)]
        print(f"✅ Atomic disbursement complete — {amount} SCHOLAR → {student_address[:8]}...")
        print(f"   Tx IDs: {tx_ids}")
        return tx_ids

    def get_treasury_balance(self):
        """Get current SCHOLAR token balance of treasury wallet"""
        try:
            info = self.client.account_info(self.treasury_address)
            for asset in info.get("assets", []):
                if asset["asset-id"] == self.asset_id:
                    return asset["amount"] / 100
            return 0
        except Exception as e:
            print(f"⚠️ Could not fetch balance: {e}")
            return 0

    def get_treasury_state(self):
        """Get smart contract global state"""
        try:
            info = self.client.application_info(self.app_id)
            state = {}
            for item in info.get("params", {}).get("global-state", []):
                key = item["key"]
                value = item["value"]
                if value["type"] == 2:  # uint
                    state[key] = value["uint"]
                else:
                    state[key] = value.get("bytes", "")

            return {
                "monthly_limit": state.get("monthly_limit", MAX_MONTHLY_TREASURY),
                "total_distributed": state.get("total_distributed", 0),
                "max_per_student": state.get("max_per_student", MAX_PER_STUDENT_MONTHLY),
                "paused": state.get("paused", 0) == 1,
            }
        except Exception as e:
            print(f"⚠️ Could not fetch state: {e}")
            return None

    def pause_treasury(self):
        """Emergency pause — creator/admin only"""
        params = self.client.suggested_params()
        txn = transaction.ApplicationCallTxn(
            sender=self.treasury_address,
            sp=params,
            index=self.app_id,
            on_complete=transaction.OnComplete.NoOpOC,
            app_args=[b"toggle_pause"],
        )
        signed = txn.sign(self.treasury_key)
        tx_id = self.client.send_transaction(signed)
        transaction.wait_for_confirmation(self.client, tx_id, 4)
        print(f"⚠️ Treasury pause toggled — tx: {tx_id}")
        return tx_id
