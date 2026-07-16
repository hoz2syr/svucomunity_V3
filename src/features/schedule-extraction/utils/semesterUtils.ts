export function convertSemesterCodeToLabel(code: string): string {
  const match = code.match(/^(\d{4})\/(\d{4})-([12])$/);
  if (match) {
    const year1 = match[1];
    const year2 = match[2];
    const sem = match[3] === '1' ? 'الأول' : 'الثاني';
    return `${year1}/${year2} - الفصل ${sem}`;
  }

  const legacyMatch = code.match(/^S(\d{2})$/);
  if (!legacyMatch) return code;

  const year = 2000 + parseInt(legacyMatch[1], 10);
  return `${year}/${year + 1} - الفصل الثاني`;
}

export function getCurrentSemesterCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (month >= 7) {
    return `${year}/${year + 1}-1`;
  } else {
    return `${year - 1}/${year}-2`;
  }
}
