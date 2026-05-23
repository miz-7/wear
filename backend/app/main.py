import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import shops, uploads

UPLOAD_DIR = "uploads"


def create_app():
    app = FastAPI()

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    Base.metadata.create_all(bind=engine)

    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(shops.router)
    app.include_router(uploads.router)

    return app


app = create_app()
