import os
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# ---------------------------------------------------------------------
# Environment Setup
# ---------------------------------------------------------------------
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("writer-agent")
logger.info(f"🔑 Groq API key loaded (prefix): {api_key[:8]}...")

MODEL_NAME = "llama-3.1-8b-instant"

# ---------------------------------------------------------------------
# Prompt Engineering
# ---------------------------------------------------------------------
prompt = ChatPromptTemplate.from_messages([
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
     "⚙️ Follow this STRICT JSON schema:\n"
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

# ---------------------------------------------------------------------
# LangChain Setup
# ---------------------------------------------------------------------
parser = JsonOutputParser()
llm = ChatGroq(model=MODEL_NAME, api_key=api_key, temperature=0.7)
chain = prompt | llm | parser

# ---------------------------------------------------------------------
# Generator Function
# ---------------------------------------------------------------------
def generate_drafts_with_langchain(topics: str) -> Dict[str, Any]:
    joined = topics.strip()
    if not joined:
        raise ValueError("No valid topics provided.")
    try:
        logger.info(f"✍️ Generating drafts for topics: {joined}")
        response = chain.invoke({"topics": joined})

        # Normalize output to ensure structure consistency
        for key in ["blog", "linkedin"]:
            item = response.get(key, {})
            # Map 'description' → 'content' if model misnames it
            if "description" in item and "content" not in item:
                item["content"] = item.pop("description")

            # Ensure keys exist
            item.setdefault("title", "Untitled")
            item.setdefault("content", "")
            item.setdefault("tags", [])

            # If tags come as comma-separated string, convert to list
            if isinstance(item.get("tags"), str):
                item["tags"] = [t.strip() for t in item["tags"].split(",") if t.strip()]

            response[key] = item

        logger.info("✅ Drafts generated and normalized successfully.")
        return response

    except Exception as e:
        logger.exception("❌ Unexpected error during generation.")
        raise RuntimeError("Internal AI generation error.") from e
