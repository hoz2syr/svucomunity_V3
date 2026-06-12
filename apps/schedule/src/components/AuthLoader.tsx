import { Loader2 } from 'lucide-react';

export function AuthLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" aria-label="Loading" />
    </div>
  );
}
