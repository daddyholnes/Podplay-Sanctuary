class MamaBearService:
    """
    Minimal stub for Mama Bear Service.
    Replace with full implementation as needed.
    """
    def __init__(self, db_service=None, marketplace_service=None):
        self.db_service = db_service
        self.marketplace_service = marketplace_service

    def chat(self, message):
        return {"reply": "stub"}
