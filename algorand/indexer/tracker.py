# ============================================================
#  ScholarAgent — Algorand Indexer API
#  File: algorand/indexer/tracker.py
#  Purpose: Track scholarship payments, view tx history,
#           power the transparency dashboard
# ============================================================

import json
from datetime import datetime
from algosdk.v2client import indexer

INDEXER_ADDRESS = "https://testnet-idx.algonode.cloud"
INDEXER_TOKEN   = ""  # Public node


def get_indexer_client():
    return indexer.IndexerClient(INDEXER_TOKEN, INDEXER_ADDRESS)


def get_all_disbursements(app_id):
    """Fetch all scholarship payment transactions for an app"""
    client = get_indexer_client()
    try:
        response = client.search_transactions(
            application_id=app_id,
            txn_type="appl",
        )
        transactions = []
        for txn in response.get("transactions", []):
            app_args = txn.get("application-transaction", {}).get("application-args", [])
            if app_args and app_args[0] == "YXBwcm92ZQ==":  # base64 "approve"
                transactions.append({
                    "tx_id": txn["id"],
                    "round": txn["confirmed-round"],
                    "timestamp": txn.get("round-time", 0),
                    "sender": txn["sender"],
                    "accounts": txn.get("application-transaction", {}).get("accounts", []),
                    "type": "disbursement",
                })
        return transactions
    except Exception as e:
        print(f"⚠️ Indexer error: {e}")
        return []


def get_student_history(student_address):
    """Get all transactions related to a specific student"""
    client = get_indexer_client()
    try:
        response = client.search_transactions_by_address(
            address=student_address,
            txn_type="appl",
        )
        history = []
        for txn in response.get("transactions", []):
            history.append({
                "tx_id": txn["id"],
                "round": txn["confirmed-round"],
                "timestamp": txn.get("round-time", 0),
                "type": txn.get("tx-type", "unknown"),
            })
        return history
    except Exception as e:
        print(f"⚠️ Indexer error: {e}")
        return []


def get_monthly_total(app_id, month, year):
    """Calculate total disbursements for a specific month"""
    client = get_indexer_client()
    try:
        # Calculate date range
        start = datetime(year, month, 1)
        if month == 12:
            end = datetime(year + 1, 1, 1)
        else:
            end = datetime(year, month + 1, 1)

        after_time = start.strftime("%Y-%m-%dT00:00:00Z")
        before_time = end.strftime("%Y-%m-%dT00:00:00Z")

        response = client.search_transactions(
            application_id=app_id,
            txn_type="appl",
            start_time=after_time,
            end_time=before_time,
        )

        total = 0
        count = 0
        for txn in response.get("transactions", []):
            app_args = txn.get("application-transaction", {}).get("application-args", [])
            if app_args and len(app_args) >= 3:
                # Amount is in the second argument
                try:
                    import base64
                    amount_bytes = base64.b64decode(app_args[1])
                    amount = int.from_bytes(amount_bytes, "big")
                    total += amount
                    count += 1
                except Exception:
                    pass

        return {"month": month, "year": year, "total": total, "count": count}
    except Exception as e:
        print(f"⚠️ Indexer error: {e}")
        return {"month": month, "year": year, "total": 0, "count": 0}


def get_asset_holders(asset_id):
    """Get all holders of SCHOLAR token"""
    client = get_indexer_client()
    try:
        response = client.asset_balances(asset_id)
        holders = []
        for balance in response.get("balances", []):
            if balance["amount"] > 0:
                holders.append({
                    "address": balance["address"],
                    "amount": balance["amount"] / 100,
                })
        return holders
    except Exception as e:
        print(f"⚠️ Indexer error: {e}")
        return []


def export_audit_report(app_id, start_date, end_date):
    """Export transactions as list for compliance reporting"""
    client = get_indexer_client()
    try:
        response = client.search_transactions(
            application_id=app_id,
            txn_type="appl",
            start_time=start_date,
            end_time=end_date,
        )
        report = []
        for txn in response.get("transactions", []):
            report.append({
                "tx_id": txn["id"],
                "round": txn["confirmed-round"],
                "timestamp": txn.get("round-time", 0),
                "sender": txn["sender"],
                "fee": txn.get("fee", 0),
                "type": "scholarship_disbursement",
            })
        return report
    except Exception as e:
        print(f"⚠️ Indexer error: {e}")
        return []


if __name__ == "__main__":
    print("ScholarAgent — Indexer Tracker")
    print("Usage: from tracker import get_all_disbursements")
