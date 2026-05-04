import cloudinary
import cloudinary.uploader
from app.core.config import (
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
)

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

def upload_file(file_content):
    result = cloudinary.uploader.upload(
        file_content,
        folder="receipts",
        resource_type="image",
        type="authenticated"
    )

    return {
        "url": result["secure_url"],
        "public_id": result["public_id"]
    }