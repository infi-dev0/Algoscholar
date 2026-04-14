# ============================================================
#  ScholarAgent — AlgoDocVault Smart Contract (PyTeal)
#  File: algorand/contracts/docvault_contract.py
#  Purpose: Box Storage for student document hashes
# ============================================================

from pyteal import *

def docvault_program():
    # ── Keys & Constants ──
    # Boxes will be named by combining student address + doc_type
    
    # ── Helpers ──
    is_creator = Txn.sender() == Global.creator_address()
    # In a real app, we'd check if the sender is a verified Oracle
    is_oracle = Int(1) 

    # ── Methods ──

    # store_document(student_addr, doc_type, hash, cid)
    # Args: [0]="store", [1]=addr, [2]=type, [3]=hash, [4]=cid
    student_addr = Txn.application_args[1]
    doc_type     = Txn.application_args[2]
    doc_hash     = Txn.application_args[3]
    doc_cid      = Txn.application_args[4]
    
    # Box name = student_addr + doc_type
    box_name = Concat(student_addr, doc_type)

    on_store = Seq([
        Assert(is_oracle),
        # Box size: 32 (hash) + 64 (cid) + 8 (timestamp) = 104 bytes
        App.box_put(box_name, Concat(doc_hash, doc_cid, Itob(Global.latest_timestamp()))),
        Approve()
    ])

    # verify_document(student_addr, doc_type, hash)
    # Returns True if hash matches what's in the box
    provided_hash = Txn.application_args[3]
    
    on_verify = Seq([
        # Read hash from box (first 32 bytes)
        Assert(Extract(App.box_get(box_name).value(), Int(0), Int(32)) == provided_hash),
        Approve()
    ])

    # ── Routing ──
    on_noop = Cond(
        [Txn.application_args[0] == Bytes("store"),  on_store],
        [Txn.application_args[0] == Bytes("verify"), on_verify],
    )

    program = Cond(
        [Txn.application_id() == Int(0), Approve()],
        [Txn.on_completion() == OnComplete.NoOp, on_noop],
        [Txn.on_completion() == OnComplete.OptIn, Approve()],
    )

    return program

if __name__ == "__main__":
    from pyteal import compileTeal, Mode
    approval_teal = compileTeal(docvault_program(), mode=Mode.Application, version=8)
    with open("docvault_approval.teal", "w") as f:
        f.write(approval_teal)
    print("✅ DocVault contract compiled to docvault_approval.teal")
