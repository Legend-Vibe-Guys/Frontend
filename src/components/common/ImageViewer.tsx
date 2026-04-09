import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

interface ImageViewerProps {
  imageUrl: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function ImageViewer({ imageUrl, onClose, onPrev, onNext }: ImageViewerProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    // 스크롤 방지
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center text-white z-10">
        <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Image Preview</span>
        <button 
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Image */}
      <div className="relative w-full max-w-4xl max-h-[80vh] px-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img 
          src={imageUrl} 
          alt="Full Preview" 
          className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl animate-scale-up"
        />
        
        {/* Navigation (Optional) */}
        {onPrev && (
          <button 
            onClick={onPrev}
            className="absolute left-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all shadow-lg"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {onNext && (
          <button 
            onClick={onNext}
            className="absolute right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all shadow-lg"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      <div className="mt-8">
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
          Click anywhere to close
        </p>
      </div>
    </div>
  );
}
