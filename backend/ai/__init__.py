from config import settings
from ai.provider import AIProvider
from ai.gemini_provider import GeminiAIProvider
from ai.mock_provider import MockAIProvider


def get_ai_provider() -> AIProvider:
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip() and settings.GEMINI_API_KEY != "your-gemini-api-key-here":
        return GeminiAIProvider(api_key=settings.GEMINI_API_KEY, model=settings.GEMINI_MODEL)
    return MockAIProvider()
