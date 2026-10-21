import json
import logging
from typing import Optional, Dict, Any
from google import genai
from google.genai import types
from ai.provider import AIProvider
from schemas import AIEnrichmentResult, AIJobScoreResult

logger = logging.getLogger(__name__)


class GeminiAIProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "gemini-2.5-flash"):
        self.client = genai.Client(api_key=api_key)
        self.model = model

    async def enrich(self, text: str, url: Optional[str] = None) -> AIEnrichmentResult:
        prompt = f"""
You are an intelligent knowledge curator and multilingual technical editor.
Analyze the following raw forwarded content or article and extract:
1. title: Clean, informative title in the predominant language (Persian if mostly Persian, English if mostly English).
2. summary: A high-value 2-3 sentence executive summary highlighting key takeaways, tools, or concepts.
3. tags: 3 to 6 concise technical or topic tags (e.g. ["Python", "FastAPI", "AI"]).
4. category: A short single category name (e.g. "توسعه نرم‌افزار", "هوش مصنوعی", "امنیت", "معماری سیستم").
5. language: Primary language code ("fa" or "en").

Source URL: {url or "None"}

Content:
{text[:6000]}
"""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AIEnrichmentResult,
                    temperature=0.2,
                ),
            )
            data = json.loads(response.text)
            return AIEnrichmentResult.model_validate(data)
        except Exception as e:
            logger.error(f"Gemini enrichment failed: {e}. Falling back to heuristic extraction.")
            # Heuristic fallback
            first_line = text.strip().split("\n")[0][:100] or "Forwarded Item"
            return AIEnrichmentResult(
                title=first_line,
                summary=text[:250].strip() + ("..." if len(text) > 250 else ""),
                tags=["General", "Bookmarked"],
                category="عمومی",
                language="fa" if any("\u0600" <= c <= "\u06FF" for c in text[:100]) else "en",
            )

    async def score_job(self, job: Dict[str, Any], profile: Dict[str, Any]) -> AIJobScoreResult:
        prompt = f"""
You are a senior technical career advisor.
Evaluate how well this job listing matches the candidate profile.

Candidate Profile:
- Skills: {profile.get("skills", [])}
- Remote Preference: {profile.get("remote_preference", "any")}
- Target Locations: {profile.get("preferred_locations", [])}
- Minimum Salary USD: ${profile.get("min_salary_usd", 0)}
- Must Include Keywords: {profile.get("keywords_include", [])}
- Negative/Excluded Keywords: {profile.get("keywords_exclude", [])}

Job Listing:
- Title: {job.get("title")}
- Company: {job.get("company")}
- Location: {job.get("location")}
- Remote: {job.get("remote")}
- Salary: {job.get("salary_text")}
- Description: {str(job.get("content") or job.get("summary"))[:3000]}

Score the match from 0 to 100:
- 85-100: Exceptional match (strong overlap in primary skills, matches remote & salary).
- 70-84: Good match with minor gaps.
- Below 70: Weak match or conflicting constraints (e.g. on-site requirement when remote is preferred, or contains excluded keywords).

Provide concise reasoning in Persian (or English if candidate bio is English).
"""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AIJobScoreResult,
                    temperature=0.1,
                ),
            )
            data = json.loads(response.text)
            return AIJobScoreResult.model_validate(data)
        except Exception as e:
            logger.error(f"Gemini job scoring failed: {e}. Falling back to default scoring.")
            # Heuristic fallback scoring
            job_text = f"{job.get('title', '')} {job.get('content', '')}".lower()
            matched_skills = [s for s in profile.get("skills", []) if s.lower() in job_text]
            score = min(95, max(40, len(matched_skills) * 20))
            return AIJobScoreResult(
                score=score,
                reason=f"تطابق تقریبی بر اساس مهارت‌های شناسایی شده: {', '.join(matched_skills[:3]) or 'کلی'}",
            )
