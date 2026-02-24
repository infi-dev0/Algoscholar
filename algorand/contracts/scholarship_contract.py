# ============================================================
#  ScholarAgent — Algorand Smart Contract (PyTeal)
#  File: algorand/contracts/scholarship_contract.py
#  Purpose: Compile approval + clear programs to TEAL
# ============================================================

from pyteal import *
from approval_program import approval_program
from clear_program import clear_state_program

def compile_contract():
    """Compile PyTeal to TEAL assembly"""
    approval_teal = compileTeal(approval_program(), mode=Mode.Application, version=8)
    clear_teal = compileTeal(clear_state_program(), mode=Mode.Application, version=8)

    with open("approval.teal", "w") as f:
        f.write(approval_teal)
    print(f"✅ Approval program compiled ({len(approval_teal)} bytes)")

    with open("clear.teal", "w") as f:
        f.write(clear_teal)
    print(f"✅ Clear program compiled ({len(clear_teal)} bytes)")

    return approval_teal, clear_teal


if __name__ == "__main__":
    print("=" * 50)
    print("  ScholarAgent — PyTeal Smart Contract Compiler")
    print("=" * 50)
    compile_contract()
    print("\n📁 Output: approval.teal, clear.teal")
    print("🚀 Deploy with: goal app create ...")
