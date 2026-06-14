import { StatsGrid } from './components/StatsCard';

function DashboardPage() {
  return (
    <div className="p-8 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">لوحة التحكم</h1>
        <p className="text-slate-400">نظرة عامة على إحصائيات المنصة</p>
      </div>
      <StatsGrid refreshInterval={60000} />
    </div>
  );
}

export default DashboardPage;
