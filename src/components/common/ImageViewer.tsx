import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function ImageViewer({ images, initialIndex = 0, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, images.length]);

  const content = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        {/* Main Image Wrapper */}
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <img 
            key={currentIndex}
            src={images[currentIndex]} 
            alt={`Preview ${currentIndex + 1}`} 
            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg"
          />

          {/* Close Button - positioned inside the top right of the image area */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 border border-white/20 transition-all z-[10000] backdrop-blur-sm shadow-lg active:scale-90"
          >
            <X size={20} />
          </button>

          {/* Page Indicator */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 text-white text-[10px] font-bold rounded-full backdrop-blur-sm tracking-widest border border-white/10 uppercase z-[10000]">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Navigation Arrows (Visible always, but better styling for mobile) */}
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 sm:left-6 w-12 h-12 bg-black/20 sm:bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all border border-white/10 z-[10000] backdrop-blur-sm active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 sm:right-6 w-12 h-12 bg-black/20 sm:bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all border border-white/10 z-[10000] backdrop-blur-sm active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
