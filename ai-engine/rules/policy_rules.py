# ============================================================
#  ScholarAgent — Policy Rules Configuration
#  File: ai-engine/rules/policy_rules.py
# ============================================================

POLICY_RULES = {
    "income": {
        "max_family_income_inr": 250_000,
        "weight": 0.35
    },
    "academic": {
        "min_marks_percentage": 70,
        "weight": 0.40
    },
    "attendance": {
        "min_attendance_percentage": 75,
        "weight": 0.15
    },
    "category": {
        "eligible_categories": ["SC", "ST", "OBC", "General-EWS"],
        "weight": 0.10
    },
    "budget": {
        "max_per_student_monthly": 10_000,
        "max_monthly_treasury": 50_000
    },
    "tier_amounts": {
        "tier_1": {"min_score": 0.90, "amount": 10_000},  # Top performers
        "tier_2": {"min_score": 0.75, "amount": 7_500},
        "tier_3": {"min_score": 0.60, "amount": 5_000},
        "tier_4": {"min_score": 0.00, "amount": 3_000},   # Base eligibility
    }
}
