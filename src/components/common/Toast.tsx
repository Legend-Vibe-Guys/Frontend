import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  isVisible: boolean;
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ isVisible, message, type = 'success', onClose, duration = 2000 }: ToastProps) {
  const [isRendered, setIsRendered] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  // 1. Props 변화에 따른 마운트 상태 동기화 (렌더링 도중 수행하여 ESLint 에러 방지)
  if (isVisible && !isRendered) {
    setIsRendered(true);
  }

  // 2. 애니메이션 및 타이머 제어
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isRendered) return;

    let enterTimer: ReturnType<typeof setTimeout>;
    let closeTimer: ReturnType<typeof setTimeout>;
    let exitTimer: ReturnType<typeof setTimeout>;
    let animExitTimer: ReturnType<typeof setTimeout>;

    if (isVisible) {
      // 마운트 직후 애니메이션 트리거 (비동기)
      enterTimer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);

      closeTimer = setTimeout(() => {
        handleClose();
      }, duration);
    } else {
      // 애니메이션 종료 시작 (비동기 처리로 린트 경고 방지)
      animExitTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 0);
      
      // 애니메이션 완료 후 언마운트
      exitTimer = setTimeout(() => {
        setIsRendered(false);
      }, 200);
    }

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(closeTimer);
      clearTimeout(exitTimer);
      clearTimeout(animExitTimer);
    };
  }, [isVisible, isRendered, duration, handleClose]);

  if (!isRendered) return null;

  return createPortal(
    <div 
      className={`fixed top-12 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-200 ease-out transform
        ${isAnimating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}
      `}
      style={{ transitionDuration: '200ms' }}
    >
      <div className="bg-slate-800/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-slate-900/20 flex items-center gap-3 border border-slate-700/50">
        {type === 'success' ? (
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
        ) : (
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" strokeWidth={2.5} />
        )}
        <span className="text-[14.5px] font-bold whitespace-nowrap tracking-tight">{message}</span>
      </div>
    </div>,
    document.body
  );
}
