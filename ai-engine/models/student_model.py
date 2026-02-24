# ============================================================
#  ScholarAgent — Student Application Model
#  File: ai-engine/models/student_model.py
# ============================================================

from dataclasses import dataclass, asdict
from typing import Optional


@dataclass
class StudentApplication:
    """Student scholarship application data model"""
    name: str
    wallet_address: str
    family_income: float         # Annual income in INR
    marks_percentage: float      # Academic marks (0-100)
    attendance_percentage: float  # Attendance (0-100)
    category: str                # SC / ST / OBC / General-EWS / General
    institution: str = ""
    course: str = ""
    documents_ipfs_hash: str = ""
    application_id: Optional[str] = None

    def to_dict(self):
        return asdict(self)

    def validate(self):
        """Validate application fields"""
        errors = []
        if not self.name or len(self.name) < 2:
            errors.append("Name is required (min 2 chars)")
        if not self.wallet_address or len(self.wallet_address) != 58:
            errors.append("Valid Algorand wallet address required (58 chars)")
        if self.family_income < 0:
            errors.append("Family income must be non-negative")
        if not (0 <= self.marks_percentage <= 100):
            errors.append("Marks percentage must be 0-100")
        if not (0 <= self.attendance_percentage <= 100):
            errors.append("Attendance percentage must be 0-100")
        valid_categories = ["SC", "ST", "OBC", "General-EWS", "General"]
        if self.category not in valid_categories:
            errors.append(f"Category must be one of: {valid_categories}")
        return errors

    @staticmethod
    def from_dict(data):
        """Create from dict (API request body)"""
        return StudentApplication(
            name=data.get("name", ""),
            wallet_address=data.get("wallet_address", ""),
            family_income=float(data.get("family_income", 0)),
            marks_percentage=float(data.get("marks_percentage", 0)),
            attendance_percentage=float(data.get("attendance_percentage", 0)),
            category=data.get("category", "General"),
            institution=data.get("institution", ""),
            course=data.get("course", ""),
            documents_ipfs_hash=data.get("documents_ipfs_hash", ""),
            application_id=data.get("application_id"),
        )
