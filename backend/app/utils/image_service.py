# image_service.py
import uuid
import base64
import tempfile
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
            image_bytes = base64.b64decode(img.data[0].b64_json)
            filename = f"{safe_topic}_{uuid.uuid4().hex}_{i+1}.png"
            try:
                with tempfile.NamedTemporaryFile(delete=False) as tmp:
                    tmp.write(image_bytes)
                    tmp_path = tmp.name
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Temp file error: {e}")
            try:
                file_id, gd_url = upload_file_to_drive(tmp_path, filename)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Drive upload error: {e}")
            result.append({
                "googleDriveImageUrl": gd_url,
                "googleDriveFileId": file_id
            })

        return result