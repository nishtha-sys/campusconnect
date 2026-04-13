from fastapi import APIRouter, Form, HTTPException
from firebase_config import db
from services.gemini_service import summarize_notes
from datetime import datetime
import uuid

router = APIRouter()


@router.post("/upload")
async def upload_notes(
    title: str = Form(...),
    subject: str = Form(...),
    uploader_name: str = Form(...),
    raw_text: str = Form(...),   # Required — paste notes as text
):
    """Upload notes and get AI summary + tags."""
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Please provide note text.")

    ai_result = summarize_notes(raw_text)

    note_data = {
        "id": str(uuid.uuid4()),
        "title": title,
        "subject": subject,
        "uploader_name": uploader_name,
        "raw_text": raw_text,
        "summary": ai_result["summary"],
        "tags": ai_result["tags"],
        "downloads": 0,
        "created_at": datetime.utcnow().isoformat(),
    }

    db.collection("notes").document(note_data["id"]).set(note_data)

    return {
        "message": "Notes uploaded successfully",
        "note": note_data,
    }


@router.get("/search")
def search_notes(query: str = "", subject: str = ""):
    """Search notes by subject or keyword in title/tags."""
    all_docs = db.collection("notes").stream()
    notes = [doc.to_dict() for doc in all_docs]

    # Simple filter (Firestore full-text search needs Algolia for prod)
    if query:
        query_lower = query.lower()
        notes = [
            n for n in notes
            if query_lower in n["title"].lower()
            or query_lower in n["subject"].lower()
            or any(query_lower in tag.lower() for tag in n.get("tags", []))
        ]

    if subject:
        notes = [n for n in notes if n["subject"].lower() == subject.lower()]

    return {"notes": notes}


@router.get("/all")
def get_all_notes():
    """Return all notes."""
    docs = db.collection("notes").stream()
    return {"notes": [doc.to_dict() for doc in docs]}


@router.patch("/download/{note_id}")
def increment_download(note_id: str):
    """Increment download count for a note."""
    doc_ref = db.collection("notes").document(note_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Note not found")
    current = doc.to_dict().get("downloads", 0)
    doc_ref.update({"downloads": current + 1})
    return {"message": "Download counted"}
