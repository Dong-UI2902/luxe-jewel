'use client';

import { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Props {
  images: string[];
  initialIndex: number;
  name: string;
  onClose: () => void;
}

export default function ProductImageModal({ images, initialIndex, name, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const changeImage = (direction: number) => {
    setIndex((current) => (current + direction + images.length) % images.length);
    setZoom(1);
    viewportRef.current?.scrollTo(0, 0);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Ảnh sản phẩm ${name}`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-auto h-[100dvh] max-h-full w-full max-w-5xl bg-white p-0 text-charcoal backdrop:bg-black/70 sm:h-[90dvh]"
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-luxury-border p-3">
          <span className="text-sm" aria-live="polite">
            {index + 1} / {images.length} · {Math.round(zoom * 100)}%
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Thu nhỏ ảnh"
              disabled={zoom === 1}
              onClick={() => setZoom((value) => Math.max(1, value - 0.5))}
              className="flex h-11 w-11 items-center justify-center disabled:opacity-30"
            >
              <Icon name="MinusIcon" size={20} />
            </button>
            <button
              type="button"
              aria-label="Phóng to ảnh"
              disabled={zoom === 3}
              onClick={() => setZoom((value) => Math.min(3, value + 0.5))}
              className="flex h-11 w-11 items-center justify-center disabled:opacity-30"
            >
              <Icon name="PlusIcon" size={20} />
            </button>
            <button
              type="button"
              aria-label="Đóng ảnh sản phẩm"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center"
            >
              <Icon name="XMarkIcon" size={24} />
            </button>
          </div>
        </div>
        <div
          ref={viewportRef}
          className={`min-h-0 flex-1 select-none overflow-auto overscroll-contain ${
            zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
          }`}
          onPointerDown={(event) => {
            if (event.pointerType !== 'mouse' || event.button !== 0 || zoom <= 1) return;
            event.preventDefault();
            const viewport = event.currentTarget;
            viewport.setPointerCapture(event.pointerId);
            dragRef.current = {
              pointerId: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              scrollLeft: viewport.scrollLeft,
              scrollTop: viewport.scrollTop,
            };
            setIsDragging(true);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag || drag.pointerId !== event.pointerId) return;
            event.currentTarget.scrollLeft = drag.scrollLeft - (event.clientX - drag.x);
            event.currentTarget.scrollTop = drag.scrollTop - (event.clientY - drag.y);
          }}
          onPointerUp={(event) => {
            if (dragRef.current?.pointerId !== event.pointerId) return;
            event.currentTarget.releasePointerCapture(event.pointerId);
            dragRef.current = null;
            setIsDragging(false);
          }}
          onPointerCancel={() => {
            dragRef.current = null;
            setIsDragging(false);
          }}
          onLostPointerCapture={() => {
            dragRef.current = null;
            setIsDragging(false);
          }}
        >
          <div className="relative" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
            <AppImage
              key={images[index]}
              src={images[index]}
              alt={name}
              fill
              style={{ objectFit: 'contain' }}
              sizes="100vw"
              unoptimized
              draggable={false}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-luxury-border p-3">
          <button
            type="button"
            aria-label="Ảnh trước"
            disabled={images.length < 2}
            onClick={() => changeImage(-1)}
            className="flex h-11 w-11 items-center justify-center disabled:opacity-30"
          >
            <Icon name="ChevronLeftIcon" size={20} />
          </button>
          <p className="text-center text-xs text-luxury-muted">
            Dùng + / − để zoom, vuốt hoặc giữ chuột kéo ảnh để xem chi tiết
          </p>
          <button
            type="button"
            aria-label="Ảnh tiếp theo"
            disabled={images.length < 2}
            onClick={() => changeImage(1)}
            className="flex h-11 w-11 items-center justify-center disabled:opacity-30"
          >
            <Icon name="ChevronRightIcon" size={20} />
          </button>
        </div>
      </div>
    </dialog>
  );
}
