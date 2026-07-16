export function convertSemesterCodeToLabel(code: string): string {
  const match = code.match(/^S(\d{2})$/);
  if (!match) return code;

  const year = 2000 + parseInt(match[1], 10);
  return `${year}/${year + 1} - الفصل الثاني`;
}

export function getCurrentSemesterCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (month >= 7) {
    return `S${String(year - 2000).padStart(2, '0')}`;
  } else {
    return `S${String(year - 2000 - 1).padStart(2, '0')}`;
  }
}
