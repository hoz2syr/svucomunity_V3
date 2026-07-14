import { useParams } from 'react-router-dom';
import { SubjectDetailView } from '../../components/SubjectDetailView';

export function SubjectDetailPage() {
  const { courseCode } = useParams<{ courseCode: string }>();

  if (!courseCode) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>رمز المادة غير موجود.</p>
      </div>
    );
  }

  return <SubjectDetailView courseCode={courseCode.toUpperCase()} />;
}
