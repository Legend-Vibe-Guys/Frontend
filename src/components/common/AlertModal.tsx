import { CheckCircle, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function AlertModal({ isOpen, message, type = 'info', onClose }: AlertModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="bg-white/95 backdrop-blur-md rounded-[24px] w-full max-w-[280px] overflow-hidden shadow-2xl mb-[15vh] animate-in slide-in-from-bottom-6 zoom-in-95 duration-500 ease-out border border-white/20">
        <div className="p-6 pb-5 flex flex-col items-center text-center gap-4">
          {type === 'success' && (
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="text-emerald-500 w-6 h-6" strokeWidth={2.5} />
            </div>
          )}
          {type === 'error' && (
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="text-red-500 w-6 h-6" strokeWidth={2.5} />
            </div>
          )}
          {type === 'info' && (
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <AlertCircle className="text-blue-500 w-6 h-6" strokeWidth={2.5} />
            </div>
          )}
          
          <p className="text-slate-800 font-bold text-[15px] whitespace-pre-line leading-relaxed">
            {message}
          </p>
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 text-white font-bold text-[14px] rounded-xl hover:bg-slate-700 transition-colors active:scale-[0.98] shadow-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
