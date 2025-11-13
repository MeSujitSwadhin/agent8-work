# services/content_service.py
import logging
from app.core.model_registry import ModelRegistry
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

logger = logging.getLogger("content-service")

class ContentService:
    def __init__(self, registry: ModelRegistry):
        self.registry = registry
        self.llm = self.registry.groq("llama-3.1-8b-instant")
        self.parser = JsonOutputParser()

        self.prompt = ChatPromptTemplate.from_messages([
            ("system",
            "You are a professional AI marketing content creator. "
            "Your goal is to generate *high-quality, original, and engaging content* for different platforms. "
            "Each output must follow a strict JSON schema and maintain factual, concise, and audience-appropriate tone. "
            "Avoid repetition and unnecessary verbosity."
            ),
            ("user",
            "Generate marketing drafts for these topics: {topics}\n\n"
            "Create three distinct pieces of content for:\n"
            "1. Blog (educational & SEO-optimized)\n"
            "2. LinkedIn post (professional tone)\n"
            "3. WhatsApp message (short, conversational tone)\n\n"
            "Follow this STRICT JSON schema:\n"
            "{{\n"
            "  \"blog\": {{\n"
            "     \"title\": string,\n"
            "     \"content\": string,\n"
            "     \"tags\": [string, string, ...]\n"
            "  }},\n"
            "  \"linkedin\": {{\n"
            "     \"title\": string,\n"
            "     \"content\": string,\n"
            "     \"tags\": [string, string, ...]\n"
            "  }},\n"
            "  \"whatsapp\": {{\n"
            "     \"message\": string\n"
            "  }}\n"
            "}}\n\n"
            "Ensure both blog and LinkedIn outputs always have **title**, **content**, and **tags** keys. "
            "Do not use 'description' or other keys. Return ONLY valid JSON, no markdown or commentary."
            )
        ])

        self.chain = self.prompt | self.llm | self.parser

    def generate_content(self, topics: str):
        if not topics.strip():
            raise ValueError("Topic is required")

        logger.info(f"[ContentService] Generating content for: {topics}")
        result = self.chain.invoke({"topics": topics})

        # ensure clean output
        for key in ["blog", "linkedin"]:
            item = result.get(key, {})
            item.setdefault("title", "")
            item.setdefault("content", "")
            item.setdefault("tags", [])
            result[key] = item

        return result