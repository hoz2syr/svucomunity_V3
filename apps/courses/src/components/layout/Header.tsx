export function Header() {
  return (
    <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl text-white mb-1 tracking-tight">المواد الدراسية</h1>
            <p className="text-slate-400 text-sm">مجتمع طلاب الجامعة</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0" />
        </div>
      </div>
    </header>
  );
}
