import os
import logging
import requests
from http import HTTPStatus
from fastapi import APIRouter, HTTPException
from app.schemas.auth import AuthRequest, AuthResponse


router = APIRouter()
logger = logging.getLogger("auth_agent")
logging.basicConfig(level=logging.INFO)

API_KEY = os.getenv("FIREBASE_API_KEY")

@router.post("/signup")
def signup(payload: AuthRequest):
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={API_KEY}"
    body = {
        "email": payload.email,
        "password": payload.password,
        "returnSecureToken": True,
    }

    resp = requests.post(url, json=body)
    data = resp.json()

    if "error" in data:
        detail = data["error"]["message"]
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=detail)

    return AuthResponse(
        message="User created successfully",
    )


@router.post("/signin")
def signin(payload: AuthRequest):
    url = (
        f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"
        f"?key={API_KEY}"
    )
    body = {
        "email": payload.email,
        "password": payload.password,
        "returnSecureToken": True,
    }

    resp = requests.post(url, json=body)
    data = resp.json()

    if "error" in data:
        detail = data["error"]["message"]
        raise HTTPException(status_code=400, detail=detail)

    return {
        "message": "Login successful",
        "data": {
            "access_token": data["idToken"],
        }
    }