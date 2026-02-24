# ============================================================
#  ScholarAgent — AI Engine Flask API Server
#  File: ai-engine/main.py
#  Purpose: Flask API exposing evaluation endpoints
#           Called by Node.js backend via HTTP
# ============================================================

from flask import Flask, request, jsonify
from evaluator.eligibility_engine import EligibilityEngine
from models.student_model import StudentApplication
from rules.policy_rules import POLICY_RULES
import json
import os

app = Flask(__name__)
engine = EligibilityEngine(POLICY_RULES)


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "ScholarAgent AI Engine",
        "version": "1.0.0",
        "rules_loaded": True,
    })


@app.route("/evaluate", methods=["POST"])
def evaluate():
    """
    Evaluate a student scholarship application.

    Request body:
    {
        "name": "Priya Sharma",
        "wallet_address": "ALGO...",
        "family_income": 180000,
        "marks_percentage": 85,
        "attendance_percentage": 90,
        "category": "OBC",
        "institution": "IIT Delhi",
        "course": "B.Tech CSE"
    }

    Returns:
    {
        "approved": true,
        "amount": 7500,
        "score": 0.82,
        "reason": "Approved — score 0.82, tier amount ₹7,500",
        "policy_violations": [],
        "breakdown": { ... }
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body required"}), 400

        result = engine.evaluate(data)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/policy", methods=["GET"])
def get_policy():
    """Return current policy rules"""
    return jsonify(POLICY_RULES)


@app.route("/batch-evaluate", methods=["POST"])
def batch_evaluate():
    """Evaluate multiple applications at once"""
    try:
        data = request.get_json()
        applications = data.get("applications", [])
        if not applications:
            return jsonify({"error": "applications array required"}), 400

        results = []
        for app_data in applications:
            result = engine.evaluate(app_data)
            results.append(result)

        summary = {
            "total": len(results),
            "approved": sum(1 for r in results if r["approved"]),
            "rejected": sum(1 for r in results if not r["approved"]),
            "total_amount": sum(r["amount"] for r in results if r["approved"]),
        }

        return jsonify({"results": results, "summary": summary})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("AI_ENGINE_PORT", 5001))
    print("=" * 50)
    print("  ScholarAgent AI Engine — Flask Server")
    print(f"  Running on http://localhost:{port}")
    print("=" * 50)
    app.run(host="0.0.0.0", port=port, debug=True)
