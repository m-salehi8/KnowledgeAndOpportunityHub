from typing import Optional, Dict, Any
from ai.provider import AIProvider
from schemas import AIEnrichmentResult, AIJobScoreResult


class MockAIProvider(AIProvider):
    async def enrich(self, text: str, url: Optional[str] = None) -> AIEnrichmentResult:
        is_persian = any("\u0600" <= c <= "\u06FF" for c in text[:200])
        first_line = text.strip().split("\n")[0][:120].strip() or "Forwarded Item"

        # Extract simulated tags based on keywords
        common_tags = ["Python", "FastAPI", "React", "TypeScript", "AI", "PWA", "Docker", "Architecture", "Telegram", "RSS"]
        found_tags = [t for t in common_tags if t.lower() in text.lower()]
        if not found_tags:
            found_tags = ["Knowledge", "Bookmarked"]

        if is_persian:
            return AIEnrichmentResult(
                title=first_line,
                summary=f"خلاصه هوشمند استخراج‌شده: {text[:220].strip()}...",
                tags=found_tags[:4],
                category="فناوری و وب",
                language="fa",
            )
        else:
            return AIEnrichmentResult(
                title=first_line,
                summary=f"Key technical digest: {text[:220].strip()}...",
                tags=found_tags[:4],
                category="Software Engineering",
                language="en",
            )

    async def score_job(self, job: Dict[str, Any], profile: Dict[str, Any]) -> AIJobScoreResult:
        skills = profile.get("skills", ["Python", "FastAPI", "React", "TypeScript"])
        job_text = f"{job.get('title', '')} {job.get('content', '')}".lower()

        matched = [s for s in skills if s.lower() in job_text]
        score = min(98, max(50, 60 + len(matched) * 10))

        # Check negative keywords
        for neg in profile.get("keywords_exclude", []):
            if neg.lower() in job_text:
                score = max(20, score - 35)

        return AIJobScoreResult(
            score=score,
            reason=f"تطابق بر اساس {len(matched)} مهارت کلیدی ({', '.join(matched[:3]) or 'پایه'}) و اولویت ریموت.",
        )
