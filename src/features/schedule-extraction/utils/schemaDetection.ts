export interface TableSchema {
  columns: number;
  hasSeparator: boolean;
  columnOrder: string[];
}

export function detectTableSchema(markdown: string): TableSchema {
  const lines = markdown.split('\n').filter(line => line.startsWith('|'));

  if (lines.length === 0) {
    return { columns: 0, hasSeparator: false, columnOrder: [] };
  }

  const firstRow = lines[0]
    .split('|')
    .map(cell => cell.trim())
    .filter(Boolean);

  const hasSeparator = lines[1]?.includes('---') || false;

  return {
    columns: firstRow.length,
    hasSeparator,
    columnOrder: guessColumnOrder(firstRow),
  };
}

function guessColumnOrder(headers: string[]): string[] {
  const order: string[] = [];

  for (const header of headers) {
    const lower = header.toLowerCase();
    if (lower.includes('course') || lower.includes('مادة') || lower.includes('اسم')) {
      order.push('name');
    } else if (lower.includes('semester') || lower.includes('فصل') || lower.includes('سنة')) {
      order.push('semester');
    } else if (lower.includes('code') || lower.includes('كود') || lower.includes('رمز')) {
      order.push('code');
    } else if (lower.includes('instructor') || lower.includes('مدرس') || lower.includes('استاذ')) {
      order.push('instructor');
    } else if (lower.includes('username') || lower.includes('user') || lower.includes('مستخدم')) {
      order.push('username');
    } else {
      order.push('unknown');
    }
  }

  return order;
}
