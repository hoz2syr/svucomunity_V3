import { useToast } from '@/hooks/use-toast'

export function Toaster() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-slate-900 text-white text-xs rounded-lg shadow-lg border border-white/10 px-4 py-3 animate-in"
        >
          <p className="font-medium">{t.title}</p>
          {t.description && <p className="text-muted-foreground mt-0.5">{t.description}</p>}
        </div>
      ))}
    </div>
  )
}
