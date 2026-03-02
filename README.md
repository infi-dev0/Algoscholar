# 🎓 ScholarAgent
### AI-Governed Autonomous On-Chain Scholarship Treasury

[![Algorand](https://img.shields.io/badge/Blockchain-Algorand-00C6FF)](https://algorand.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack](https://img.shields.io/badge/Stack-React--Node--Python-blue)]()
[![Track](https://img.shields.io/badge/Track-Agentic%20Commerce-green)]()

## 🧠 Overview
**ScholarAgent** is India's first AI-governed autonomous scholarship treasury built on the **Algorand Blockchain**. It eliminates human bias and manual processing by using an AI Agent to evaluate eligibility and a **PyTeal Smart Contract** to disburse funds. 

The system features a **Playwright-driven Autonomous Agent** that automatically fills government scholarship portals (like MahaDBT) for the student, truly achieving a "fill once, apply everywhere" experience.

---

## 📁 Project Architecture: Line-by-Line Analysis

The project is structured into four core modules that collaborate to provide an end-to-end autonomous flow.

### 1. 🖥️ [Frontend](file:///e:/algo/scholar-agent/frontend) (React.js + Three.js)
The student portal and transparency dashboard.
- **`App.jsx`**: Manages the main application state, routing, and Firebase authentication. It features a modern UI with a 3D image sequence for a premium feel.
- **`src/components/WalletConnect.jsx`**: Integrates **Pera Wallet** connect for secure on-chain student identification.
- **`src/pages/Apply.jsx`**: A streamlined form that collects academic and financial data used for AI scoring.
- **`src/pages/Dashboard.jsx`**: Real-time tracker for application status, budget remaining, and on-chain transaction history.

### 2. ⚙️ [Backend](file:///e:/algo/scholar-agent/backend) (Node.js + Express)
The central nervous system orchestrating the AI and Blockchain.
- **`index.js`**: Standard Express server entry point with CORS and middleware.
- **`routes/applications.js`**: Handles scholarship submissions, triggering the AI engine and storing results.
- **`services/algorand.js`**: Communicates with the Algorand SDK (`algosdk`) to sign transactions and query contract state.

### 3. 🤖 [AI Engine](file:///e:/algo/scholar-agent/ai-engine) (Python + Flask)
The decision-making heart of the platform.
- **`main.py`**: A Flask API exposing `/evaluate` and `/batch-evaluate` endpoints.
- **`rules/policy_rules.py`**: Defines the weighted formula:
    - **Academic (40%)**: Min 70% required.
    - **Income (35%)**: Max ₹2,50,000 family income.
    - **Attendance (15%)**: Min 75% required.
    - **Category (10%)**: Special weight for SC/ST/OBC/EWS.
- **`evaluator/eligibility_engine.py`**: Implements the logic that calculates the "Eligibility Score" (0.00 to 1.00).

### 4. ⛓️ [Algorand Integration](file:///e:/algo/scholar-agent/algorand) (PyTeal + ASA)
The immutable layer for fund governance.
- **`contracts/approval_program.py`**: A **PyTeal** smart contract that:
    - Enforces a **₹50,000 monthly treasury cap**.
    - Restricts max disbursement to **₹10,000 per student**.
    - Stores eligibility scores in the student's **Local State**.
- **`asa/scholar_token.py`**: Creates the **SCHOLAR ASA** (1 SCHOLAR = ₹1), enabling transparent tracking.
- **`wallet/treasury.js`**: AI-controlled wallet logic that signs atomic transactions on approval.

---

## 🚀 Autonomous Flow (How it Works)

1. **Student Submission**: User fills details once on the React portal.
2. **AI Evaluation**: The Python engine calculates a weighted score.
3. **Agent Portal Entry**: A **Playwright** agent auto-navigates to government portals, solves captchas, and submits data on behalf of the student.
4. **On-Chain Verification**: The Smart Contract checks the AI score against treasury limits.
5. **Atomic Disbursement**: On approval, SCHOLAR tokens are sent to the student's Pera Wallet, and a **SoulBound ARC-69 NFT** is minted as permanent proof of scholarship.

---

## 🛠️ Setup & Execution

### Prerequisites
- Node.js & npm
- Python 3.10+
- Algorand Sandbox (or TestNet access)

### 1. Frontend
```bash
cd frontend
npm install
npm start
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
```

### 3. AI Engine
```bash
cd ai-engine
pip install -r requirements.txt
python main.py
```

### 4. Algorand Contracts
```bash
cd algorand/contracts
python scholarship_contract.py
```

---

## 🔐 Policy Configuration

| Metric | Requirement | Weight |
|---|---|---|
| Family Income | ≤ ₹2,50,000 | 35% |
| Academic Marks | ≥ 70% | 40% |
| Attendance | ≥ 75% | 15% |
| Category | SC/ST/OBC/EWS | 10% |

## 🏆 Hackathon Credits
- **Focus**: Agentic Commerce (Autonomous Payments)
- **Problem Statement**: PS3 - A2A Autonomous Payments
- **Technologies**: Algorand, PyTeal, React, Node.js, Python, Flask, Playwright.

---
© 2026 ScholarAgent Project · [GitHub](https://github.com/anant-dev0/Algoscholar)