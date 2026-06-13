import { motion } from 'motion/react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Upload, Loader2, AlertCircle, Info } from 'lucide-react';

interface ScheduleUploadProps {
  isUploading: boolean;
  error: string | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ScheduleUpload({ isUploading, error, onFileUpload }: ScheduleUploadProps) {
  return (
    <motion.div
      key="upload-tab"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <Card className="p-12 border-dashed border-2 border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center group hover:border-indigo-300 transition-colors cursor-pointer relative">
        <input
          type="file"
          accept="image/*"
          onChange={onFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isUploading}
          aria-label="Upload schedule image"
        />
        <div className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all',
          isUploading ? 'bg-indigo-100' : 'bg-white shadow-sm group-hover:scale-110'
        )}>
          {isUploading ? (
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" aria-label="Processing" />
          ) : (
            <Upload className="w-10 h-10 text-indigo-600" aria-hidden="true" />
          )}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isUploading ? 'Processing your schedule...' : 'Upload your schedule image'}
        </h2>
        <p className="text-slate-500 max-w-md">
          {isUploading
            ? 'Our AI is analyzing the image to extract course details. This usually takes a few seconds.'
            : 'Drag and drop your image here, or click to browse. We support JPG, PNG and WebP (max 10MB).'}
        </p>
      </Card>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-indigo-50 p-6 rounded-2xl flex gap-4 items-start">
        <Info className="text-indigo-600 w-6 h-6 shrink-0 mt-1" aria-hidden="true" />
        <div>
          <h4 className="font-bold text-indigo-900 mb-1">How it works</h4>
          <p className="text-sm text-indigo-800/80 leading-relaxed">
            Our system uses advanced AI to read the text in your image. It looks for course codes like{' '}
            <code className="bg-indigo-100 px-1 rounded">CS101</code> or{' '}
            <code className="bg-indigo-100 px-1 rounded">ENGL200</code>. Once identified, we search
            our database for active study groups for those exact courses.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
