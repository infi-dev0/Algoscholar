# ============================================================
#  ScholarAgent — AI Eligibility Evaluation Engine
#  File: ai-engine/evaluator/eligibility_engine.py
#  Purpose: Core AI logic — evaluates student applications
#           and decides scholarship amount
# ============================================================

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from rules.policy_rules import POLICY_RULES
from models.student_model import StudentApplication


class EligibilityEngine:
    """AI Rule Engine for scholarship evaluation"""

    def __init__(self, policy_rules=None):
        self.rules = policy_rules or POLICY_RULES

    def evaluate(self, application):
        """
        Evaluate a student application against policy rules.

        Args:
            application: dict or StudentApplication

        Returns:
            dict: { approved, amount, score, reason, policy_violations, breakdown }
        """
        if isinstance(application, dict):
            app = StudentApplication.from_dict(application)
        else:
            app = application

        # Validate inputs
        validation_errors = app.validate()
        if validation_errors:
            return {
                "approved": False,
                "amount": 0,
                "score": 0.0,
                "reason": "Validation failed: " + "; ".join(validation_errors),
                "policy_violations": validation_errors,
                "breakdown": {},
            }

        violations = []
        breakdown = {}

        # ── Rule 1: Income Check ──
        income_rules = self.rules["income"]
        income_eligible = app.family_income <= income_rules["max_family_income_inr"]
        if not income_eligible:
            violations.append(
                f"Family income ₹{app.family_income:,.0f} exceeds limit ₹{income_rules['max_family_income_inr']:,}"
            )
        # Income score: lower income = higher score
        income_ratio = max(0, 1 - (app.family_income / income_rules["max_family_income_inr"]))
        income_score = income_ratio * income_rules["weight"]
        breakdown["income"] = {
            "eligible": income_eligible,
            "score": round(income_score, 4),
            "weight": income_rules["weight"],
            "value": app.family_income,
        }

        # ── Rule 2: Academic Performance ──
        academic_rules = self.rules["academic"]
        academic_eligible = app.marks_percentage >= academic_rules["min_marks_percentage"]
        if not academic_eligible:
            violations.append(
                f"Marks {app.marks_percentage}% below minimum {academic_rules['min_marks_percentage']}%"
            )
        # Academic score: normalized above threshold
        academic_ratio = min(1, max(0, (app.marks_percentage - 50) / 50))
        academic_score = academic_ratio * academic_rules["weight"]
        breakdown["academic"] = {
            "eligible": academic_eligible,
            "score": round(academic_score, 4),
            "weight": academic_rules["weight"],
            "value": app.marks_percentage,
        }

        # ── Rule 3: Attendance ──
        attendance_rules = self.rules["attendance"]
        attendance_eligible = app.attendance_percentage >= attendance_rules["min_attendance_percentage"]
        if not attendance_eligible:
            violations.append(
                f"Attendance {app.attendance_percentage}% below minimum {attendance_rules['min_attendance_percentage']}%"
            )
        attendance_ratio = min(1, max(0, (app.attendance_percentage - 60) / 40))
        attendance_score = attendance_ratio * attendance_rules["weight"]
        breakdown["attendance"] = {
            "eligible": attendance_eligible,
            "score": round(attendance_score, 4),
            "weight": attendance_rules["weight"],
            "value": app.attendance_percentage,
        }

        # ── Rule 4: Category ──
        category_rules = self.rules["category"]
        category_eligible = app.category in category_rules["eligible_categories"]
        if not category_eligible:
            violations.append(
                f"Category '{app.category}' not in eligible categories"
            )
        category_score = (1.0 if category_eligible else 0.0) * category_rules["weight"]
        # Bonus for reserved categories
        reserved_bonus = 0
        if app.category in ["SC", "ST"]:
            reserved_bonus = 0.05
        elif app.category == "OBC":
            reserved_bonus = 0.03
        category_score += reserved_bonus
        breakdown["category"] = {
            "eligible": category_eligible,
            "score": round(category_score, 4),
            "weight": category_rules["weight"],
            "value": app.category,
        }

        # ── Calculate Total Score ──
        total_score = income_score + academic_score + attendance_score + category_score
        total_score = round(min(1.0, total_score), 4)

        # ── Determine Eligibility ──
        all_eligible = income_eligible and academic_eligible and attendance_eligible and category_eligible
        approved = all_eligible and total_score >= 0.40

        # ── Calculate Amount ──
        amount = 0
        if approved:
            amount = self.calculate_amount(total_score, app.category)

        # ── Build Reason ──
        if approved:
            reason = f"Approved — score {total_score:.2f}, tier amount ₹{amount:,}"
        elif violations:
            reason = "Rejected — " + "; ".join(violations)
        else:
            reason = f"Rejected — score {total_score:.2f} below threshold"

        return {
            "approved": approved,
            "amount": amount,
            "score": total_score,
            "reason": reason,
            "policy_violations": violations,
            "breakdown": breakdown,
            "student": app.to_dict(),
        }

    def calculate_amount(self, score, category):
        """Calculate scholarship amount based on score tier"""
        tiers = self.rules["tier_amounts"]
        budget = self.rules["budget"]

        # Find matching tier
        amount = tiers["tier_4"]["amount"]  # Default base
        for tier_key in ["tier_1", "tier_2", "tier_3", "tier_4"]:
            tier = tiers[tier_key]
            if score >= tier["min_score"]:
                amount = tier["amount"]
                break

        # Cap at per-student limit
        amount = min(amount, budget["max_per_student_monthly"])
        return amount

    def check_budget_availability(self, requested_amount, current_monthly_total=0):
        """Check if treasury budget can accommodate this payment"""
        budget = self.rules["budget"]
        remaining = budget["max_monthly_treasury"] - current_monthly_total
        if requested_amount > remaining:
            return False, f"Budget exceeded: requested ₹{requested_amount:,}, remaining ₹{remaining:,}"
        return True, f"Budget OK: ₹{remaining - requested_amount:,} remaining after payment"
