import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class BlogContent(BaseModel):
    title: str
    content: str
    keywords: Optional[str] = None


class LinkedInContent(BaseModel):
    title: str
    content: str
    hashtags: Optional[str] = None


class WhatsAppContent(BaseModel):
    message: str


class PostModel(BaseModel):
    postId: str = str(uuid.uuid4())
    topic: str
    status: str
    blog: BlogContent
    linkedin: LinkedInContent
    whatsapp: WhatsAppContent
    createdAt: str = datetime.utcnow().isoformat()
    updatedAt: str = datetime.utcnow().isoformat()