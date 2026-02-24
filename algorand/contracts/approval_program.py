# ============================================================
#  ScholarAgent — Approval Program (PyTeal)
#  File: algorand/contracts/approval_program.py
#  Purpose: Main approval logic for scholarship disbursement
#
#  Global State:
#    monthly_limit (int), total_distributed (int),
#    max_per_student (int), treasury_wallet (bytes),
#    agent_address (bytes), paused (int)
#
#  Local State (per student):
#    eligibility_score (int), amount_received (int),
#    application_status (bytes), last_round (int)
# ============================================================

from pyteal import *


def approval_program():
    # ── Global state keys ──
    monthly_limit    = Bytes("monthly_limit")
    total_distributed = Bytes("total_distributed")
    max_per_student  = Bytes("max_per_student")
    treasury_wallet  = Bytes("treasury_wallet")
    agent_address    = Bytes("agent_address")
    paused           = Bytes("paused")

    # ── Local state keys ──
    eligibility_score   = Bytes("eligibility_score")
    amount_received     = Bytes("amount_received")
    application_status  = Bytes("application_status")
    last_round          = Bytes("last_round")

    # ── Helpers ──
    is_creator = Txn.sender() == Global.creator_address()
    is_agent   = Txn.sender() == App.globalGet(agent_address)
    not_paused = App.globalGet(paused) == Int(0)

    # ── On Creation ──
    on_creation = Seq([
        App.globalPut(monthly_limit, Int(50000)),
        App.globalPut(total_distributed, Int(0)),
        App.globalPut(max_per_student, Int(10000)),
        App.globalPut(treasury_wallet, Txn.application_args[0]),
        App.globalPut(agent_address, Txn.application_args[1]),
        App.globalPut(paused, Int(0)),
        Approve()
    ])

    # ── Opt In (student registration) ──
    on_optin = Seq([
        App.localPut(Txn.sender(), eligibility_score, Int(0)),
        App.localPut(Txn.sender(), amount_received, Int(0)),
        App.localPut(Txn.sender(), application_status, Bytes("pending")),
        App.localPut(Txn.sender(), last_round, Global.round()),
        Approve()
    ])

    # ── Approve Application ──
    # Args: [0]="approve", [1]=student_addr, [2]=amount, [3]=score
    student_addr = Txn.application_args[1]
    amount       = Btoi(Txn.application_args[2])
    score        = Btoi(Txn.application_args[3])

    approve_application = Seq([
        Assert(is_agent),
        Assert(not_paused),
        # Budget checks
        Assert(amount <= App.globalGet(max_per_student)),
        Assert(
            App.globalGet(total_distributed) + amount
            <= App.globalGet(monthly_limit)
        ),
        # Update student local state
        App.localPut(Txn.accounts[1], eligibility_score, score),
        App.localPut(Txn.accounts[1], amount_received,
            App.localGet(Txn.accounts[1], amount_received) + amount
        ),
        App.localPut(Txn.accounts[1], application_status, Bytes("approved")),
        App.localPut(Txn.accounts[1], last_round, Global.round()),
        # Update global state
        App.globalPut(total_distributed,
            App.globalGet(total_distributed) + amount
        ),
        Approve()
    ])

    # ── Reject Application ──
    # Args: [0]="reject", [1]=student_addr
    reject_application = Seq([
        Assert(is_agent),
        App.localPut(Txn.accounts[1], application_status, Bytes("rejected")),
        App.localPut(Txn.accounts[1], last_round, Global.round()),
        Approve()
    ])

    # ── Update Policy ──
    # Args: [0]="update_policy", [1]=new_monthly_limit, [2]=new_max_per_student
    update_policy = Seq([
        Assert(is_creator),
        App.globalPut(monthly_limit, Btoi(Txn.application_args[1])),
        App.globalPut(max_per_student, Btoi(Txn.application_args[2])),
        Approve()
    ])

    # ── Reset Monthly Counter ──
    # Args: [0]="reset_monthly"
    reset_monthly = Seq([
        Assert(Or(is_creator, is_agent)),
        App.globalPut(total_distributed, Int(0)),
        Approve()
    ])

    # ── Pause / Unpause (emergency) ──
    toggle_pause = Seq([
        Assert(is_creator),
        App.globalPut(paused,
            If(App.globalGet(paused) == Int(0), Int(1), Int(0))
        ),
        Approve()
    ])

    # ── Route NoOp calls ──
    on_noop = Cond(
        [Txn.application_args[0] == Bytes("approve"),        approve_application],
        [Txn.application_args[0] == Bytes("reject"),         reject_application],
        [Txn.application_args[0] == Bytes("update_policy"),  update_policy],
        [Txn.application_args[0] == Bytes("reset_monthly"),  reset_monthly],
        [Txn.application_args[0] == Bytes("toggle_pause"),   toggle_pause],
    )

    # ── Main Router ──
    program = Cond(
        [Txn.application_id() == Int(0),                     on_creation],
        [Txn.on_completion()   == OnComplete.OptIn,          on_optin],
        [Txn.on_completion()   == OnComplete.NoOp,           on_noop],
        [Txn.on_completion()   == OnComplete.DeleteApplication, Return(is_creator)],
        [Txn.on_completion()   == OnComplete.UpdateApplication, Return(is_creator)],
        [Txn.on_completion()   == OnComplete.CloseOut,       Approve()],
    )

    return program
