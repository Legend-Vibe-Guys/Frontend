import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../../hooks';
import { 
  ArrowLeft, 
  Megaphone, 
  User, 
  Calendar
} from 'lucide-react';
import { PATH } from '../../router/Path';
import { API_BASE } from '../../api/api';
import CommentSection from '../../components/common/CommentSection';
import ImageViewer from '../../components/common/ImageViewer';

const getFullImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

export default function ParentNoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notices, children } = useAppData();
  
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const notice = notices.find((n) => n.id === id);

  if (!notice) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <p className="text-slate-400 font-bold mb-4">알림장을 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate(PATH.PARENT.NOTICES)}
          className="px-6 py-2 bg-amber-500 text-white rounded-xl font-bold"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const images = notice.photoUrls && notice.photoUrls.length > 0 
    ? notice.photoUrls 
    : (notice.photoUrl && notice.photoUrl !== 'string' ? [notice.photoUrl] : []);

  return (
    <div className="min-h-screen p-6 pb-8 animate-fade-in max-w-[430px] mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="ml-4 text-xl font-black text-slate-900">알림장 상세</h2>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-xl border bg-amber-50 text-amber-600 border-amber-100`}>
            {notice.type === 'common' ? <Megaphone size={12} /> : <User size={12} />}
            {notice.type === 'common' 
              ? '어린이집 소식' 
              : `${notice.childName || children.find(c => c.id === notice.childId)?.name || '아이'} 알림장`}
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
    </div>
  );
}
