export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ar-SA');
}

export function formatTime(time: string): string {
  return time;
}

export function formatScheduleDay(day: number): string {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[day] || '';
}
