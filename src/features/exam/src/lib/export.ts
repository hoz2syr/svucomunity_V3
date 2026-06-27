import { TestModel, Question } from '../types';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header } from 'docx';
import { saveAs } from 'file-saver';
import { escapeHtml } from './utils';

const EXPORT_COLORS = {
  text: '#0f172a',
  textMuted: '#475569',
  textLight: '#64748b',
  textFaint: '#94a3b8',
  heading: '#1e293b',
  accent: '#0ea5e9',
  correct: '#059669',
  correctInverse: '#dc2626',
  incorrect: '#334155',
  essayBorder: '#cbd5e1',
  explanationBg: '#f8fafc',
  divider: '#e2e8f0',
  white: '#ffffff',
} as const;

interface MCQOptionMeta {
  text: string;
  isCorrect: boolean;
  color: string;
  weight: string;
  icon: string;
}

interface TFState {
  showT: boolean;
  showTColor: string;
  showF: boolean;
  showFColor: string;
}

function getMCQOptionMeta(opt: string, correctAnswer: string | undefined, showExplanations: boolean): MCQOptionMeta {
  const isCorrect = showExplanations && opt === correctAnswer;
  return {
    text: opt,
    isCorrect,
    color: isCorrect ? EXPORT_COLORS.correct : EXPORT_COLORS.incorrect,
    weight: isCorrect ? 'bold' : 'normal',
    icon: isCorrect ? '☑ ' : '○ '
  };
}

function getTFState(correctAnswer: string | undefined, showExplanations: boolean): TFState {
  const t = correctAnswer?.toLowerCase() === 'true';
  const f = correctAnswer?.toLowerCase() === 'false';
  return {
    showT: showExplanations && t,
    showF: showExplanations && f,
    showTColor: showExplanations && t ? EXPORT_COLORS.correct : EXPORT_COLORS.incorrect,
    showFColor: showExplanations && f ? EXPORT_COLORS.correctInverse : EXPORT_COLORS.incorrect
  };
}

function renderQuestionPdf(test: TestModel, q: Question, _index: number): string {
  const parts: string[] = [];

  if (q.type === 'multiple_choice' && q.options) {
    parts.push('<div style="display: flex; flex-direction: column; gap: 12px; padding-right: 20px;">');
    q.options.forEach(opt => {
      const m = getMCQOptionMeta(opt, q.correctAnswer, test.settings.showExplanations);
      parts.push(`<div style="color: ${m.color}; font-weight: ${m.weight}; font-size: 15pt;">${m.icon}${escapeHtml(m.text)}</div>`);
    });
    parts.push('</div>');
  } else if (q.type === 'true_false') {
    const tf = getTFState(q.correctAnswer, test.settings.showExplanations);
    parts.push(`<div style="display: flex; gap: 40px; padding-right: 20px; font-size: 15pt;">
      <strong style="color: ${tf.showTColor}">${tf.showT ? '☑' : '○'} صح</strong>
      <strong style="color: ${tf.showFColor}">${tf.showF ? '☑' : '○'} خطأ</strong>
    </div>`);
  } else if (q.type === 'essay') {
    parts.push(`<div style="margin-top: 16px; height: 120px; border: 2px dashed ${EXPORT_COLORS.essayBorder}; border-radius: 8px;"></div>`);
  }

  if (test.settings.showExplanations && q.explanation) {
    parts.push(`<div style="margin-top: 20px; padding: 16px; background: ${EXPORT_COLORS.explanationBg}; border-right: 4px solid ${EXPORT_COLORS.accent}; border-radius: 6px; font-size: 14pt; color: ${EXPORT_COLORS.textMuted}; line-height: 1.6;">
      <strong style="color: ${EXPORT_COLORS.accent};">الشرح التوضيحي:</strong> ${escapeHtml(q.explanation)}
    </div>`);
  }

  return parts.join('');
}

function renderQuestionWord(test: TestModel, q: Question, index: number, children: Paragraph[]) {
  children.push(new Paragraph({
    bidirectional: true,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: `${index + 1}. ${q.text}`, bold: true, size: 32, color: EXPORT_COLORS.text, font: 'Arial' })]
  }));

  if (q.type === 'multiple_choice' && q.options) {
    q.options.forEach(opt => {
      const m = getMCQOptionMeta(opt, q.correctAnswer, test.settings.showExplanations);
      children.push(new Paragraph({
        bidirectional: true,
        spacing: { before: 80, after: 80 },
        indent: { start: 720 },
        children: [new TextRun({ text: m.icon + m.text, bold: m.isCorrect, color: m.isCorrect ? EXPORT_COLORS.correct : EXPORT_COLORS.incorrect, size: 28, font: 'Arial' })]
      }));
    });
  } else if (q.type === 'true_false') {
    const tf = getTFState(q.correctAnswer, test.settings.showExplanations);
    children.push(new Paragraph({
      bidirectional: true,
      spacing: { before: 80, after: 80 },
      indent: { start: 720 },
      children: [
        new TextRun({ text: (tf.showT ? '☑ ' : '○ ') + 'صح        ', bold: tf.showT, color: tf.showTColor, size: 28, font: 'Arial' }),
        new TextRun({ text: (tf.showF ? '☑ ' : '○ ') + 'خطأ', bold: tf.showF, color: tf.showFColor, size: 28, font: 'Arial' })
      ]
    }));
  } else if (q.type === 'essay') {
    children.push(new Paragraph({ bidirectional: true, spacing: { before: 200, after: 200 }, children: [new TextRun({ text: '(مساحة للإجابة)', color: EXPORT_COLORS.textFaint, size: 24, font: 'Arial' })] }));
    children.push(new Paragraph({ text: '\n\n', bidirectional: true }));
  }

  if (test.settings.showExplanations && q.explanation) {
    children.push(new Paragraph({
      bidirectional: true,
      spacing: { before: 200, after: 200 },
      indent: { start: 720 },
      children: [
        new TextRun({ text: 'الشرح التوضيحي: ', bold: true, color: EXPORT_COLORS.accent, size: 28, font: 'Arial' }),
        new TextRun({ text: q.explanation, color: EXPORT_COLORS.textMuted, size: 28, font: 'Arial' })
      ]
    }));
  }
}

