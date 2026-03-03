import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from './icons/Icons'; // Đảm bảo đường dẫn này đúng với dự án của bạn

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | string[];
  onChange: (value: any) => void;
  className?: string;
  isMulti?: boolean;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, className = '', isMulti = false, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({
      opacity: 0,
      pointerEvents: 'none'
  });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => {
    if (isMulti) return null;
    return options.find(option => option.value === value) || options.find(o => o.value === '') || options[0];
  }, [options, value, isMulti]);

  const selectedOptions = useMemo(() => {
    if (!isMulti || !Array.isArray(value)) return [];
    return options.filter(opt => value.includes(opt.value));
  }, [options, value, isMulti]);
  
  // --- PHẦN ĐÃ SỬA LỖI ---
  useLayoutEffect(() => {
    const updatePosition = (event?: Event) => {
      // Logic mới: Nếu sự kiện cuộn phát ra từ chính menu dropdown, ta bỏ qua không tính toán lại vị trí
      if (
        event && 
        event.type === 'scroll' && 
        dropdownRef.current && 
        dropdownRef.current.contains(event.target as Node)
      ) {
        return;
      }

      if (isOpen && wrapperRef.current && dropdownRef.current) {
        const triggerRect = wrapperRef.current.getBoundingClientRect();
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        const margin = 8;
        let top;
        let transformOrigin = 'top';

        if (spaceBelow < dropdownRect.height + 20 && spaceAbove > dropdownRect.height) {
          top = triggerRect.top - dropdownRect.height - margin;
          transformOrigin = 'bottom';
        } else {
          top = triggerRect.bottom + margin;
        }

        setPositionStyle({
            position: 'fixed',
            top: `${top}px`,
            left: `${triggerRect.left}px`,
            width: `${triggerRect.width}px`,
            opacity: 1,
            transform: 'scale(1)',
            transformOrigin: transformOrigin,
            transition: 'opacity 150ms ease-in-out, transform 150ms ease-in-out',
            zIndex: 9999,
            pointerEvents: 'auto'
        });
      }
    };
    
    if (isOpen) {
        requestAnimationFrame(() => updatePosition());
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
    } else {
        setPositionStyle(prev => ({ ...prev, opacity: 0, transform: 'scale(0.95)', pointerEvents: 'none' }));
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);
  // -----------------------

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (
            isOpen &&
            wrapperRef.current && !wrapperRef.current.contains(event.target as Node) &&
            dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (isMulti) {
        const currentValue = Array.isArray(value) ? [...value] : [];
        const index = currentValue.indexOf(optionValue);
        if (index > -1) {
            currentValue.splice(index, 1);
        } else {
            currentValue.push(optionValue);
        }
        onChange(currentValue);
    } else {
        onChange(optionValue);
        setIsOpen(false);
    }
  };

  const displayLabel = useMemo(() => {
    if (isMulti) {
        if (selectedOptions.length === 0) return 'Chọn...';
        if (selectedOptions.length > 2) return `${selectedOptions.length} lựa chọn`;
        return selectedOptions.map(o => o.label).join(', ');
    }
    return selectedOption?.label || 'Chọn...';
  }, [isMulti, selectedOption, selectedOptions]);

  const DropdownPortal = () => createPortal(
    <div 
        ref={dropdownRef} 
        style={positionStyle}
    >
        <ul className="py-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-600 max-h-60 overflow-y-auto">
          {options.map(option => (
            <li
              key={option.value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(option.value)}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center ${
                (isMulti && Array.isArray(value) && value.includes(option.value)) || (!isMulti && value === option.value)
                ? 'bg-blue-600 text-white font-semibold' 
                : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {isMulti && (
                  <input
                      type="checkbox"
                      checked={Array.isArray(value) && value.includes(option.value)}
                      readOnly
                      className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
              )}
              {option.label}
            </li>
          ))}
        </ul>
    </div>,
    document.body
  );

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed disabled:text-gray-500 dark:disabled:text-gray-400"
        disabled={disabled}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDownIcon className={`w-5 h-5 ml-2 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <DropdownPortal />}
    </div>
  );
};

export default CustomSelect;