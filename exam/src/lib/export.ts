import { TestModel } from '../types';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header } from 'docx';
import { saveAs } from 'file-saver';
import { escapeHtml } from './utils';

// Creates a temporary DOM node containing the print layout, exports to PDF, then cleans up.
export const exportToPdf = async (test: TestModel) => {
  const container = document.createElement('div');
  container.style.padding = '30px';
  container.style.direction = 'rtl';
  container.style.fontFamily = 'Cairo, sans-serif';
  container.style.color = '#000';
  container.style.background = '#fff';
  container.style.lineHeight = '1.6';

  let htmlContent = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
        <span style="font-size: 22pt; font-weight: 800; color: #0f172a;">مجتمع SVU</span>
      </div>
      <div style="text-align: left;">
        <div style="color: #0ea5e9; font-weight: bold; font-size: 12pt;">svucommunity.social</div>
        <div style="color: #64748b; font-size: 10pt;">منصة الاختبارات</div>
      </div>
    </div>
    <div style="text-align: center; margin-bottom: 50px;">
      <h1 style="font-size: 26pt; margin-bottom: 16px; color: #1e293b; font-weight: 800;">${escapeHtml(test.title)}</h1>
      ${test.description ? `<p style="font-size: 16pt; color: #475569;">${escapeHtml(test.description)}</p>` : ''}
    </div>
  `;

  test.questions.forEach((q, index) => {
    htmlContent += `
      <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0; page-break-inside: avoid;">
        <h3 style="font-size: 18pt; margin-bottom: 16px; font-weight: 700; color: #0f172a; line-height: 1.5;">${index + 1}. ${escapeHtml(q.text)}</h3>
    `;

    if (q.type === 'multiple_choice' && q.options) {
      htmlContent += `<div style="display: flex; flex-direction: column; gap: 12px; padding-right: 20px;">`;
      q.options.forEach(opt => {
        const isCorrect = test.settings.showExplanations && opt === q.correctAnswer;
        const color = isCorrect ? '#059669' : '#334155';
        const weight = isCorrect ? 'bold' : 'normal';
        const icon = isCorrect ? '☑ ' : '○ ';
        htmlContent += `<div style="color: ${color}; font-weight: ${weight}; font-size: 15pt;">${icon}${escapeHtml(opt)}</div>`;
      });
      htmlContent += `</div>`;
    } else if (q.type === 'true_false') {
      const showT = test.settings.showExplanations && q.correctAnswer?.toLowerCase() === 'true';
      const showF = test.settings.showExplanations && q.correctAnswer?.toLowerCase() === 'false';
      
      htmlContent += `
        <div style="display: flex; gap: 40px; padding-right: 20px; font-size: 15pt;">
          <strong style="color: ${showT ? '#059669' : '#334155'}">${showT ? '☑' : '○'} صح</strong>
          <strong style="color: ${showF ? '#dc2626' : '#334155'}">${showF ? '☑' : '○'} خطأ</strong>
        </div>
      `;
    } else if (q.type === 'essay') {
      htmlContent += `
        <div style="margin-top: 16px; height: 120px; border: 2px dashed #cbd5e1; border-radius: 8px;"></div>
      `;
    }

    if (test.settings.showExplanations && q.explanation) {
      htmlContent += `
        <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-right: 4px solid #0ea5e9; border-radius: 6px; font-size: 14pt; color: #475569; line-height: 1.6;">
          <strong style="color: #0ea5e9;">الشرح التوضيحي:</strong> ${escapeHtml(q.explanation)}
        </div>
      `;
    }

    htmlContent += `</div>`;
  });

  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  const opt = {
    margin:       15,
    filename:     `${test.title || 'test'}.pdf`,
    image:        { type: 'jpeg' as const, quality: 1.0 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  };

  await html2pdf().set(opt).from(container).save();
  document.body.removeChild(container);
};


export const exportToWord = async (test: TestModel) => {
  const children: any[] = [
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
         new TextRun({ text: test.description, size: 32, color: "475569", font: "Arial" })
      ]
    }));
  }

  test.questions.forEach((q, index) => {
    children.push(new Paragraph({
      bidirectional: true,
      spacing: { before: 400, after: 200 },
      children: [
         new TextRun({ text: `${index + 1}. ${q.text}`, bold: true, size: 32, color: "0f172a", font: "Arial" })
      ]
    }));

    if (q.type === 'multiple_choice' && q.options) {
      q.options.forEach(opt => {
        const isCorrect = test.settings.showExplanations && opt === q.correctAnswer;
        children.push(new Paragraph({
          bidirectional: true,
          spacing: { before: 80, after: 80 },
          indent: { start: 720 },
          children: [
            new TextRun({
              text: (isCorrect ? "☑ " : "○ ") + opt,
              bold: isCorrect,
              color: isCorrect ? "059669" : "334155",
              size: 28,
              font: "Arial"
            })
          ]
        }));
      });
    } else if (q.type === 'true_false') {
      const showT = test.settings.showExplanations && q.correctAnswer?.toLowerCase() === 'true';
      const showF = test.settings.showExplanations && q.correctAnswer?.toLowerCase() === 'false';
      children.push(new Paragraph({
        bidirectional: true,
        spacing: { before: 80, after: 80 },
        indent: { start: 720 },
        children: [
          new TextRun({ text: (showT ? "☑ " : "○ ") + "صح        ", bold: showT, color: showT ? "059669" : "334155", size: 28, font: "Arial" }),
          new TextRun({ text: (showF ? "☑ " : "○ ") + "خطأ", bold: showF, color: showF ? "dc2626" : "334155", size: 28, font: "Arial" })
        ]
      }));
    } else if (q.type === 'essay') {
      children.push(new Paragraph({ 
        bidirectional: true,
        spacing: { before: 200, after: 200 },
        children: [
           new TextRun({ text: "(مساحة للإجابة)", color: "94a3b8", size: 24, font: "Arial" })
        ]
      }));
      children.push(new Paragraph({ text: "\n\n", bidirectional: true }));
    }

    if (test.settings.showExplanations && q.explanation) {
      children.push(new Paragraph({
        bidirectional: true,
        spacing: { before: 200, after: 200 },
        indent: { start: 720 },
        children: [
           new TextRun({ text: "الشرح التوضيحي: ", bold: true, color: "0ea5e9", size: 28, font: "Arial" }),
           new TextRun({ text: q.explanation, color: "475569", size: 28, font: "Arial" })
        ]
      }));
    }
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
                 new TextRun({ text: "مجتمع SVU", bold: true, color: "0ea5e9", size: 36, font: "Arial" }),
               ],
             }),
             new Paragraph({
               alignment: AlignmentType.CENTER,
               bidirectional: true,
               spacing: { after: 400 },
               children: [
                 new TextRun({ text: "svucommunity.social", color: "64748b", size: 24, font: "Arial" }),
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
