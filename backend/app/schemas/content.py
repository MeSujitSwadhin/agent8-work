from pydantic import BaseModel
from typing import List, Optional


class TopicInput(BaseModel):
    topics: str
    image_generated: Optional[bool] = False

class DraftsOut(BaseModel):
    postId: str
    blog: str
    linkedin: str
    whatsapp: str

class ApproveIn(BaseModel):
    postId: str
    status: str

class ApproveOut(BaseModel):
    postId: str
    message: str

class PublishIn(BaseModel):
    postId: str
    platforms: List[str]

class PublishOut(BaseModel):
    postId: str
    platforms: List[str]
    message: str