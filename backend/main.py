from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
import os
import shutil
import uuid
from datetime import datetime
from dotenv import load_dotenv
import os
from pymongo import MongoClient

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client["labfinity"]
uploads_collection = db["uploads"]

app = FastAPI()

# ---------------- CORS ----------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- File Upload Folder ----------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ---------------- Routes ----------------

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI Backend!"}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_graph(
    file: UploadFile = File(...),
    studentId: str = Form(...),
    experimentId: str = Form(...)
):
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
    record = uploads_collection.find_one({
        "studentId": studentId,
        "experimentId": experimentId
    })

    if not record:
        return {"message": "No upload found"}

    return {
        "fileUrl": f"http://localhost:8000{record['filePath']}"
    }
