import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#030614] border-t border-slate-800/50 py-10 px-4 md:px-8">
       <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-right w-full md:w-1/3">
             <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-cyan-400 to-indigo-500 mb-2 font-display" dir="ltr">SVU Community</div>
             <p className="text-slate-500 text-sm">مجتمع طلاب تقنية المعلومات في SVU</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 w-full md:w-1/3 text-sm text-slate-400">
             <Link to="/" className="hover:text-cyan-400 transition-colors">الرئيسية</Link>
             <Link to="/#features" className="hover:text-cyan-400 transition-colors">المجموعات</Link>
             <Link to="/#features" className="hover:text-cyan-400 transition-colors">المقررات</Link>
             <Link to="/#how" className="hover:text-cyan-400 transition-colors">الجدول</Link>
             <Link to="/login" className="hover:text-cyan-400 transition-colors">تسجيل الدخول</Link>
          </div>
          <div className="text-center md:text-left w-full md:w-1/3 text-sm text-slate-600" dir="rtl">
             © {new Date().getFullYear()} SVU Community. جميع الحقوق محفوظة.
          </div>
       </div>
    </footer>
  );
};
