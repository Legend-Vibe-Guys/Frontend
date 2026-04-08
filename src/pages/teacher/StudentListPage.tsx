import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../hooks';
import { PATH } from '../../router/Path';
import { ChevronRight } from 'lucide-react';
import { API_BASE } from '../../api/api';

const getFullImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

export default function StudentListPage() {
  const { children } = useAppData();
  const navigate = useNavigate();

  return (
    <div className="p-5 pb-28 animate-fade-in">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900">원아 관리</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          총 <span className="text-blue-500 font-bold">{children.length}명</span>의 원아 카드를 눌러 상세 기록을 확인하세요.
        </p>
      </div>

      {/* 원아 카드 그리드 */}
      <div className="grid grid-cols-3 gap-3">
        {children.map((child) => (
          <div
            key={child.id}
            onClick={() => navigate(PATH.TEACHER.STUDENT_DETAIL.replace(':id', child.id))}
            className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col items-center gap-3 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 active:scale-95 transition-all group cursor-pointer"
          >
            {/* 아바타 */}
            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:from-blue-100 group-hover:to-indigo-200 transition-colors overflow-hidden">
              {child.profileImageUrl ? (
                <img src={getFullImageUrl(child.profileImageUrl)} alt={child.name} className="w-full h-full object-cover" />
              ) : (
                child.profileEmoji
              )}
            </div>

            {/* 이름 */}
            <span className="text-sm font-black text-slate-800 text-center">{child.name}</span>

            {/* 뱃지 */}
            <div className="w-full bg-blue-50 group-hover:bg-blue-600 text-blue-500 group-hover:text-white text-[10px] font-bold text-center flex items-center justify-center gap-1 py-1.5 rounded-xl transition-colors">
              기록 보기 <ChevronRight size={10} strokeWidth={3} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
