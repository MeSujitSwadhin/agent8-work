import os
import logging
import uvicorn
from fastapi import FastAPI
from http import HTTPStatus
from dotenv import load_dotenv
from app.api.endpoints import agent
from app.api.endpoints import auth

load_dotenv()
print(os.getenv("OPENAI_API_KEY"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("writer-agent")

app = FastAPI(
    title="Agentic Writer API",
    version="1.0.0",
    description="An AI-powered Writer Agent that generates, reviews, and publishes content across platforms using LangChain and LangGraph.",
)

API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX, tags=["Auth"])
app.include_router(agent.router, prefix=API_PREFIX, tags=["Writer Agent"])

@app.get("/", tags=["Root"])
async def root():
    return {"status": HTTPStatus.OK, "message": "Welcome to Agentic Writer API"}

@app.get("/health", tags=["Root"])
async def health():
    return {"status": HTTPStatus.OK, "message": "Service is healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)