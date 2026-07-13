"use client";

import { useMemo } from 'react';
import { PromptPreferences } from './usePromptPreferences';

export function usePromptGenerator(prefs: PromptPreferences) {
  return useMemo(() => {
    let prompt = `أريد منك إنشاء اختبار حول موضوع "${prefs.topic || 'عام'}".\n`;
    prompt += `مستوى الصعوبة: ${prefs.difficulty}.\n\n`;
    prompt += `يتكون الاختبار من:\n`;
    if (prefs.mcqCount > 0) prompt += `- ${prefs.mcqCount} أسئلة اختيار من متعدد.\n`;
    if (prefs.tfCount > 0) prompt += `- ${prefs.tfCount} أسئلة صح/خطأ.\n`;
    if (prefs.essayCount > 0) prompt += `- ${prefs.essayCount} أسئلة مقالية.\n`;

    prompt += `\nدعم التنسيق المتقدم في الأسئلة والإجابات:\n`;
    prompt += `- Markdown: **نص عريض**، *مائل*، قوائم، روابط.\n`;
    prompt += `- LaTeX: معادلات داخلية $x^2 + 3x$ وكتل $$\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$.\n`;
    prompt += `- Mermaid: مخططات داخل كتلة \`\`\`mermaid\\n<diagram>\\n\`\`\`.\n`;
    prompt += `- جداول: | عمود 1 | عمود 2 |\\n|---------|---------|\\n| قيمة 1  | قيمة 2  |.\n\n`;

    prompt += `يجب أن تقوم بإرجاع النتيجة حصرياً بصيغة JSON صالحة بالشكل التالي تماماً:\n`;
    prompt += `[\n  {\n`;
    prompt += `    "id": "معرف_فريد_مثلا_uuid",\n`;
    prompt += `    "type": "multiple_choice" أو "true_false" أو "essay",\n`;
    prompt += `    "text": "نص السؤال الدقيق. يمكنك استخدام **Markdown** و$LaTeX$ و\\\n\`\`\`mermaid\\n<diagram>\\n\`\`\` وجداول Markdown.",\n`;
    prompt += `    "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"], // فقط لأسئلة multiple_choice\n`;
    prompt += `    "correctAnswer": "الإجابة الصحيحة نصاً (يجب أن تطابق أحد الخيارات لأسئلة multiple_choice، أو 'true' أو 'false' لأسئلة true_false)",\n`;

    if (prefs.includeExplanations) {
      prompt += `    "explanation": "شرح مفصل ومفيد لسبب الإجابة الصحيحة. يدعم Markdown و$LaTeX$"\n`;
    }

    prompt += `  }\n]\n`;
    prompt += `\nتأكد من عدم إضافة أية نصوص إضافية خارج مصفوفة الـ JSON، فقط قم بإرجاع الـ JSON الخام الصالح.\n`;
    prompt += `لا تحوي الأسئلة والشرح أي محتوى بصري خارج الأنماط المذكورة أعلاه (لا صور، لا روابط خارجية، لا تنسيقات غريبة).`;

    return prompt;
  }, [prefs]);
}
