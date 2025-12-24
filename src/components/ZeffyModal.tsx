'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ZeffyModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  zeffyUrl: string;
}

export function ZeffyModal({ isOpen, onClose, eventTitle, zeffyUrl }: ZeffyModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Track analytics events
  const logEvent = useCallback((eventName: string) => {
    if (typeof window !== 'undefined') {
      if (window.dataLayer) {
        window.dataLayer.push({ event: eventName });
      }
      console.log(`[Analytics] ${eventName}`);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleClose = useCallback(() => {
    logEvent('ticket_modal_close');
    onClose();
  }, [onClose, logEvent]);

  useEffect(() => {
    if (!isOpen) return;

    // Lazy load the embed on first open
    if (!hasLoaded) {
      setHasLoaded(true);
    }

    // Store the element that triggered the modal
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Log modal open event
    logEvent('ticket_modal_open');

    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the close button when modal opens
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    // Handle Esc key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEsc);
      
      // Return focus to trigger element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, logEvent, handleClose, hasLoaded]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab as EventListener);
    return () => modal.removeEventListener('keydown', handleTab as EventListener);
  }, [isOpen]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'blur(2px)' : 'none'
      }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
      data-testid="ticket-modal"
    >
      <div
        ref={modalRef}
        className="max-w-[900px] w-[92vw] rounded-lg shadow-xl ring-1 ring-black/5 p-6 relative bg-white"
      >
        {/* Visually hidden title for a11y */}
        <h2 id="ticket-modal-title" className="sr-only">
          Purchase Tickets for {eventTitle}
        </h2>

        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 z-10"
          aria-label="Close ticket purchase modal"
        >
          <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center border-b border-neutral-200 pb-6">
          <img 
            src="/logo.png" 
            alt="Ukiah Senior Center" 
            className="w-12 h-12 mx-auto mb-2 object-contain"
          />
          <h3 className="text-lg font-['Jost',sans-serif] font-bold text-[#427d78]">
            {eventTitle}
          </h3>
        </div>

        {/* Tip Notice */}
        <div className="mb-6 pb-6 border-b border-neutral-200">
          <div className="bg-red-50 border border-red-400 rounded" style={{ padding: '8px 12px' }}>
            <p className="text-xs text-red-900 font-['Bitter',serif] text-center" style={{ marginBottom: '6px', lineHeight: '1.4' }}>
              <strong>⚠️ Set Zeffy Tip to $0</strong> so you don&apos;t pay any fees.
            </p>
            <div className="bg-white rounded border border-red-300 flex justify-center" style={{ padding: '6px', overflow: 'hidden' }}>
              <img
                src="/zero_tip.png"
                alt="Set Zeffy tip to zero"
                className="rounded"
                style={{ 
                  width: '300px',
                  maxWidth: '100%', 
                  height: 'auto', 
                  display: 'block'
                }}
              />
            </div>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="relative min-h-[600px] rounded-lg overflow-hidden bg-gray-50">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-neutral-200 rounded-full animate-spin" style={{ borderTopColor: '#427d78' }}></div>
                <p className="text-sm text-neutral-600 font-['Bitter',serif]">Loading ticket form...</p>
              </div>
            </div>
          )}
          {hasLoaded && (
            <iframe
              src={zeffyUrl}
              className="w-full h-full border-0"
              style={{ minHeight: '600px' }}
              title={`Zeffy ticketing form for ${eventTitle}`}
              onLoad={() => setIsLoading(false)}
              allow="payment"
              data-testid="zeffy-frame"
            />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Type declaration for dataLayer
declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}
