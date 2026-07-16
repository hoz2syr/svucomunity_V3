# OCR System for Handwritten Notebooks

خدمة تحويل صور الدفاتر المخطوطة إلى ملفات PDF و Word و Markdown احترافية.

## Features

- رفع صور دفتر مخطوط
- معالجة مسبقة للصور (تحسين الجودة)
- استخراج النصوص والمعادلات والجداول باستخدام Mistral OCR
- معالجة ذكية للمخرجات (LLM)
- تصدير إلى PDF, Word, Markdown

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Run the API
uvicorn app.main:app --reload
```

## Architecture

```
ocr/
├── app/
│   ├── api/          # FastAPI endpoints
│   ├── models/       # Pydantic schemas
│   ├── services/     # Business logic
│   └── config.py     # Settings
├── tests/
└── frontend/
    └── src/
        ├── components/
        ├── hooks/
        ├── services/
        └── types/
```

## Tech Stack

- **Backend:** FastAPI + BackgroundTasks
- **OCR:** Mistral OCR API
- **Image Processing:** OpenCV
- **LLM:** Mistral (mistral-small-latest)
- **Export:** fpdf2, python-docx

## License

Proprietary
