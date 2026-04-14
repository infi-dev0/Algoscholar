<div align="center">

# 🎓 ScholarAgent

**AI-Governed Autonomous On-Chain Scholarship Treasury**
*Algorand License Stack Track · Hackathon 2026*

</div>

<br>

## ENHANCED VISION — v2.0
**India's First Fully Autonomous, Document-Verified, Zero-Office-Visit Scholarship Platform**

| ⛓️ Algorand | 🤖 AI Engine | 📄 DocVault | 🔐 Zero-KYC |
| :--- | :--- | :--- | :--- |
| On-chain document hashes & treasury | Weighted eligibility scoring | Live document updates, no office visits | DigiLocker + Aadhaar eKYC integration |

© 2026 ScholarAgent Project · Built on Algorand Blockchain

---
## 1. The Real Problem: Why Students Struggle
Every year, millions of eligible Indian students miss out on government scholarships — not because they don't qualify, but because the process is broken. Here is the reality students face today:

### 😓 The Office Visit Nightmare
Students in rural Maharashtra, UP, Bihar, and other states must visit taluka offices, tehsil offices, and district offices to get their income certificate attested. Each visit costs them travel money, a day of college, and still results in being turned away for 'missing signatures' or 'wrong format'. This cycle repeats for every new scholarship year.

### Real Struggles Students Face
- 🏛️ **Multiple Office Visits:** Income certificate requires SDO signature → go to tehsil → wait 2–3 days → rejected for wrong format → repeat
- 📂 **Document Chaos:** 8–12 documents needed per scheme. Different formats for each portal (MahaDBT, NSP, State Portals)
- 🔁 **Expiry & Re-Submission:** Income certificate valid only 6 months. Students re-apply every year from scratch with no continuity
- 🌐 **Digital Divide:** Government portals crash, have CAPTCHAs that don't load, and require Aadhaar OTP which rural students can't access
- ⏳ **Manual Processing Delays:** Applications sit in pending for 6–18 months. No transparency on why they were rejected
- 💸 **Financial Loss:** Students often pay 'middlemen' ₹500–₹2,000 to fill forms for them — money they can't afford
- 📵 **No Single Window:** A student eligible for 5 schemes must apply on 5 separate portals with 5 separate sets of documents

### 💡 ScholarAgent v2 Solution
One unified profile. AI-verified documents stored on Algorand. Autonomous agent applies everywhere. Documents update in real-time — no office visits, no middlemen, no delays. Ever.

---
## 2. New Module: AlgoDocVault™ — On-Chain Document Verification
The most powerful addition to ScholarAgent v2 is AlgoDocVault — a live, updatable, government-verifiable document vault anchored permanently on the Algorand blockchain.

### 2.1 How On-Chain Document Verification Works
Every document a student uploads is cryptographically hashed and stored on the Algorand blockchain. The document file itself is stored in encrypted IPFS storage, but its SHA-256 fingerprint is written on-chain. This means:
- A student's income certificate uploaded in 2024 cannot be retroactively altered — its hash is permanently on-chain
- If the income changes in 2025, the student uploads a NEW certificate — the old one is archived, not deleted (immutable audit trail)
- Any government officer, scholarship committee, or portal can independently verify the document's authenticity without contacting the student
- No central authority can manipulate or lose documents — they exist perpetually on Algorand

### 2.2 Document Types Supported with Verification Logic
| Document Type | Valid Period | Verification Source | Auto-Update Trigger |
| --- | --- | --- | --- |
| Income Certificate | 6 months | State Revenue Dept API / DigiLocker | Expiry alert 30 days prior |
| Marksheet / Result | Permanent | CBSE / State Board API | New academic year detected |
| Caste Certificate | Lifetime | State Social Welfare Dept | Once verified, never re-asked |
| Aadhaar Identity | Permanent | UIDAI eKYC API | Address update triggers refresh |
| Domicile Certificate | Lifetime | State Revenue Dept | Once verified on-chain |
| Bank Account (PFMS) | Active status | PFMS / Bank API | Account closure detected |
| Disability Certificate (if applicable) | As per cert | SADM / District Medical | Expiry flagged auto |
| College Enrollment | Per semester | AICTE / UGC / University API | Semester registration |

### 2.3 The AlgoDocVault Architecture (Technical)
Each document is processed through a 5-step pipeline before it reaches the blockchain:

