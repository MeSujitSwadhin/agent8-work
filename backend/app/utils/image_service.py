# image_service.py
import os
import uuid
import base64
from fastapi import HTTPException
from app.utils.google_drive import upload_file_to_drive
from app.core.model_registry import ModelRegistry

class ImageService:

    def __init__(self, registry: ModelRegistry):
        self.registry = registry

    def generate_images(self, topic: str, count: int) -> list:
        if not topic.strip():
            raise HTTPException(status_code=400, detail="Topic is required")

        client = self.registry.openai()

        # Local storage
        folder = "public/generated_images"
        os.makedirs(folder, exist_ok=True)

        base_url = "/public/generated_images"
        safe_topic = "".join(c if c.isalnum() else "_" for c in topic)

        result = []

        for i in range(count):
            try:
                img = client.images.generate(
                    model="dall-e-3",
                    prompt=f"Create modern social banner for: {topic}",
                    size="1024x1024",
                    response_format="b64_json",
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"DALL·E error: {e}")

            raw = base64.b64decode(img.data[0].b64_json)

            filename = f"{safe_topic}_{uuid.uuid4().hex}_{i+1}.png"
            local_path = os.path.join(folder, filename)

            with open(local_path, "wb") as f:
                f.write(raw)

            try:
                file_id, gd_url = upload_file_to_drive(local_path, filename)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Drive upload error: {e}")

            result.append({
                "publicImageUrl": f"{base_url}/{filename}",
                "googleDriveImageUrl": gd_url,
                "googleDriveFileId": file_id
            })

        return result