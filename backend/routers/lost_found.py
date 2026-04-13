from fastapi import APIRouter, Form, HTTPException
from firebase_config import db
from datetime import datetime
import uuid

router = APIRouter()


def get_ai_category(description: str) -> str:
    try:
        from services.gemini_service import tag_lost_item
        return tag_lost_item(description)
    except Exception:
        return "Other"  # fallback if AI fails


def get_ai_matches(description: str, found_items: list) -> list:
    try:
        from services.gemini_service import match_lost_item
        return match_lost_item(description, found_items)
    except Exception:
        return []


@router.post("/report")
async def report_item(
    type: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    contact: str = Form(...),
):
    category = get_ai_category(description)

    item_data = {
        "id": str(uuid.uuid4()),
        "type": type,
        "description": description,
        "location": location,
        "contact": contact,
        "category": category,
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
    }

    db.collection("lost_found").document(item_data["id"]).set(item_data)

    matches = []
    if type == "lost":
        found_docs = db.collection("lost_found").where("type", "==", "found").where("status", "==", "open").stream()
        found_items = [doc.to_dict() for doc in found_docs]
        matches = get_ai_matches(description, found_items)

    return {
        "message": "Item reported successfully",
        "item": item_data,
        "ai_matches": matches,
    }


@router.get("/items")
def get_items(type: str = None, category: str = None):
    query = db.collection("lost_found")
    if type:
        query = query.where("type", "==", type)
    if category:
        query = query.where("category", "==", category)
    docs = query.stream()
    return {"items": [doc.to_dict() for doc in docs]}


@router.patch("/resolve/{item_id}")
def resolve_item(item_id: str):
    doc_ref = db.collection("lost_found").document(item_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    doc_ref.update({"status": "resolved"})
    return {"message": "Item marked as resolved"}