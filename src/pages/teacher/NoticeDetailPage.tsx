import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../../hooks';
import { 
  ArrowLeft, 
  Megaphone, 
  User, 
  Trash2, 
  Edit3,
  Calendar
} from 'lucide-react';
import { PATH } from '../../router/Path';
import { API_BASE } from '../../api/api';
import CommentSection from '../../components/common/CommentSection';
import ImageViewer from '../../components/common/ImageViewer';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';

const getFullImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notices, deleteNotice } = useAppData();
  
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: 'success' | 'error' }>({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const notice = notices.find((n) => n.id === id);

  if (!notice) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <p className="text-slate-400 font-bold mb-4">알림장을 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate(PATH.TEACHER.NOTICE_LIST)}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteNotice(notice.id);
      setToast({ isVisible: true, message: '알림장이 삭제되었습니다.', type: 'success' });
      setTimeout(() => navigate(PATH.TEACHER.NOTICE_LIST), 1500);
    } catch {
      alert('삭제에 실패했습니다.');
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const images = notice.photoUrls && notice.photoUrls.length > 0 
    ? notice.photoUrls 
    : (notice.photoUrl && notice.photoUrl !== 'string' ? [notice.photoUrl] : []);

  return (
    <div className="min-h-screen p-6 pb-8 animate-fade-in max-w-[430px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(PATH.TEACHER.NOTICE_EDIT.replace(':id', notice.id))}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-blue-500 shadow-sm border border-slate-100"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-500 shadow-sm border border-slate-100"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-xl border ${
            notice.type === 'common' 
              ? 'bg-blue-50 text-blue-600 border-blue-100' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            {notice.type === 'common' ? <Megaphone size={12} /> : <User size={12} />}
            {notice.type === 'common' ? '선생님 공통 알림장' : `${notice.childName || '아이'} 어린이 알림장`}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
            <Calendar size={12} />
            {notice.date}
          </span>
        </div>

        <h1 className="text-xl font-black text-slate-900 mb-4">{notice.title}</h1>
        <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-line mb-8">
          {notice.content}
        </p>

        {/* Photos */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {images.map((photo, index) => (
              <div
                key={index}
                className="aspect-square rounded-2xl overflow-hidden border border-slate-100 cursor-zoom-in group"
                onClick={() => {
                  setViewerImages(images.map(p => getFullImageUrl(p)));
                  setViewerIndex(index);
                }}
              >
                <img
                  src={getFullImageUrl(photo)}
                  alt={`Attached ${index}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Section */}
      <CommentSection noticeId={notice.id} />

      {/* Image Viewer */}
      {viewerImages.length > 0 && (
        <ImageViewer
          images={viewerImages}
          initialIndex={viewerIndex}
          onClose={() => setViewerImages([])}
        />
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="알림장 삭제"
        message="정말 삭제하시겠습니까?"
        subMessage="삭제된 알림장은 복구할 수 없습니다."
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {toast.isVisible && (
        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      )}
    </div>
  );
}
