import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { scrollToTop } from '../../utils/scroll';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  resetScrollKey?: any;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  resetScrollKey
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  const handleResetScroll = useCallback(() => {
    if (modalBodyRef.current) {
      scrollToTop(modalBodyRef.current, 'instant');
    }
    if (scrollContainerRef.current) {
      scrollToTop(scrollContainerRef.current, 'instant');
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      handleResetScroll();
      // Additional small tick to guarantee layout recalculations stay at top
      const timer = setTimeout(handleResetScroll, 15);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handleResetScroll]);

  // Reset scroll whenever step/tab/reset key changes
  useEffect(() => {
    if (isOpen && resetScrollKey !== undefined) {
      handleResetScroll();
      const timer = setTimeout(handleResetScroll, 15);
      return () => clearTimeout(timer);
    }
  }, [isOpen, resetScrollKey, handleResetScroll]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div ref={scrollContainerRef} className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div 
          className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full ${widthClasses[maxWidth]} border border-slate-200/80 animate-in fade-in zoom-in-95 duration-200`}
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-6">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div ref={modalBodyRef} className="p-6 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