// Renders the test layout as a standalone HTML fragment and triggers browser print-to-PDF.
export const exportToPdf = async (test: TestModel) => {
  const html = buildPdfHtml(test);

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لتصدير PDF');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  await new Promise<void>(resolve => {
    const onReady = () => {
      printWindow.removeEventListener('load', onReady);
      setTimeout(() => {
        printWindow.print();
        resolve();
      }, 400);
    };
    printWindow.addEventListener('load', onReady);
    setTimeout(() => {
      printWindow.removeEventListener('load', onReady);
      resolve();
    }, 2000);
  });

  setTimeout(() => {
    try { printWindow.close(); } catch {}
  }, 1000);
};

function buildPdfHtml(test: TestModel): string {
  const questionsHtml = test.questions
    .map((q, idx) => {
      const answerBlock = renderQuestionPdf(test, q, idx);
      return `
        <div style="margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid ${EXPORT_COLORS.divider}; page-break-inside: avoid;">
          <h3 style="font-size: 17pt; margin: 0 0 14px 0; font-weight: 700; color: ${EXPORT_COLORS.text}; line-height: 1.6;">${idx + 1}. ${escapeHtml(q.text)}</h3>
          ${answerBlock}
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(test.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
      direction: rtl;
      color: ${EXPORT_COLORS.text};
      background: ${EXPORT_COLORS.white};
      padding: 40px 48px;
      line-height: 1.7;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page {
      size: A4;
      margin: 18mm 18mm 22mm 18mm;
    }
    .brand {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid ${EXPORT_COLORS.accent};
      padding-bottom: 18px;
      margin-bottom: 32px;
    }
    .brand-name {
      font-size: 20pt;
      font-weight: 800;
      color: ${EXPORT_COLORS.text};
    }
    .brand-meta {
      text-align: left;
      font-size: 10pt;
      color: ${EXPORT_COLORS.textLight};
    }
    .brand-meta strong {
      color: ${EXPORT_COLORS.accent};
    }
    h1 {
      font-size: 24pt;
      margin: 0 0 14px 0;
      font-weight: 800;
      color: ${EXPORT_COLORS.heading};
      text-align: center;
    }
    .desc {
      text-align: center;
      font-size: 14pt;
      color: ${EXPORT_COLORS.textMuted};
      margin-bottom: 40px;
    }
  </style>
</head>
<body>
  <div class="brand">
    <div class="brand-name">مجتمع SVU</div>
    <div class="brand-meta">
      <div><strong>svucommunity.social</strong></div>
      <div>منصة الاختبارات</div>
    </div>
  </div>
  <h1>${escapeHtml(test.title)}</h1>
  ${test.description ? `<p class="desc">${escapeHtml(test.description)}</p>` : ''}
  ${questionsHtml}
</body>
</html>`;
}


export const exportToWord = async (test: TestModel) => {
  const children: Paragraph[] = [
    new Paragraph({
      text: test.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 200 }
    }),
  ];

  if (test.description) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 400 },
      children: [
         new TextRun({ text: test.description, size: 32, color: EXPORT_COLORS.textMuted, font: "Arial" })
      ]
    }));
  }

  test.questions.forEach((q, index) => {
    renderQuestionWord(test, q, index, children);
  });

  const doc = new Document({
    creator: "SVU Quiz Community",
    title: test.title,
    description: "Generated Test",
    sections: [{
      headers: {
        default: new Header({
          children: [
             new Paragraph({
               alignment: AlignmentType.CENTER,
               bidirectional: true,
               children: [
                 new TextRun({ text: "مجتمع SVU", bold: true, color: EXPORT_COLORS.accent, size: 36, font: "Arial" }),
               ],
             }),
             new Paragraph({
               alignment: AlignmentType.CENTER,
               bidirectional: true,
               spacing: { after: 400 },
               children: [
                 new TextRun({ text: "svucommunity.social", color: EXPORT_COLORS.textLight, size: 24, font: "Arial" }),
               ],
             }),
          ]
        })
      },
      properties: {},
      children: children
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${test.title || 'test'}.docx`);
};
