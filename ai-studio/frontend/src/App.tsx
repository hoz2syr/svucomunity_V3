import { useState, useCallback } from 'react'
import { FileText, Sparkles, MessageSquare, ChevronDown, ChevronLeft, User, Settings, Wrench } from 'lucide-react'
import { FileUpload } from './components/FileUpload'
import { ChatView } from './components/ocr/ChatView'
import { Separator } from '@/components/ui/separator'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppBackground } from './components/AppBackground'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'

type View = 'ocr' | 'chat'

function App() {
  const [view, setView] = useState<View>('ocr')
  const [chatInitialText, setChatInitialText] = useState<string | null>(null)
  const [accountOpen, setAccountOpen] = useState(true)
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const { toast } = useToast()

  const handleSendToChat = useCallback((text: string) => {
    setChatInitialText(text)
    setView('chat')
  }, [])

  return (
    <div className="h-screen flex flex-row-reverse relative overflow-hidden text-foreground">
      <AppBackground variant="feature" />

      <aside className="w-64 bg-slate-950/80 backdrop-blur-2xl border-l border-white/15 flex flex-col shrink-0 z-20 relative">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">AI Studio</h1>
            <p className="text-xs text-muted-foreground leading-tight">تحويل ذكي بالذكاء الاصطناعي</p>
          </div>
        </div>

        <nav className="p-3 space-y-1" aria-label="التنقل الرئيسي">
          <button
            onClick={() => setView('ocr')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              view === 'ocr'
                ? 'bg-primary/15 text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
            aria-current={view === 'ocr' ? 'page' : undefined}
          >
            <FileText className="w-4 h-4" />
            <span>تحويل AI Studio</span>
          </button>
          <button
            onClick={() => setView('chat')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              view === 'chat'
                ? 'bg-primary/15 text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
            aria-current={view === 'chat' ? 'page' : undefined}
          >
            <MessageSquare className="w-4 h-4" />
            <span>الدردشة</span>
          </button>
        </nav>

        <Separator className="bg-white/10" />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          <div className="space-y-1">
            <button
              onClick={() => setAccountOpen((prev) => !prev)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span className="flex-1">إعدادات الحساب</span>
              {accountOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
            {accountOpen && (
              <div className="pr-7 space-y-1.5 animate-in">
                <button onClick={() => toast('الملف الشخصي', 'قريباً')} className="w-full text-right px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">الملف الشخصي</button>
                <button onClick={() => toast('الاشتراك', 'قريباً')} className="w-full text-right px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">الاشتراك</button>
                <button onClick={() => toast('الأمان', 'قريباً')} className="w-full text-right px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">الأمان</button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setChatSettingsOpen((prev) => !prev)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="flex-1">إعدادات الدردشة</span>
              {chatSettingsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
            {chatSettingsOpen && (
              <div className="pr-7 space-y-1.5 animate-in">
                <button onClick={() => toast('النموذج الافتراضي', 'قريباً')} className="w-full text-right px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">النموذج الافتراضي</button>
                <button onClick={() => toast('تعليمات النظام', 'قريباً')} className="w-full text-right px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">تعليمات النظام</button>
                <button onClick={() => toast('المحفوظات', 'قريباً')} className="w-full text-right px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">المحفوظات</button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setToolsOpen((prev) => !prev)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span className="flex-1">الأدوات</span>
              {toolsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
            {toolsOpen && (
              <div className="pr-7 space-y-1.5 animate-in">
                <button onClick={() => toast('تصدير البيانات', 'قريباً')} className="w-full text-right px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">تصدير البيانات</button>
                <button onClick={() => toast('الواجهة البرمجية', 'قريباً')} className="w-full text-right px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">الواجهة البرمجية</button>
                <button onClick={() => toast('التكاملات', 'قريباً')} className="w-full text-right px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">التكاملات</button>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-blue-600/30 flex items-center justify-center text-xs font-bold text-primary">م</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">مستخدم</p>
              <p className="text-xs text-muted-foreground truncate">تجريبي</p>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-accent" />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative z-10">
        <ErrorBoundary>
          {view === 'ocr' && (
            <div className="h-full overflow-auto">
              <FileUpload onSendToChat={handleSendToChat} />
            </div>
          )}
          {view === 'chat' && (
            <div className="h-full">
              <ChatView initialMessage={chatInitialText} />
            </div>
          )}
        </ErrorBoundary>
      </main>

      <Toaster />
    </div>
  )
}

export default App