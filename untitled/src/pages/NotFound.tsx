import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <main className="min-h-screen bg-[#060a1f] text-slate-100 flex items-center justify-center p-6" dir="rtl">
    <div className="max-w-xl w-full text-center space-y-6">
      <p className="text-cyan-400 font-display font-extrabold text-7xl">404</p>
      <h1 className="text-3xl font-bold text-white">الصفحة غير موجودة</h1>
      <p className="text-slate-400 leading-relaxed">
        لا يمكننا العثور على الصفحة التي تبحث عنها. يمكنك العودة إلى الصفحة الرئيسية ومتابعة التصفح من هناك.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-colors"
      >
        العودة للرئيسية
      </Link>
    </div>
  </main>
);
