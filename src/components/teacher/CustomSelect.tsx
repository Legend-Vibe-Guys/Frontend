import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  emoji?: string;
}

interface CustomSelectProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  accentColor?: 'indigo' | 'emerald' | 'blue';
}

export function CustomSelect({ 
  label, 
  value, 
  options, 
  onChange, 
  placeholder = '선택해주세요',
  accentColor = 'indigo'
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const colorConfig = {
    indigo: {
      border: 'focus:border-indigo-400',
      ring: 'focus:ring-indigo-50/50',
      text: 'text-indigo-600',
      bg: 'bg-indigo-50',
      hover: 'hover:bg-indigo-50/50'
    },
    blue: {
      border: 'focus:border-blue-400',
      ring: 'focus:ring-blue-50/50',
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      hover: 'hover:bg-blue-50/50'
    }
  };

  const config = colorConfig[accentColor];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col min-w-0 relative" ref={containerRef}>
      <label className="text-[11px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{label}</label>
      
      {/* Trigger Button */}
      <div 
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => e.key === 'Enter' && setIsOpen(!isOpen)}
        className={`bg-white border ${isOpen ? config.border + ' ' + config.ring : 'border-slate-200'} rounded-2xl px-5 py-4 font-bold text-base outline-none w-full transition-all text-slate-700 shadow-sm flex items-center justify-between cursor-pointer group hover:border-slate-300`}
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : 'rotate-0'}`} 
          size={18} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-3xl shadow-2xl py-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          <div className="max-h-[240px] overflow-y-auto px-2 space-y-1">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer transition-all ${
                  value === option.value 
                    ? config.bg + ' ' + config.text
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="font-bold text-sm">{option.label}</span>
                {value === option.value && <Check size={16} className="shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
