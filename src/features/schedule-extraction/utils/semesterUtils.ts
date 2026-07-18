export function convertSemesterCodeToLabel(code: string): string {
  const shortMatch = code.match(/^([SF])(\d{2})$/i);
  if (shortMatch) {
    const sem = shortMatch[1].toUpperCase();
    const year = 2000 + parseInt(shortMatch[2], 10);
    const semLabel = sem === 'F' ? 'الأول' : 'الثاني';
    return `${year}/${year + 1} - الفصل ${semLabel}`;
  }

  const longMatch = code.match(/^(\d{4})\/(\d{4})-([12])$/);
  if (longMatch) {
    const year1 = longMatch[1];
    const year2 = longMatch[2];
    const sem = longMatch[3] === '1' ? 'الأول' : 'الثاني';
    return `${year1}/${year2} - الفصل ${sem}`;
  }

  return code;
}

export function getNextSemesterCode(current: string): string {
  const match = current.match(/^([FS])(\d{2})$/i);
  if (!match) {
    return current;
  }
  const prefix = match[1].toUpperCase();
  const year = parseInt(match[2], 10);

  if (prefix === 'F') {
    return `S${year.toString().padStart(2, '0')}`;
  }
  return `F${(year + 1).toString().padStart(2, '0')}`;
}

export function getCurrentSemesterCode(): string {
  const now = new Date();
  const yearShort = now.getFullYear().toString().slice(-2);
  const month = now.getMonth();

  if (month >= 7) {
    return `F${yearShort}`;
  } else {
    return `S${(now.getFullYear() - 1).toString().slice(-2)}`;
  }
}
