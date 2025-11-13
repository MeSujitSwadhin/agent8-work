# model_registry.py
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from openai import OpenAI

load_dotenv()

class ModelRegistry:

    def __init__(self):
        self._groq_cache = {}
        self._openai_client = None

        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")

        if not self.groq_api_key:
            raise RuntimeError("Missing GROQ_API_KEY")
        if not self.openai_key:
            raise RuntimeError("Missing OPENAI_API_KEY")

    # -----------------------------------------------------------
    # GROQ MODEL
    # -----------------------------------------------------------
    def groq(self, model_name: str):
        """Return cached Groq model instance."""
        if model_name not in self._groq_cache:
            self._groq_cache[model_name] = ChatGroq(
                model=model_name,
                api_key=self.groq_api_key,
                temperature=0.7
            )
        return self._groq_cache[model_name]

    # -----------------------------------------------------------
    # OPENAI CLIENT
    # -----------------------------------------------------------
    def openai(self):
        """Return single OpenAI client instance."""
        if not self._openai_client:
            self._openai_client = OpenAI(api_key=self.openai_key)
        return self._openai_client
