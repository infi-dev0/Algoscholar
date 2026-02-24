# ScholarAgent Architecture

## System Flow
```
Student (React UI)
  → POST /api/applications/submit (Node.js Backend)
    → IPFS (store documents)
    → AI Engine (Python) → EligibilityEngine.evaluate()
      → Policy Rules Check
      → Monthly Budget Check (Algorand Indexer)
      → Decision: approve/reject + amount
    → Smart Contract Call (PyTeal on Algorand)
      → Atomic Transaction:
         [1] AI Agent verifies eligibility score on-chain
         [2] SCHOLAR ASA transferred from Treasury → Student
         [3] Local state updated (amount_received, status)
      → Transaction ID returned
  → Frontend shows result + Algorand Explorer link
```

## A2A Payment Flow (PS3)
```
AI Agent Wallet ──controls──▶ Treasury Wallet
                                    │
                              Smart Contract
                                    │
                         Rule-Based Approval Logic
                                    │
                          Atomic SCHOLAR Transfer
                                    │
                              Student Wallet
```
