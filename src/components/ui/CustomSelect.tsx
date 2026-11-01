import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { CategoryIcon } from '../common/CategoryIcon';

export interface SelectOption {
  value: string | number;
  label: string;
  iconName?: string;
  icon?: string;
  category?: string;
  color?: string;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  showCategoryIcon?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  showCategoryIcon = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-black/60 border rounded-xl text-sm text-left flex items-center justify-between gap-2 transition cursor-pointer ${
          isOpen
            ? 'border-[#caa052] ring-1 ring-[#caa052]/30 shadow-lg shadow-black'
            : 'border-white/[0.08] hover:border-[#caa052]/40 text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {showCategoryIcon && selectedOption && (
            <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center shrink-0">
              <CategoryIcon
                category={selectedOption.category || selectedOption.label}
                iconName={selectedOption.iconName}
                color={selectedOption.color || '#caa052'}
                className="w-3.5 h-3.5"
              />
            </div>
          )}
          <span className="truncate font-medium text-zinc-100">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#caa052]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu (Theme Related Obsidian Glass & Gold Highlight) */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#0c0d14] border border-[#caa052]/35 rounded-2xl shadow-2xl shadow-black p-1.5 max-h-60 overflow-y-auto custom-gold-scrollbar animate-in fade-in slide-in-from-top-1 duration-150 backdrop-blur-xl">
          <div className="space-y-0.5">
            {options.map(option => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#caa052]/15 text-[#fce8bd] font-bold border border-[#caa052]/25'
                      : 'text-zinc-300 hover:bg-[#caa052]/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {showCategoryIcon && (
                      <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                        <CategoryIcon
                          category={option.category || option.label}
                          iconName={option.iconName}
                          color={option.color || '#caa052'}
                          className="w-3.5 h-3.5"
                        />
                      </div>
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#caa052] shrink-0 stroke-[2.5]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
