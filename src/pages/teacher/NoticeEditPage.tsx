import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../../hooks';
import { ChevronLeft, Save, Trash2, Camera, Megaphone } from 'lucide-react';
import { PATH } from '../../router/Path';
import { API_BASE } from '../../api/api';

export default function NoticeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notices, children: allChildren, updateNotice, deleteNotice } = useAppData();
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const notice = notices.find(n => n.id === id);

  useEffect(() => {
    if (notice) {
      setTitle(notice.title);
      setContent(notice.content);
      // Initialize photoUrls from array or fallback to single string
      setPhotoUrls(notice.photoUrls || (notice.photoUrl ? [notice.photoUrl] : []));
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewPhotoFiles(prev => [...prev, ...files]);
      const previews = files.map(file => URL.createObjectURL(file));
      setNewPhotoPreviews(prev => [...prev, ...previews]);
    }
  };

  const removeExistingPhoto = (index: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      const { uploadAPI } = await import('../../api/api');
      const finalPhotoUrls = [...photoUrls];

      // Sequential upload for new photos
      for (const file of newPhotoFiles) {
        const res = await uploadAPI.file(file);
        if (res.success && res.url) {
          finalPhotoUrls.push(res.url);
        }
      }

      await updateNotice(notice.id, { 
        title, 
        content, 
        photoUrls: finalPhotoUrls,
        photoUrl: finalPhotoUrls[0] || '' // Backward compatibility
      });
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

  const getFullImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
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

            <div className="mt-8 border-t border-slate-50 pt-6">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block ml-1">사진 관리 ({photoUrls.length + newPhotoFiles.length}장)</label>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Existing Photos */}
                {photoUrls.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative rounded-2xl overflow-hidden aspect-video border border-slate-100 group">
                    <img src={getFullImageUrl(url)} alt="Existing" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => removeExistingPhoto(idx)}
                        className="bg-red-500 text-white p-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                      >
                        <Trash2 size={14} /> 삭제
                      </button>
                    </div>
                  </div>
                ))}

                {/* New Photo Previews */}
                {newPhotoPreviews.map((preview, idx) => (
                  <div key={`new-${idx}`} className="relative rounded-2xl overflow-hidden aspect-video border border-blue-100 bg-blue-50/30 group">
                    <img src={preview} alt="New" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">New</div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => removeNewPhoto(idx)}
                        className="bg-red-500 text-white p-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                      >
                        <Trash2 size={14} /> 취소
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Photo Button */}
                <label className="flex flex-col items-center justify-center gap-2 aspect-video border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all font-semibold text-slate-400 group">
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotoUpload} />
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <Camera size={20} />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider">사진 추가</span>
                </label>
              </div>
            </div>
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
