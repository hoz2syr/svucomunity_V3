import CourseManager from './components/CourseManager';

function CoursesPage() {
  return (
    <div className="p-8 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">إدارة المقررات</h1>
        <p className="text-slate-400">إضافة وتعديل وحذف المقررات الدراسية</p>
      </div>
      <CourseManager />
    </div>
  );
}

export default CoursesPage;
