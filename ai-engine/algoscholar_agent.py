# ============================================================
#  ScholarAgent — AI Agent with Playwright + Scoring Engine
#  File: ai-engine/algoscholar_agent.py
#  Purpose: Browser automation for MahaDBT portal + scoring
#  ← CONNECTS TO: backend/routes/agent.js (scoring formula)
#  ← CONNECTS TO: frontend/src/pages/Apply.jsx (recalculate)
# ============================================================

import json
import os
import time
import socket
from dataclasses import dataclass

try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("⚠️ Playwright not installed. Portal automation disabled.")


@dataclass
class StudentProfile:
    """All fields from the frontend form — REAL values, never hardcoded"""
    student_id:      str
    name:            str      # ← USER INPUT: formData.fullName
    dob:             str      # ← USER INPUT: formData.dateOfBirth (YYYY-MM-DD)
    aadhaar:         str      # ← USER INPUT: formData.aadhaarNumber
    mobile:          str      # ← USER INPUT: formData.mobileNumber
    email:           str      # ← USER INPUT: formData.email
    gender:          str      # ← USER INPUT: formData.gender
    address:         str      # ← USER INPUT: formData.permanentAddress
    institution:     str      # ← USER INPUT: formData.institution
    course:          str      # ← USER INPUT: formData.course
    year:            int      # ← USER INPUT: formData.yearOfStudy
    marks:           float    # ← USER INPUT: formData.previousMarks — REAL value
    attendance:      float    # ← USER INPUT: formData.attendancePercent — REAL value
    roll_no:         str      # ← USER INPUT: formData.rollNumber
    father_name:     str      # ← USER INPUT: formData.fatherName
    mother_name:     str      # ← USER INPUT: formData.motherName
    annual_income:   int      # ← USER INPUT: formData.annualIncome — REAL value
    category:        str      # ← USER INPUT: formData.category — REAL value
    bank_account:    str      # ← USER INPUT: formData.bankAccount
    ifsc_code:       str      # ← USER INPUT: formData.ifscCode
    algo_wallet:     str      # ← USER INPUT: formData.algoWallet
    auto_apply:      bool = True


