
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';

interface DatePickerProps {
  value: string; // YYYY-MM-DD or empty string
  onChange: (date: string) => void;
  className?: string;
  placeholder?: string;
}

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const DAYS_OF_WEEK = ['H', 'B', 'T', 'N', 'S', 'B', 'C']; // Hai, Ba, Tư, Năm, Sáu, Bảy, Chủ nhật

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, className, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Start the popup off-screen and invisible. This allows us to measure its dimensions
  // in useLayoutEffect without causing a flicker.
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      opacity: 0,
      zIndex: 9999,
      transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
      transform: 'scale(0.95)'
  });
  
  const getInitialViewDate = () => {
    try {
        if (value && !isNaN(new Date(value).getTime())) {
            return new Date(value);
        }
    } catch (e) { /* Invalid date string, fall through */ }
    return new Date();
  };
  
  const [viewDate, setViewDate] = useState(getInitialViewDate());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const selectedDate = value && !isNaN(new Date(value).getTime()) ? new Date(value) : null;
  if(selectedDate) selectedDate.setHours(0,0,0,0);
  
  const today = new Date();
  today.setHours(0,0,0,0);

  // Reset view date when opening or value changes
  useEffect(() => {
    if(isOpen) {
        setViewDate(getInitialViewDate());
    }
  }, [value, isOpen]);

  // Handle Click Outside to close the date picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
          wrapperRef.current && !wrapperRef.current.contains(target) &&
          popupRef.current && !popupRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Core positioning logic
  useLayoutEffect(() => {
    const updatePosition = () => {
        if (!isOpen || !wrapperRef.current || !popupRef.current) return;

        const triggerRect = wrapperRef.current.getBoundingClientRect();
        const popupRect = popupRef.current.getBoundingClientRect();
        const margin = 8;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = triggerRect.bottom + margin;
        let left = triggerRect.left;
        let transformOrigin = 'top left';

        // --- Vertical positioning ---
        // Check if there's not enough space below AND there IS enough space above
        if (triggerRect.bottom + popupRect.height + margin > viewportHeight && triggerRect.top > popupRect.height + margin) {
            top = triggerRect.top - popupRect.height - margin;
            transformOrigin = transformOrigin.replace('top', 'bottom');
        }

        // --- Horizontal positioning ---
        // Check if it overflows on the right
        if (triggerRect.left + popupRect.width > viewportWidth - margin) {
            left = triggerRect.right - popupRect.width;
            transformOrigin = transformOrigin.replace('left', 'right');
        }
        
        // Ensure it doesn't go off the left edge of the screen
        if (left < margin) {
            left = margin;
        }

        setPopupStyle(prev => ({
            ...prev,
            top: `${top}px`,
            left: `${left}px`,
            opacity: 1,
            transform: 'scale(1)',
            transformOrigin: transformOrigin
        }));
    };
    
    if (isOpen) {
        // We calculate position in the next frame to ensure the popup has been rendered
        // and its dimensions are available before making it visible.
        requestAnimationFrame(() => {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true); // Use capture phase
            window.addEventListener('resize', updatePosition);
        });
        
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    } else {
        // When closing, reset to the initial off-screen and invisible state
        setPopupStyle(prev => ({
            ...prev,
            opacity: 0,
            transform: 'scale(0.95)',
        }));
        // After transition, move it off-screen to avoid blocking anything
        setTimeout(() => {
             setPopupStyle(prev => ({ ...prev, top: '-9999px', left: '-9999px'}));
        }, 150);
    }
  }, [isOpen]);


  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${year}-${month}-${d}`);
    setIsOpen(false);
  };
  
  const handleTodayClick = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
    setIsOpen(false);
  };

  const handleClearClick = () => {
    onChange('');
    setIsOpen(false);
  }

  const changeMonth = (delta: number) => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };
  
  const getCalendarGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const startDayIndex = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    const days = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
        days.push(<div key={`prev-${i}`} className="text-center py-2 text-gray-400 dark:text-gray-500 text-xs">{prevMonthLastDay - i}</div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const isSelected = selectedDate && currentDate.getTime() === selectedDate.getTime();
        const isToday = currentDate.getTime() === today.getTime();

        let dayClass = "text-center py-2 cursor-pointer rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm";
        if (isSelected) {
            dayClass += " bg-blue-600 text-white font-bold hover:bg-blue-700";
        } else if (isToday) {
            dayClass += " bg-blue-100 dark:bg-blue-800/50 font-semibold text-blue-600 dark:text-blue-300";
        } else {
            dayClass += " text-gray-800 dark:text-gray-200";
        }

        days.push(
            <div key={day} className={dayClass} onClick={() => handleDateSelect(day)}>
                {day}
            </div>
        );
    }
    
    const totalCells = days.length;
    const remainingCells = (totalCells > 35 ? 42 : 35) - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
        days.push(<div key={`next-${i}`} className="text-center py-2 text-gray-400 dark:text-gray-500 text-xs">{i}</div>);
    }

    return days;
  };

  const formattedValue = value && !isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
  
  return (
    <>
    <div className="relative" ref={wrapperRef}>
      <div className="relative cursor-pointer" onClick={() => setIsOpen(p => !p)}>
        <input
          type="text"
          readOnly
          value={formattedValue}
          className={`${className} cursor-pointer`}
          placeholder={placeholder || 'dd/mm/yyyy'}
        />
        <CalendarIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
    {createPortal(
        <div 
          ref={popupRef}
          style={popupStyle}
          className="w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex justify-between items-center mb-4">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><ChevronLeftIcon className="w-5 h-5" /></button>
            <div className="font-bold text-gray-800 dark:text-gray-200">{`${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`}</div>
            <button type="button" onClick={() => changeMonth(1)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><ChevronRightIcon className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs text-center font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
            {DAYS_OF_WEEK.map((day, i) => <div key={i} className="py-1">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getCalendarGrid()}
          </div>
          <div className="flex justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={handleClearClick} className="text-xs font-medium text-blue-600 hover:underline px-2 py-1 rounded">Xóa</button>
            <button type="button" onClick={handleTodayClick} className="text-xs font-bold text-blue-600 hover:underline px-2 py-1 rounded">Hôm nay</button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default DatePicker;
