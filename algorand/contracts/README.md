# Algorand Smart Contracts

## Files
| File | Purpose |
|---|---|
| `scholarship_contract.py` | Main PyTeal contract — policy rules, state storage |
| `approval_program.py` | Approval logic for atomic transactions |
| `clear_program.py` | Clear state program |

## Deploy Instructions
```bash
# Install PyTeal
pip install pyteal

# Compile
python scholarship_contract.py

# Deploy to testnet via goal
goal app create --creator <WALLET> --approval-prog approval.teal --clear-prog clear.teal \
  --global-byteslices 2 --global-ints 4 --local-byteslices 1 --local-ints 3
```

## Policy Rules Encoded
- Family Income < ₹2,50,000 → encoded as eligibility_flag
- Academic Marks > 70% → encoded as marks_score
- Attendance > 75% → encoded as attendance_score
- Max ₹10,000 per student per month
- Max ₹50,000 monthly treasury limit