class AlgoScholarAgent:
    """AI agent that evaluates and auto-applies scholarships"""

    def __init__(self):
        # 1. Get base URL from env
        self.portal_url = os.getenv(
            'PORTAL_URL',
            'http://127.0.0.1:5500/mock-mahadbt-portal.html'
        )
        
        # 2. Resiliency: Check if the server is actually UP
        if "127.0.0.1:5500" in self.portal_url or "localhost:5500" in self.portal_url:
            if not self._is_server_up("127.0.0.1", 5500):
                # Fallback to file:// protocol if server is offline
                root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                portal_path = os.path.join(root_dir, 'mock-mahadbt-portal.html')
                if os.path.exists(portal_path):
                    self.portal_url = f"file:///{portal_path.replace(os.sep, '/')}"
                    print(f"⚠️ Portal server offline. Falling back to local file: {self.portal_url}")

    def _is_server_up(self, host, port):
        """Check if a port is open on the host"""
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except (socket.timeout, ConnectionRefusedError):
            return False

    # ══════════════════════════════════════════════════════════
    #  SCORING ENGINE — identical to Node.js + frontend
    # ══════════════════════════════════════════════════════════

    def calculate_score(self, student: StudentProfile) -> dict:
        """
        Calculate eligibility score from student's REAL input values.
        This formula MUST match backend/routes/agent.js calculateScore()
        and frontend/src/pages/Apply.jsx recalculate() EXACTLY.
        """
        marks      = float(student.marks)           # ← REAL user input
        income     = int(student.annual_income)      # ← REAL user input
        attendance = float(student.attendance)        # ← REAL user input
        category   = student.category                # ← REAL user input
        eligible_cats = ['EBC', 'OBC', 'SC', 'ST', 'VJNT', 'SBC']

        academic   = (marks / 100) * 0.40
        income_s   = max(0, (250000 - income) / 250000) * 0.35
        attend_s   = (attendance / 100) * 0.15
        cat_s      = 0.10 if category in eligible_cats else 0.05
        total      = academic + income_s + attend_s + cat_s
        total_pct  = round(total * 100, 1)

        # Hard eligibility rules
        hard_fails = []
        if marks < 70:
            hard_fails.append(f"marks {marks}% < 70% minimum")
        if income > 250000:
            hard_fails.append(f"income ₹{income} > ₹2,50,000 limit")
        if attendance < 75:
            hard_fails.append(f"attendance {attendance}% < 75% minimum")

        eligible = len(hard_fails) == 0 and total_pct >= 55

        amount = 0
        tier   = ''
        if eligible:
            if total_pct >= 85:
                amount, tier = 10000, 'Tier 1'
            elif total_pct >= 70:
                amount, tier = 7500, 'Tier 2'
            elif total_pct >= 55:
                amount, tier = 5000, 'Tier 3'

        return {
            'status':     'approved' if eligible else 'rejected',
            'score':      total_pct,
            'amount':     amount,
            'tier':       tier,
            'breakdown': {
                'academic':   round(academic * 100, 1),
                'income':     round(income_s * 100, 1),
                'attendance': round(attend_s * 100, 1),
                'category':   round(cat_s   * 100, 1),
            },
            'hard_fails': hard_fails,
            'eligible':   eligible,
        }

    # ══════════════════════════════════════════════════════════
    #  BUILD PAYLOAD — maps student fields to portal form IDs
    # ══════════════════════════════════════════════════════════

    def _build_payload(self, student: StudentProfile) -> dict:
        """
        Maps student's REAL data to the mock MahaDBT portal field IDs.
        Every value comes from formData, never hardcoded.
        """
        return {
            "name":        student.name,
            "dob":         student.dob,
            "aadhaar":     student.aadhaar,
            "mobile":      student.mobile,
            "email":       student.email,
            "address":     student.address,
            "gender":      student.gender,
            "institution": student.institution,
            "course":      student.course,
            "year":        str(student.year),
            "marks":       str(student.marks),       # student's actual marks
            "attendance":  str(student.attendance),   # student's actual attendance
            "rollNo":      student.roll_no,
            "fatherName":  student.father_name,
            "motherName":  student.mother_name,
            "income":      str(student.annual_income), # student's actual income
            "category":    student.category,
            "bankAccount": student.bank_account,
            "ifsc":        student.ifsc_code,
            "algoWallet":  student.algo_wallet,
        }

    # ══════════════════════════════════════════════════════════
    #  PLAYWRIGHT PORTAL AUTOMATION (headless=False)
    # ══════════════════════════════════════════════════════════

    async def apply_to_portal(self, student: StudentProfile) -> dict:
        """
        Opens a real browser window, navigates to the MahaDBT mock portal,
        fills form with student's REAL data, solves captcha, and submits.
        headless=False so judges can see the browser working.
        """
        if not PLAYWRIGHT_AVAILABLE:
            return {"success": False, "error": "Playwright not installed"}

        async with async_playwright() as p:
            # headless=False — judges MUST see the browser working
            browser = await p.chromium.launch(headless=False, slow_mo=400)
            context = await browser.new_context(
                viewport={"width": 1280, "height": 800}
            )
            page = await context.new_page()

            try:
                # STEP 1 — Navigate to mock portal
                print("🌐 Opening MahaDBT portal...")
                await page.goto(self.portal_url)
                await page.wait_for_load_state("networkidle")

                # STEP 2 — Click Apply Online
                print("📋 Navigating to Apply Online...")
                await page.click("text=Apply Online")
                await page.wait_for_selector('#f-name', timeout=5000)

                # STEP 3 — Auto-fill form with student's REAL data
                print("🤖 Auto-filling form with student data...")
                payload = self._build_payload(student)
                await page.evaluate(
                    f"window.autoFillForm({json.dumps(payload)})"
                )
                print(f"  ✓ Name: {student.name}")
                print(f"  ✓ Marks: {student.marks}%")
                print(f"  ✓ Income: ₹{student.annual_income:,}")
                print(f"  ✓ Attendance: {student.attendance}%")
                print(f"  ✓ Category: {student.category}")
                wallet_display = student.algo_wallet[:20] if student.algo_wallet else 'N/A'
                print(f"  ✓ Wallet: {wallet_display}...")

                # STEP 4 — Wait for document uploads (3 seconds)
                print("📄 Waiting for document uploads...")
                await page.wait_for_timeout(3000)

                # STEP 5 — Read captcha from DOM and solve it
                captcha_text = await page.text_content('#captcha-display')
                captcha_text = captcha_text.strip()
                print(f"🔐 Solving captcha: {captcha_text}")
                await page.fill('#f-captcha', captcha_text)

                # STEP 6 — Check declaration checkbox
                await page.check('#f-declaration')
                print("✅ Declaration accepted")

                # STEP 7 — Click Submit Application
                print("🚀 Submitting application...")
                await page.click("text=Submit Application")

                # STEP 8 — Wait for confirmation box
                await page.wait_for_selector(
                    '#confirmation-box.show', timeout=15000
                )
                print("✅ Confirmation screen appeared")

                # STEP 9 — Extract reference number
                ref_number = await page.text_content('#ref-number')
                ref_number = ref_number.strip()
                print(f"🎉 Reference number: {ref_number}")

                # STEP 10 — Screenshot as proof
                os.makedirs('screenshots', exist_ok=True)
                screenshot_path = f'screenshots/application_{ref_number}.png'
                await page.screenshot(path=screenshot_path, full_page=True)
                print(f"📸 Screenshot saved: {screenshot_path}")

                await browser.close()
                return {
                    "success":          True,
                    "reference_number": ref_number,
                    "screenshot":       screenshot_path,
                }

            except Exception as e:
                await page.screenshot(path='screenshots/error.png')
                await browser.close()
                print(f"❌ Portal submission failed: {e}")
                return {"success": False, "error": str(e)}

    # ══════════════════════════════════════════════════════════
    #  FULL AGENT ORCHESTRATION
    # ══════════════════════════════════════════════════════════

    async def run(self, student: StudentProfile) -> dict:
        """Full agent pipeline: evaluate → apply → monitor → disburse"""
        print("=" * 50)
        print(f"  AlgoScholar Agent — Processing {student.name}")
        print("=" * 50)

        # Step 1: Calculate score from REAL values
        score_result = self.calculate_score(student)
        print(f"\n📊 Score: {score_result['score']}%")
        print(f"   Status: {score_result['status']}")
        print(f"   Amount: ₹{score_result['amount']:,}")

        if not score_result['eligible']:
            print(f"❌ Not eligible: {score_result['hard_fails']}")
            return score_result

        # Step 2: Auto-apply to portal
        if student.auto_apply:
            portal_result = await self.apply_to_portal(student)
            score_result['portal'] = portal_result

        return score_result


# ── CLI entry point for testing ──────────────────────────────
if __name__ == "__main__":
    import asyncio

    # Example test student
    test_student = StudentProfile(
        student_id="TEST-001",
        name="Test Student",
        dob="2004-05-15",
        aadhaar="1234 5678 9012",
        mobile="+91 9876543210",
        email="test@example.com",
        gender="Male",
        address="123 Test Street, Mumbai",
        institution="IIT Mumbai",
        course="B.Tech / B.E.",
        year=2,
        marks=85.0,
        attendance=92.0,
        roll_no="2024CSE001",
        father_name="Test Father",
        mother_name="Test Mother",
        annual_income=150000,
        category="OBC",
        bank_account="1234567890",
        ifsc_code="SBIN0001234",
        algo_wallet="ALGO_TEST_WALLET",
        auto_apply=False,
    )

    agent = AlgoScholarAgent()
    result = agent.calculate_score(test_student)
    print(json.dumps(result, indent=2))