| Step | Action | Details | Technology |
| --- | --- | --- | --- |
| 1 | **Document Upload** | Student uploads PDF/image via React portal or fetches from DigiLocker | React + DigiLocker API |
| 2 | **Hash Generation** | SHA-256 hash computed client-side (document never sent to our servers raw) | Web Crypto API (Browser) |
| 3 | **IPFS Storage** | Encrypted document stored on IPFS; only hash + CID recorded on-chain | Web3.Storage / NFT.Storage |
| 4 | **Algorand Anchoring** | Hash + metadata written to Algorand Box Storage under student's App ID | PyTeal Box Storage ABI |
| 5 | **Oracle Verification**| Background job cross-checks hash against government API (DigiLocker, CBSE) | Python Oracle + Algorand Note |

### 2.4 PyTeal Smart Contract: DocVault Extension
The existing `scholarship_contract.py` is extended with a new DocVault ABI:

#### 📝 New Smart Contract Methods Added
- `store_document(student_addr, doc_type, sha256_hash, ipfs_cid, issued_date, expiry_date)` → Stores document hash in Box Storage with metadata.
- `verify_document(student_addr, doc_type, sha256_hash)` → Returns True/False verification status and timestamp.
- `update_document(student_addr, doc_type, new_hash, new_cid)` → Archives old hash, writes new version (old record preserved for audit).
- `get_document_status(student_addr, doc_type)` → Returns: VERIFIED \| PENDING \| EXPIRED \| MISSING.

### 2.5 Document Versioning — The Key Innovation
Unlike traditional systems that overwrite old documents, AlgoDocVault uses immutable versioned chains. When a student's income changes:
1. Old income certificate hash is tagged as **ARCHIVED** (never deleted)
2. New certificate is uploaded and hashed
3. New hash is written to Algorand Box Storage with version number v2, v3, etc.
4. AI engine automatically re-evaluates eligibility with new document
5. If new income is higher → scholarship amount is adjusted downward transparently
6. If new income is lower → student automatically gets higher priority in next disbursement cycle

🔒 **Tamper-Proof Audit Trail**
Because Algorand is immutable, every version of every document is permanently recorded. This protects BOTH students (no one can claim they submitted wrong documents) AND scholarship committees (no student can backdate or fake documents after the fact).

---

## 3. New Module: Zero Office Visit System™
The most transformative feature of ScholarAgent v2 is the complete elimination of physical office visits through a network of government API integrations and intelligent document orchestration.

### 3.1 The DigiLocker Deep Integration
India's DigiLocker system already holds verified copies of most government documents. ScholarAgent directly fetches documents **FROM** DigiLocker on the student's behalf — eliminating the need to physically collect any document.

| Documents Available via DigiLocker | Issuing Authority | ScholarAgent Action |
| --- | --- | --- |
| Class 10 & 12 Marksheets | CBSE / State Boards | Auto-fetch on profile creation |
| Aadhaar Card | UIDAI | eKYC verification (no physical card needed) |
| Driving License / Voter ID | RTO / Election Commission | Identity cross-check |
| Degree Certificates | Universities via NAD | Enrollment verification |
| Insurance Policies (for income proof) | IRDAI | Asset assessment for eligibility |
| PAN Card | Income Tax Dept | Family income cross-check |

### 3.2 Income Certificate: Eliminating the Biggest Pain Point
The income certificate is cited as the #1 reason students give up on scholarship applications. The current process requires visiting a taluka/tehsil office, waiting in queues, and getting signatures from officials who are often absent or demand bribes.

