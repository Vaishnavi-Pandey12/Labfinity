from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import os
import shutil
import uuid

# ---------------- Load Environment ----------------
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise Exception("MONGODB_URI not found in .env file")

client = MongoClient(MONGODB_URI)
db = client["labfinity"]
uploads_collection = db["uploads"]

# ---------------- App ----------------
app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Upload Folder ----------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ---------------- Routes ----------------

@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_graph(
    file: UploadFile = File(...),
    studentId: str = Form(...),
    experimentId: str = Form(...)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    record = {
        "studentId": studentId,
        "experimentId": experimentId,
        "filePath": f"/uploads/{unique_filename}",
        "uploadedAt": datetime.utcnow()
    }

    uploads_collection.insert_one(record)

    return {
        "message": "Upload successful",
        "fileUrl": f"http://localhost:8000/uploads/{unique_filename}"
    }


@app.get("/api/uploads/{studentId}/{experimentId}")
def get_upload(studentId: str, experimentId: str):
    record = uploads_collection.find_one(
        {
            "studentId": studentId,
            "experimentId": experimentId
        },
        sort=[("uploadedAt", -1)]
    )

    if not record:
        raise HTTPException(status_code=404, detail="No upload found")

    return {
        "fileUrl": f"http://localhost:8000{record['filePath']}"
    }
