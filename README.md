# 🎓 ScholarAgent
### AI-Governed Autonomous On-Chain Scholarship Treasury

[![Algorand](https://img.shields.io/badge/Blockchain-Algorand-00C6FF)](https://algorand.com)
[![Hackathon](https://img.shields.io/badge/Track-Agentic%20Commerce-green)]()
[![PS](https://img.shields.io/badge/PS3-A2A%20Autonomous%20Payments-blue)]()

## 🧠 Overview
ScholarAgent is an AI-governed autonomous scholarship treasury wallet built on Algorand.
The AI Agent evaluates student eligibility and disburses SCHOLAR tokens autonomously
using smart contracts — no human approval required.

## 📁 Project Structure
```
scholar-agent/
├── frontend/          → React.js UI (student portal + transparency dashboard)
├── backend/           → Node.js API server
├── ai-engine/         → Python ML/Rule engine (eligibility evaluation)
├── algorand/          → All Algorand integrations
│   ├── contracts/     → PyTeal smart contracts
│   ├── asa/           → SCHOLAR token (ASA)
│   ├── indexer/       → Transaction tracking
│   └── wallet/        → AI-controlled treasury wallet
└── docs/              → Architecture diagrams, API docs
```

## 🚀 Quick Start
```bash
# 1. Install dependencies
cd frontend && npm install
cd ../backend && npm install
cd ../ai-engine && pip install -r requirements.txt

# 2. Configure Algorand
cp algorand/utils/config.py.example algorand/utils/config.py
# Edit config.py with your wallet addresses

# 3. Deploy smart contract
cd algorand/contracts && python scholarship_contract.py

# 4. Create SCHOLAR ASA
cd algorand/asa && python scholar_token.py

# 5. Start services
npm run dev (backend)
python ai-engine/main.py
cd frontend && npm start
```

## 🔐 Policy Rules
| Rule | Threshold |
|---|---|
| Family Income | < ₹2,50,000 |
| Academic Marks | > 70% |
| Attendance | > 75% |
| Max per student | ₹10,000/month |
| Monthly treasury | ₹50,000/month |

## 🏆 Hackathon
- **Focus**: Agentic Commerce
- **PS3**: A2A Autonomous Payments
- **Stack**: React + Node.js + Python + Algorand PyTeal + ASA + Pera Wallet
