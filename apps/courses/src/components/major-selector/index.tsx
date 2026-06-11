import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type MajorSelectorProps = {
  majors: string[];
  selectedMajor: string;
  onSelectMajor: (major: string) => void;
};

const LISTBOX_ID = 'major-select-listbox';

export function MajorSelector({ majors, selectedMajor, onSelectMajor }: MajorSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <label htmlFor="major-select" id="major-select-label" className="text-slate-300 text-lg">
        التخصص:
      </label>
      <span id={`${LISTBOX_ID}-desc`} className="sr-only">
        اختر تخصصاً لعرض المواد الخاصة به
      </span>
      <Select value={selectedMajor} onValueChange={onSelectMajor}>
        <SelectTrigger
          id="major-select"
          aria-describedby={`${LISTBOX_ID}-desc`}
          aria-labelledby="major-select-label"
          className="w-[280px] bg-slate-800/50 backdrop-blur-xl border-white/10 text-white rounded-xl h-12 px-4 hover:bg-slate-800/70 transition-all"
        >
          <SelectValue placeholder="اختر التخصص" />
        </SelectTrigger>
        <SelectContent
          id={LISTBOX_ID}
          className="bg-slate-800 backdrop-blur-xl border-white/10 text-white rounded-xl"
        >
          {majors.length === 0 ? (
            <SelectItem value="" disabled className="text-muted-foreground cursor-default">
              لا توجد تخصصات متاحة
            </SelectItem>
          ) : (
            majors.map((major) => (
              <SelectItem
                key={major}
                value={major}
                className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
              >
                {major}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
