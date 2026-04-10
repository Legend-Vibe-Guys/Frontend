import { CheckCircle2 } from 'lucide-react';
import type { Child } from '../../types';
import { ChildAvatar } from '../common/ChildAvatar';

interface ChildListGridProps {
  childrenData: Child[];
  onChildClick: (childId: string) => void;
  checkCompletion: (childId: string) => boolean;
  completedLabel?: string;
}

export function ChildListGrid({ 
  childrenData, 
  onChildClick, 
  checkCompletion, 
  completedLabel = '완료' 
}: ChildListGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {childrenData.map((child) => {
        const isCompleted = checkCompletion(child.id);
        return (
          <button
            key={child.id}
            onClick={() => onChildClick(child.id)}
            className={`relative border rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 ${
              isCompleted 
                ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300' 
                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
            }`}
          >
            {isCompleted && (
              <div className="absolute top-2.5 right-2.5 flex items-center justify-center w-5 h-5 bg-emerald-500 rounded-full text-white shadow-sm ring-2 ring-white">
                <CheckCircle2 size={12} strokeWidth={3} />
              </div>
            )}
            
            <div className={`w-14 h-14 p-1 rounded-full transition-colors shadow-inner ${isCompleted ? 'bg-white' : 'bg-slate-50'}`}>
              <ChildAvatar 
                name={child.name}
                profileImageUrl={child.profileImageUrl}
                profileEmoji={child.profileEmoji}
                className="w-full h-full rounded-full"
                emojiClassName="text-3xl"
              />
            </div>
            
            <span className={`font-bold text-sm ${isCompleted ? 'text-emerald-900' : 'text-slate-700'}`}>
              {child.name}
            </span>
            
            {isCompleted && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full mt-0.5">
                {completedLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
