from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from schemas import AIEnrichmentResult, AIJobScoreResult


class AIProvider(ABC):
    @abstractmethod
    async def enrich(self, text: str, url: Optional[str] = None) -> AIEnrichmentResult:
        """Enriches raw text/article into title, summary, tags, category, language."""
        pass

    @abstractmethod
    async def score_job(self, job: Dict[str, Any], profile: Dict[str, Any]) -> AIJobScoreResult:
        """Scores a job listing from 0 to 100 against candidate profile with concise reasoning."""
        pass
