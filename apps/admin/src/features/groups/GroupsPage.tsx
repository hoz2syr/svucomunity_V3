import { GroupsManager } from './components/GroupsManager';

function GroupsPage() {
  return (
    <div className="p-8 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">إدارة المجموعات</h1>
        <p className="text-slate-400">المجموعات الدراسية في المنصة</p>
      </div>
      <GroupsManager />
    </div>
  );
}

export default GroupsPage;
