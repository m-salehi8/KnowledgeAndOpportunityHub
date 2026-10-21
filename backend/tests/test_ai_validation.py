import pytest
from pydantic import ValidationError
from schemas import AIEnrichmentResult, AIJobScoreResult
from ai.mock_provider import MockAIProvider


def test_ai_enrichment_pydantic_schema_validation():
    valid_data = {
        "title": "معماری ایجنت‌های هوش مصنوعی",
        "summary": "بررسی روش‌های نوین ذخیره کانتکست با مدل‌های زبانی",
        "tags": ["AI", "Python"],
        "category": "هوش مصنوعی",
        "language": "fa",
    }
    result = AIEnrichmentResult.model_validate(valid_data)
    assert result.title == valid_data["title"]
    assert result.tags == ["AI", "Python"]

    # Invalid data (missing required title)
    with pytest.raises(ValidationError):
        AIEnrichmentResult.model_validate({"summary": "no title", "tags": []})


def test_ai_job_score_bounds_validation():
    # Valid score
    score_ok = AIJobScoreResult.model_validate({"score": 92, "reason": "Good match"})
    assert score_ok.score == 92

    # Score > 100 should raise ValidationError
    with pytest.raises(ValidationError):
        AIJobScoreResult.model_validate({"score": 150, "reason": "Out of bounds"})

    # Score < 0 should raise ValidationError
    with pytest.raises(ValidationError):
        AIJobScoreResult.model_validate({"score": -10, "reason": "Negative"})


@pytest.mark.asyncio
async def test_mock_ai_provider_fallback():
    provider = MockAIProvider()
    res = await provider.enrich("بررسی روش‌های FastAPI و سیستم‌های توزیع‌شده پایتون")
    assert res.title != ""
    assert res.language == "fa"
    assert "FastAPI" in res.tags or "Python" in res.tags
