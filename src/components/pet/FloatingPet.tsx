'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePet } from './usePet';
import { getStageConfig } from './stages';
import { PetGalleryModal } from './PetGalleryModal';
import './pet.css';

const STORAGE_KEY = 'vitudy_pet_position_v1';
const DRAG_THRESHOLD = 6; // Dưới 6px tính là Tap/Click, trên 6px tính là Kéo

export const FloatingPet: React.FC = () => {
  const { status, loading, checkin, isCheckingIn, evolutionModalData, closeEvolutionModal } = usePet();

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dragStartRef = useRef<{ pointerX: number; pointerY: number; petX: number; petY: number } | null>(null);
  const hasMovedRef = useRef(false);
  const [petSize, setPetSize] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 64 : 80));

  const stageConfig = useMemo(() => {
    return getStageConfig(status?.stage || 1);
  }, [status?.stage]);

  // Khởi tạo vị trí ban đầu từ localStorage hoặc góc phải màn hình (tránh khu vực Toolkit / Minimap đáy)
  useEffect(() => {
    setMounted(true);
    const isMobile = window.innerWidth < 640;
    const currentSize = isMobile ? 64 : 80;
    setPetSize(currentSize);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          // Kiểm tra nếu vị trí cũ bị chèn vào góc dưới thì dịch lên
          const safeY = Math.min(parsed.y, window.innerHeight - currentSize - (isMobile ? 90 : 120));
          setPosition({ x: parsed.x, y: Math.max(70, safeY) });
          return;
        }
      }
    } catch {}

    const defaultX = typeof window !== 'undefined' ? Math.max(14, window.innerWidth - currentSize - 12) : 280;
    // Đặt Pet ở tầm 35% - 40% chiều cao màn hình (nửa trên), cách xa góc dưới bên phải
    const defaultY = typeof window !== 'undefined' ? Math.max(90, Math.floor(window.innerHeight * 0.38)) : 220;
    setPosition({ x: defaultX, y: defaultY });
  }, []);

  // Đảm bảo vị trí luôn nằm trong viewport khi thay đổi kích thước cửa sổ
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      const currentSize = isMobile ? 64 : 80;
      setPetSize(currentSize);

      setPosition((prev) => {
        if (!prev) return null;
        const maxX = window.innerWidth - currentSize - 12;
        const maxY = window.innerHeight - currentSize - (isMobile ? 90 : 120);
        return {
          x: Math.min(Math.max(12, prev.x), Math.max(12, maxX)),
          y: Math.min(Math.max(70, prev.y), Math.max(70, maxY)),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Xử lý kéo thả bằng Pointer Events (chuột & cảm ứng)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!position) return;
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      petX: position.x,
      petY: position.y,
    };
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;

    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      hasMovedRef.current = true;
    }

    const newX = dragStartRef.current.petX + dx;
    const newY = dragStartRef.current.petY + dy;

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current || !position) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const wasJustTap = !hasMovedRef.current;
    dragStartRef.current = null;
    setIsDragging(false);

    // Snap vào mép trái hoặc mép phải màn hình gần nhất
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isMobile = screenWidth < 640;
    const paddingX = 12;
    const paddingY = 70;
    const bottomReserve = isMobile ? 90 : 120;

    const snapX = position.x + petSize / 2 < screenWidth / 2 ? paddingX : screenWidth - petSize - paddingX;
    const clampedY = Math.min(Math.max(paddingY, position.y), screenHeight - petSize - bottomReserve);

    const finalPos = { x: snapX, y: clampedY };
    setPosition(finalPos);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPos));
    } catch {}

    // Nếu chỉ là Tap (chạm mà không kéo)
    if (wasJustTap) {
      handleTap();
    }
  };

  const handleTap = async () => {
    if (!status) return;

    if (!status.checked_in_today) {
      // Đang ngủ -> Bừng tỉnh, điểm danh tăng streak
      setIsWakingUp(true);
      await checkin();
      setTimeout(() => {
        setIsWakingUp(false);
      }, 700);
    } else {
      // Đã thức -> Mở Bộ sưu tập (Gallery)
      setIsGalleryOpen(true);
    }
  };

  // Tránh flash sai ảnh khi đang nạp dữ liệu ban đầu
  if (!mounted || loading || !status || !position) {
    return null;
  }

  const isAsleep = !status.checked_in_today;
  const currentImageSrc = isAsleep && !isWakingUp ? stageConfig.sleepSrc : stageConfig.awakeSrc;

  return (
    <>
      {/* Vùng Pet nổi - wrapper có pointer-events-none để tuyệt đối không chặn click xung quanh */}
      <div
        className="fixed inset-0 pointer-events-none z-35 overflow-hidden select-none font-sans"
        aria-hidden="false"
        style={{
          background: 'transparent',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
            touchAction: 'none',
            background: 'transparent',
            boxShadow: 'none',
            border: 'none',
            outline: 'none',
            padding: 0,
            WebkitTapHighlightColor: 'transparent',
          }}
          className="absolute top-0 left-0 pointer-events-auto cursor-grab active:cursor-grabbing flex flex-col items-center group bg-transparent border-0 shadow-none outline-none p-0"
          title={isAsleep ? 'Bấm để đánh thức và điểm danh hôm nay' : 'Bấm để xem bộ sưu tập'}
        >
          {/* Vỏ Pet & Animation Container — Kích thước responsive không đè lên màn hình */}
          <div
            className={`relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-transparent border-0 shadow-none outline-none p-0 ${
              isWakingUp
                ? 'pet-wake-animation'
                : isAsleep
                ? 'pet-idle-sleep'
                : 'pet-idle-awake'
            }`}
            style={{
              background: 'transparent',
              boxShadow: 'none',
              border: 'none',
              outline: 'none',
              padding: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <img
              src={currentImageSrc}
              alt={stageConfig.name}
              draggable={false}
              style={{
                background: 'transparent',
                boxShadow: 'none',
                border: 'none',
                outline: 'none',
                display: 'block',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))',
                WebkitTapHighlightColor: 'transparent',
                ...({ WebkitUserDrag: 'none' } as any),
              }}
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Chữ Zzz bay lơ lửng khi đang ngủ */}
            {isAsleep && !isWakingUp && (
              <>
                <span className="pet-zzz-bubble pet-zzz-1">z</span>
                <span className="pet-zzz-bubble pet-zzz-2">Z</span>
              </>
            )}

            {/* Spinner nhỏ khi đang gọi điểm danh */}
            {isCheckingIn && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-2xs rounded-full flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#E0562D] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Chúc mừng Tiến Hóa (Evolution Modal) */}
      {evolutionModalData && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans"
          onClick={closeEvolutionModal}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-orange-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-32 h-32 mx-auto my-2 flex items-center justify-center pet-evolve-animation">
              <img
                src={getStageConfig(evolutionModalData.newStage).awakeSrc}
                alt="Tiến hóa thành công"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-2">Tiến Hóa Cấp Mới!</h3>
            <p className="text-sm text-slate-600 mt-1">
              Thú cưng của Sếp đã tiến hóa thành <strong>{getStageConfig(evolutionModalData.newStage).name}</strong>.
            </p>
            <button
              type="button"
              onClick={closeEvolutionModal}
              className="mt-6 w-full py-3 bg-[#E0562D] hover:bg-[#c9451e] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Tuyệt vời!
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Bộ sưu tập */}
      <PetGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        status={status}
      />
    </>
  );
};
