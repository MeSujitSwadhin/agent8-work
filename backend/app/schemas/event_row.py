from pydantic import BaseModel

class EventRow(BaseModel):
    slno: int
    topic: str
    imageGenerated: bool
    selectDate: str
    time: str
