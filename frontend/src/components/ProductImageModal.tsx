import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Share2, ShieldCheck } from 'lucide-react';

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  productName?: string;
  brand?: string;
}

const ProductImageModal: React.FC<ProductImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  productName,
  brand,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 3.5));
  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName || 'Product Image',
          text: `Check out ${productName || 'this product'} verified by Authentiks`,
          url: imageUrl,
        });
      } catch (err) {
        console.log('Share dismissed', err);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col justify-between bg-black/95 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Controls Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 text-white z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col pr-2">
          {brand && (
            <span className="text-[11px] font-bold tracking-widest text-blue-400 uppercase">
              {brand}
            </span>
          )}
          {productName && (
            <h3 className="text-[15px] sm:text-[17px] font-bold text-white leading-tight line-clamp-1">
              {productName}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          {navigator.share && (
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-colors text-white"
              aria-label="Share Image"
            >
              <Share2 size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center transition-all text-white border border-white/20 shadow-lg"
            aria-label="Close"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Main Image View Area */}
      <div
        className="flex-1 flex items-center justify-center p-4 relative overflow-hidden select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="relative max-w-full max-h-[75vh] flex items-center justify-center transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (scale === 1) handleZoomIn();
            else handleResetZoom();
          }}
        >
          <img
            src={imageUrl}
            alt={productName || 'Full Product View'}
            className="max-h-[72vh] max-w-[90vw] object-contain rounded-xl drop-shadow-[0_10px_35px_rgba(255,255,255,0.12)]"
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="p-4 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        {/* Authentiks Verified Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
          <ShieldCheck size={16} className="text-[#3B82F6]" />
          <span className="text-[11px] font-bold text-white tracking-wide">
            Authentiks Verified
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 p-1 rounded-full shadow-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            disabled={scale <= 1}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-95 disabled:opacity-30 transition-all"
            aria-label="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          
          <span className="text-[11px] font-extrabold text-white px-2 min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            disabled={scale >= 3.5}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-95 disabled:opacity-30 transition-all"
            aria-label="Zoom In"
          >
            <ZoomIn size={18} />
          </button>

          {scale !== 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResetZoom();
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all border-l border-white/10 ml-0.5"
              aria-label="Reset Zoom"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImageModal;
