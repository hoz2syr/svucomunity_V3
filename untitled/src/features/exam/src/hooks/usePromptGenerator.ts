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

    prompt += `\nيجب أن تقوم بإرجاع النتيجة حصرياً بصيغة JSON صالحة بالشكل التالي تماماً:\n`;
    prompt += `[\n  {\n`;
    prompt += `    "id": "معرف_فريد_مثلا_uuid",\n`;
    prompt += `    "type": "multiple_choice" أو "true_false" أو "essay",\n`;
    prompt += `    "text": "نص السؤال الدقيق",\n`;
    prompt += `    "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"], // فقط لأسئلة multiple_choice\n`;
    prompt += `    "correctAnswer": "الإجابة الصحيحة نصاً (يجب أن تطابق أحد الخيارات لأسئلة multiple_choice، أو 'true' أو 'false' لأسئلة true_false)",\n`;

    if (prefs.includeExplanations) {
      prompt += `    "explanation": "شرح مفصل ومفيد لسبب الإجابة الصحيحة، وتصحيح للمفاهيم الخاطئة المحتملة"\n`;
    }

    prompt += `  }\n]\n`;
    prompt += `\nتأكد من عدم إضافة أية نصوص إضافية خارج مصفوفة الـ JSON، فقط قم بإرجاع الـ JSON الخام الصالح.`;

    return prompt;
  }, [prefs]);
}
