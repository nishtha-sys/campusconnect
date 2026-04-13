from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

sys.path.append(os.path.dirname(__file__))

from routers.lost_found import router as lost_found_router
from routers.notes import router as notes_router

app = FastAPI(title="CampusConnect API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lost_found_router, prefix="/api/lost-found", tags=["Lost & Found"])
app.include_router(notes_router, prefix="/api/notes", tags=["Notes"])

@app.get("/")
def root():
    return {"message": "CampusConnect API is running 🚀"}