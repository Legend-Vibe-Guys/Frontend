import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../../hooks';
import { ChevronLeft, Save, Trash2, Camera, Megaphone } from 'lucide-react';
import { PATH } from '../../router/Path';

export default function NoticeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notices, children: allChildren, updateNotice, deleteNotice } = useAppData();
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const notice = notices.find(n => n.id === id);

  useEffect(() => {
    if (notice) {
      setTitle(notice.title);
      setContent(notice.content);
    }
  }, [notice]);

  if (!notice) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500 mb-4">알림장을 찾을 수 없습니다.</p>
        <button 
          className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
          onClick={() => navigate(PATH.TEACHER.NOTICE)}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      await updateNotice(notice.id, { title, content });
      navigate(PATH.TEACHER.NOTICE);
    } catch (error) {
      console.error('Failed to update notice', error);
      alert('수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 이 알림장을 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    try {
      await deleteNotice(notice.id);
      navigate(PATH.TEACHER.NOTICE);
    } catch (error) {
      console.error('Failed to delete notice', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 pb-28 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-slate-900">알림장 수정</h2>
        <button
          onClick={handleDelete}
          disabled={isDeleting || isSaving}
          className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Child Info Header */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
            {notice.type === 'common' ? <Megaphone size={20} /> : '👶'}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {notice.type === 'common' ? '전체 공지' : '개별 알림장'}
            </p>
            <p className="text-sm font-black text-slate-800">
              {notice.type === 'common' 
                ? '모든 학부모님' 
                : `${notice.childName || allChildren.find(c => c.id === notice.childId)?.name || '알 수 없음'} 어린이`}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] font-bold text-blue-600">{notice.date}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden relative">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
           
           <div className="mb-6">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">제목</label>
             <input
               type="text"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               placeholder="알림장 제목"
               className="w-full text-lg font-black text-slate-900 outline-none border-b-2 border-slate-50 focus:border-blue-500 transition-all pb-2"
             />
           </div>

           <div>
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">내용</label>
             <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="내용을 입력하세요..."
               className="w-full min-h-[300px] text-sm text-slate-700 leading-relaxed outline-none resize-none bg-slate-50/50 rounded-2xl p-4 border border-transparent focus:border-slate-200 transition-all font-medium"
             />
           </div>

           {notice.photoUrl && (
             <div className="mt-6">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">첨부된 사진</label>
               <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-100">
                 <img src={notice.photoUrl} alt="Attached" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                   <button className="bg-white/90 p-2 rounded-xl text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-lg">
                     <Camera size={14} /> 사진 변경 (추후지원)
                   </button>
                 </div>
               </div>
             </div>
           )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving || isDeleting}
          className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-slate-800 disabled:bg-slate-400"
          style={{ boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
        >
          {isSaving ? (
            <span className="animate-pulse">저장 중...</span>
          ) : (
            <>
              <Save size={18} /> 수정사항 저장하기
            </>
          )}
        </button>
      </div>
    </div>
  );
}
