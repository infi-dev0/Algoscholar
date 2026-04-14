# ============================================================
#  ScholarAgent — Approval Program v2.0 (PyTeal)
#  File: algorand/contracts/approval_program_v2.py
#  Purpose: v2.0 Logic requiring on-chain document proof
# ============================================================

from pyteal import *

def approval_program_v2():
    # ── Global state keys ──
    monthly_limit    = Bytes("monthly_limit")
    total_distributed = Bytes("total_distributed")
    max_per_student  = Bytes("max_per_student")
    agent_address    = Bytes("agent_address")
    paused           = Bytes("paused")

    # ── Local state keys ──
    eligibility_score   = Bytes("eligibility_score")
    amount_received     = Bytes("amount_received")
    application_status  = Bytes("application_status")
    doc_verified        = Bytes("doc_verified") # ✨ NEW in v2.0

    # ── Helpers ──
    is_creator = Txn.sender() == Global.creator_address()
    is_agent   = Txn.sender() == App.globalGet(agent_address)
    not_paused = App.globalGet(paused) == Int(0)

    # ── On Creation ──
    on_creation = Seq([
        App.globalPut(monthly_limit, Int(50000)),
        App.globalPut(total_distributed, Int(0)),
        App.globalPut(max_per_student, Int(10000)),
        App.globalPut(agent_address, Txn.application_args[1]),
        App.globalPut(paused, Int(0)),
        Approve()
    ])

    # ── Opt In ──
    on_optin = Seq([
        App.localPut(Txn.sender(), doc_verified, Int(0)), # Default to not verified
        App.localPut(Txn.sender(), application_status, Bytes("pending")),
        Approve()
    ])

    # ── Verify Document (External Oracle call) ──
    on_verify_doc = Seq([
        Assert(is_creator), # In prod, would be is_oracle
        App.localPut(Txn.accounts[1], doc_verified, Int(1)),
        Approve()
    ])

    # ── Approve Application (Extended for v2.0) ──
    student_addr = Txn.accounts[1]
    amount       = Btoi(Txn.application_args[2])
    score        = Btoi(Txn.application_args[3])

    approve_application = Seq([
        Assert(is_agent),
        Assert(not_paused),
        # ✨ v2.0 GATE: Student must have verified documents on-chain
        Assert(App.localGet(student_addr, doc_verified) == Int(1)),
        
        # Budget checks
        Assert(amount <= App.globalGet(max_per_student)),
        
        # Update state
        App.localPut(student_addr, eligibility_score, score),
        App.localPut(student_addr, application_status, Bytes("approved")),
        App.globalPut(total_distributed, App.globalGet(total_distributed) + amount),
        Approve()
    ])

    # ── Routing ──
    on_noop = Cond(
        [Txn.application_args[0] == Bytes("approve"),        approve_application],
        [Txn.application_args[0] == Bytes("verify_doc"),     on_verify_doc],
    )

    return Cond(
        [Txn.application_id() == Int(0),                     on_creation],
        [Txn.on_completion()   == OnComplete.OptIn,          on_optin],
        [Txn.on_completion()   == OnComplete.NoOp,           on_noop],
    )

if __name__ == "__main__":
    from pyteal import compileTeal, Mode
    approval_teal = compileTeal(approval_program_v2(), mode=Mode.Application, version=8)
    with open("approval_v2.teal", "w") as f:
        f.write(approval_teal)
    print("✅ Scholarship Contract v2.0 compiled")
