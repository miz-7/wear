import os
import shutil

from fastapi import APIRouter, Depends, File, UploadFile

from app.models import UserModel
from app.routers.auth import get_current_user

UPLOAD_DIR = "uploads"

router = APIRouter(tags=["uploads"])


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/uploads/{file.filename}"}
