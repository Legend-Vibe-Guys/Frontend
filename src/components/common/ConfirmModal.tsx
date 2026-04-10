import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  subMessage?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  message,
  subMessage,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
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
      <div className="bg-white/95 backdrop-blur-md rounded-[24px] w-full max-w-[280px] p-6 pb-5 shadow-2xl mb-[15vh] animate-in slide-in-from-bottom-6 zoom-in-95 duration-500 ease-out border border-white/20 mx-4">
        <div className="flex flex-col items-center text-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-1">
            <AlertTriangle className="text-red-500 w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-slate-800 font-bold text-[16px] whitespace-pre-line leading-snug">
              {message}
            </p>
            {subMessage && (
              <p className="text-slate-500 text-[13px] mt-2 leading-relaxed">
                {subMessage}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors active:scale-[0.98]"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="flex-1 py-3 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition-colors active:scale-[0.98] shadow-sm shadow-red-500/20"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