🔴 **Current Process (What We're Replacing)**
Student → Taluka Office → Fill Form → Wait 7–30 days → Collect Certificate → Get Attested → Upload to Portal → Rejected (Wrong Format) → Repeat Every 6 Months

✅ **ScholarAgent v2 Process**
Student grants one-time consent → ScholarAgent fetches income data from IT Returns / State Revenue API → AI cross-validates with Aadhaar family data → Income Certificate NFT minted on Algorand → Auto-submitted to all portals. Zero visits. Auto-renews every 6 months.

### 3.3 Government API Integrations Added
| API / System | Data Retrieved | Removes This Visit | Status |
| --- | --- | --- | --- |
| UIDAI Aadhaar eKYC | Name, DOB, Address, Family linkage | Aadhaar attestation office | Live API |
| DigiLocker Gateway | All issued govt documents | Document collection from offices | Live API |
| CBSE / State Board API | Marks, roll number, year | School/college certificate fetching | Live API |
| PFMS Bank Validation | Bank account active status | Bank branch visit for verification | Live API |
| Income Tax Returns (ITR)| Family annual income | SDO office for income certificate | Via Consent API |
| AICTE / UGC College DB | College recognition status | Principal signature/college visit | Live API |
| State Caste Certificate DB| Category (SC/ST/OBC/EWS) | Social welfare office visit | State-dependent |
| MahaDBT / NSP Portal | Application status, scheme list | Portal application (Playwright agent) | Automated |

### 3.4 The Smart Notification Engine (No More Chasing Status)
One of the biggest frustrations for students is not knowing what's happening with their application. ScholarAgent replaces uncertainty with a proactive notification system:

- 📱 **WhatsApp + SMS Alerts:** Application submitted, document verified, amount disbursed — all instant notifications in the student's local language (Hindi, Marathi, Tamil, etc.)
- 📧 **Email Summary:** Weekly digest of all active applications, pending documents, and upcoming deadlines
- 🔔 **Document Expiry Warnings:** 30-day, 7-day, and 1-day alerts before income certificate or any document expires
- 🟢 **Real-Time Status Dashboard:** Green/Yellow/Red status for each scholarship scheme — students always know exactly where they stand
- 🤝 **AI Grievance Bot:** If an application is rejected, the AI explains WHY in plain language and tells the student exactly what to fix — no RTI filing needed

---

## 4. New Module: Scheme Auto-Matcher — Fill Once, Apply Everywhere
ScholarAgent v2 doesn't wait for students to discover schemes — it proactively identifies every scheme the student is eligible for and autonomously applies to all of them simultaneously.

### 4.1 The Scheme Intelligence Engine
A curated, regularly-updated database of 200+ scholarship schemes across Central and State governments is embedded in ScholarAgent. On profile creation, the AI cross-matches the student's profile against every scheme:

| Scheme Category | Examples | Auto-Application Coverage |
| --- | --- | --- |
| Central Government | NSP, PM Scholarship, AICTE Pragati | Full Playwright automation |
| State Government | MahaDBT, HP Scholarship, UP Scholarship | Full Playwright automation |
| Category-Based | SC/ST Post-Matric, OBC Pre-Matric, EWS | AI eligibility cross-check |
| Minority Schemes | Maulana Azad, Begum Hazrat Mahal | Playwright + DigiLocker docs |
| Disability Schemes | NIMHD, Divyangjan Scholarship | SADM API integration |
| Merit-Based | NTSE, INSPIRE, Kishore Vaigyanik | Academic score API check |
| Private / CSR Funded | Tata, Reliance, Infosys Foundation | Web scraping + form fill |

### 4.2 Updated Eligibility Scoring with Document Verification Weight
The AI engine's scoring formula has been enhanced in v2 to incorporate document verification status as a factor:

| Metric | Weight | Requirement | Verification Source |
| --- | --- | --- | --- |
| Academic Marks | 35% | ≥ 70% | CBSE / Board API (was 40%) |
| Family Income | 30% | ≤ ₹2,50,000 | ITR / State Revenue API (was 35%) |
| Attendance | 10% | ≥ 75% | College ERP / Manual (was 15%) |
| Category | 10% | SC/ST/OBC/EWS | Caste Certificate DB |
| Document Completeness ✨ NEW | 10% | All docs verified on-chain | AlgoDocVault Status |
| Geo-Disadvantage Score ✨ NEW| 5% | Rural / tribal area bonus | Aadhaar address + Census DB |

✨ **NEW:** Document Completeness and Geo-Disadvantage are new scoring factors added in v2. Students with all documents verified on-chain get priority disbursement. Rural and tribal area students receive an additional 5% boost recognizing the greater barrier they face.

---

## 5. Updated Project Architecture (v2)
ScholarAgent v2 adds three new modules to the original four-module architecture:

### 5.1 Module 5: AlgoDocVault (New)
**Location:** `/algorand/docvault/`
- `docvault_contract.py`: PyTeal ABI contract for Box Storage document hashing
- `document_oracle.py`: Python service that cross-checks uploaded document hashes against DigiLocker, CBSE, and state APIs
- `ipfs_gateway.py`: Encrypts and uploads document files to IPFS; returns CID for on-chain storage
- `version_manager.py`: Manages document versioning — archives old hashes, creates new version entries
- `expiry_scheduler.py`: Cron job that checks document expiry dates and triggers student notifications 30/7/1 days ahead

### 5.2 Module 6: Government API Gateway (New)
**Location:** `/backend/integrations/`
- `digilocker_client.js`: OAuth2 integration with DigiLocker to fetch documents on student consent
- `aadhaar_kyc.js`: UIDAI sandbox/production API for eKYC verification and family linking
- `cbse_fetcher.py`: Queries CBSE marksheet API using roll number + year
- `pfms_validator.js`: Validates bank account via PFMS (Public Financial Management System)
- `itr_income.py`: Fetches ITR-submitted income data (with student/parent PAN consent)
- `scheme_database.json`: 200+ scholarship schemes with eligibility criteria (auto-updated monthly via scraper)

### 5.3 Module 7: Smart Notification Engine (New)
**Location:** `/backend/notifications/`
- `whatsapp_bot.js`: WhatsApp Business API integration for multilingual status updates
- `sms_gateway.js`: SMS fallback via MSG91 / Twilio for students without smartphones
- `email_digest.js`: Weekly summary emails with application pipeline status
- `grievance_ai.py`: Flask endpoint that takes a rejection reason and explains it in plain language
- `dashboard_realtime.js`: WebSocket-based real-time status updates on the React dashboard

### 5.4 Updated Smart Contract: `scholarship_contract_v2.py`
The Algorand PyTeal contract is extended with:
- **Box Storage** for per-student document hashes (replaces Local State for documents — more capacity)
- `document_verified` flag required before disbursement (new gate in approval logic)
- `scheme_count` tracking: records how many schemes a student has been applied to and approved for
- `auto_renewal` ABI method: triggered by oracle when income cert expires — pauses disbursement until renewed
- `audit_log` ABI method: writes every status change as a Note to the transaction — full on-chain audit trail

---

## 6. Updated Autonomous Flow (v2 — End to End)

| Step | Actor | Action | Technology |
| --- | --- | --- | --- |
| 1 | Student | Opens ScholarAgent portal; enters mobile number, Aadhaar, and college details ONCE | React.js + Firebase Auth |
| 2 | System | Triggers DigiLocker OAuth — student grants one-time consent to fetch their documents | DigiLocker API + OAuth2 |
| 3 | DocVault | All fetched documents are hashed (SHA-256) and anchored on Algorand Box Storage | PyTeal + AlgoDocVault |
| 4 | Oracle | Background oracle cross-verifies hashes with CBSE, UIDAI, State Revenue APIs | Python Oracle Service |
| 5 | AI Engine | Runs weighted eligibility scoring (v2 formula) and matches to all eligible schemes | Flask + Python ML |
| 6 | Agent | Playwright agent applies to all matched schemes simultaneously across all portals | Playwright + Captcha AI |
| 7 | Smart Contract | Verifies: `doc_verified = TRUE` AND `score ≥ threshold` AND `monthly cap not exceeded` | Algorand PyTeal ABI |
| 8 | Treasury | Atomic transaction sends SCHOLAR tokens to student's Pera Wallet | `algosdk` + ASA |
| 9 | NFT Mint | SoulBound ARC-69 NFT minted with scheme name, amount, and verified document hash | ARC-69 + Algorand |
| 10 | Notification | WhatsApp/SMS sent: 'Scholarship disbursed! ₹8,000 credited to your Pera Wallet' | WhatsApp Business API |
| 11 | Auto-Renewal | System monitors document expiry. 30 days before expiry → sends renewal link via WhatsApp | Expiry Scheduler Cron |
| 12 | Re-evaluation | On document update, AI automatically re-scores and updates on-chain eligibility record | Flask + PyTeal ABI |

🎯 **The Result**
From the student's perspective: fill your details once on your phone. Get a WhatsApp message when money lands in your wallet. That's it. No offices. No queues. No bribes. No lost documents. No expired certificates. No missed deadlines.

---

## 7. Future Roadmap & Advanced Enhancements

### 7.1 Phase 2: Guardian Delegation System
For minor students (under 18) or students without smartphones, a Parent/Guardian Delegation System allows a guardian to manage the student's ScholarAgent profile with a separate, limited-scope Algorand wallet key. The guardian can upload and update documents but cannot access the student's scholarship wallet directly — funds always go directly to the student's Pera Wallet.

### 7.2 Phase 2: Zero-Knowledge Proof (ZKP) Document Verification
Future integration with zk-SNARKs (using Algorand's AVM capabilities) will allow ScholarAgent to prove to scholarship portals that a student meets income requirements WITHOUT revealing the actual income figure. This is critical for student privacy — portals verify eligibility without accessing sensitive financial data.

### 7.3 Phase 3: Scholarship Marketplace on Algorand
Private companies, CSR foundations, and trusts can deploy their own scholarship pools directly onto the Algorand blockchain using ScholarAgent's ABI. A student already in the ScholarAgent ecosystem is automatically considered for private scholarships the moment they match criteria — creating a true marketplace where money finds the student, not the other way around.

### 7.4 Phase 3: Grievance Resolution DAO
Rejected applications that the student disagrees with can be escalated to a Decentralized Autonomous Organization (DAO) of verified teachers, NGO workers, and government officials who vote on-chain using Algorand governance tokens. This provides a transparent, tamper-proof appeal system without requiring physical hearings or RTI applications.

### 7.5 Phase 4: Cross-State Document Portability
Students who migrate for higher education (e.g., from UP to Maharashtra) currently have to re-verify ALL their documents in the new state. With AlgoDocVault, their documents are verified on the Algorand blockchain — universally recognized across all state portals that integrate with ScholarAgent. True document portability across India.

### 7.6 SCHOOL Tier: Extending to Class 9–12 Students
A lighter ScholarAgent SCHOOL tier can serve pre-matric scholarship programs. School counselors can manage a classroom's worth of applications through a single dashboard — one login for a teacher to monitor 40 students' scholarship statuses, with parents receiving WhatsApp updates automatically.

| Phase | Timeline | Key Deliverable |
| --- | --- | --- |
| MVP (Now) | Hackathon Submission | AI scoring + Playwright agent + basic Algorand disbursement |
| Phase 1 | Month 1–3 | AlgoDocVault + DigiLocker integration + on-chain document hashing |
| Phase 2 | Month 3–6 | ZKP proof system + Guardian delegation + 50-scheme database |
| Phase 3 | Month 6–12 | Scholarship Marketplace + Grievance DAO + Cross-state portability |
| Phase 4 | Year 2 | SCHOOL tier + full national rollout + 200+ scheme coverage |

---

## 8. Impact & Why ScholarAgent Wins

### 8.1 The Numbers That Matter
| Problem Solved | Current State | ScholarAgent v2 State |
| --- | --- | --- |
| Office visits per scholarship application | 5–12 visits | 0 visits |
| Time to submit one application | 3–8 weeks | < 10 minutes |
| Documents re-submitted each year | All (8–12 docs) | 0 (auto-renewed on-chain) |
| Schemes applied to per student | 1–2 (awareness limited) | All eligible schemes (AI-matched) |
| Disbursement time after approval | 3–18 months | < 24 hours (Algorand atomic tx) |
| Fraud / fake documents possible | Yes (manual verification) | No (on-chain SHA-256 + oracle) |
| Money lost to middlemen | ₹500–₹2,000 per student | ₹0 (fully autonomous) |
| Transparency for students | None (black box) | Full on-chain audit trail, NFT proof |

### 8.2 Why Algorand Is the Perfect Blockchain for This
- ⚡ **4-second finality:** Scholarship disbursements are instant — students don't wait hours for blockchain confirmation
- 💰 **Micro-transaction fees (~0.001 ALGO):** Suitable for ₹500–₹10,000 scholarship amounts where Ethereum gas fees would be prohibitive
- 📦 **Box Storage ABI:** Perfect for storing per-student document hashes (up to 32KB per box) — cost-effective and native
- 🔐 **ARC-69 SoulBound NFTs:** Non-transferable scholarship proof certificates that cannot be sold or transferred
- 🌏 **Carbon-neutral:** Algorand's Pure Proof-of-Stake is the only responsible choice for a government-adjacent social impact project
- 🏛️ **SEBI / RBI alignment:** Algorand's regulatory track record in India makes government adoption conversations easier

### 🏆 Hackathon Track Alignment
**PS3 — A2A Autonomous Payments:** ScholarAgent demonstrates the most complete A2A payment system in this track. An AI agent (not a human) evaluates eligibility, an autonomous Playwright agent submits applications to external portals, and a PyTeal smart contract autonomously governs fund disbursement. Every single payment decision is AI-driven and on-chain — true Agentic Commerce.

***

<div align="center">

**ScholarAgent v2** — *Because Every Deserving Student Deserves a Fair Shot*  
*Built on Algorand · Powered by AI · Governed by Code · Verified on Chain*

</div>
