export interface ScheduleEntry {
  code: string;
  name: string;
  section?: string;
  instructor?: string;
  time?: string;
}

export interface ParsedSchedule {
  major: string;
  entries: ScheduleEntry[];
}
