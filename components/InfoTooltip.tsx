import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QuestionMarkCircleIcon } from './icons/Icons';

interface InfoTooltipProps {
  text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [style, setStyle] = useState({ top: 0, left: 0, opacity: 0, placement: 'top' });
  const [isMounted, setIsMounted] = useState(false);
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const { innerWidth, innerHeight } = window;
      const margin = 8;

      let top, left;
      let placement = 'top';

      // --- Vertical Placement ---
      top = triggerRect.top - tooltipRect.height - margin;
      if (top < margin) {
        placement = 'bottom';
        top = triggerRect.bottom + margin;
      }
      
      if (top + tooltipRect.height > innerHeight - margin) {
          top = innerHeight - tooltipRect.height - margin;
      }

      // --- Horizontal Placement ---
      left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
      if (left < margin) {
        left = margin;
      } else if (left + tooltipRect.width > innerWidth - margin) {
        left = innerWidth - tooltipRect.width - margin;
      }
      
      setStyle({ top, left, opacity: 1, placement });
    } else {
      setStyle({ top: 0, left: 0, opacity: 0, placement: 'top' });
    }
  }, [isVisible]);
  
  const arrowClass = style.placement === 'top' 
    ? "absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-gray-800"
    : "absolute bottom-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-gray-800";

  return (
    <>
      <div 
        ref={triggerRef}
        className="relative inline-flex items-center ml-2"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 cursor-pointer" />
      </div>

      {isMounted && isVisible && document.body && createPortal(
        <div
          ref={tooltipRef}
          style={{ 
            top: `${style.top}px`, 
            left: `${style.left}px`,
            opacity: style.opacity
          }}
          className="fixed p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-[9999] w-48 transition-opacity pointer-events-none"
        >
          {text}
          <div className={arrowClass} />
        </div>,
        document.body
      )}
    </>
  );
};

export default InfoTooltip;