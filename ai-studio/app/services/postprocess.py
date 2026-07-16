import logging
from mistralai import Mistral
from app.config import settings
import httpx
from mistralai.utils.retries import RetryConfig, BackoffStrategy

logger = logging.getLogger(__name__)


class PostProcessor:
    def __init__(self):
        retry_config = RetryConfig(
            strategy="backoff",
            backoff=BackoffStrategy(
                initial_interval=1000,
                max_interval=30000,
                exponent=2.0,
                max_elapsed_time=120000,
            ),
            retry_connection_errors=True,
        )
        http_client = httpx.Client(
            timeout=httpx.Timeout(120.0, connect=30.0),
            follow_redirects=True,
            http2=False,
        )
        self.client = Mistral(
            api_key=settings.mistral_api_key,
            retry_config=retry_config,
            timeout_ms=120000,
            client=http_client,
        )

    def enhance_markdown(self, raw_markdown: str, context: str = "") -> str:
        prompt = f"""أنت مساعد متخصص في تنظيم وتنسيق النصوص المستخرجة من دفاتر مخطوطة.

المهام:
1. تصحيح الأخطاء الناتجة عن قراءة الخط اليدوي
2. تنظيم العناوين باستخدام Markdown (# ## ###)
3. الحفاظ على المعادلات الرياضية داخل وسوم $$...$$
4. الحفاظ على الجداول بتنسيق Markdown
5. إضافة فقرات مناسبة لتحسين القراءة

النص الخام:
{raw_markdown}

السياق الإضافي:
{context}

أخرج النص المنسق فقط بدون أي شرح."""
        try:
            response = self.client.chat.complete(
                model="mistral-small-latest",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that formats handwritten notes into clean Markdown."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=4000,
            )
            return response.choices[0].message.content.strip()
        except Exception as exc:
            logger.error("Postprocessing failed: %s", exc, exc_info=True)
            return raw_markdown
