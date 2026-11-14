'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DeskItem } from '@/types/studyspace';
import { ArtboardStroke, ArtboardImageLayer, SavedDrawingAsset } from '@/types/boardgame';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useDeskItemInteraction } from '@/hooks/useDeskItemInteraction';
import { GameCabinetStorage } from '@/services/GameCabinetStorage';
import {
  PenTool,
  Paintbrush,
  Minus,
  Square,
  Circle,
  Eraser,
  BoxSelect,
  ImagePlus,
  Save,
  Crosshair,
  Undo2,
  Redo2,
  Trash2,
  FolderOpen,
  Check,
  Sparkles,
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';

interface FourCornerArtboardProps {
  item: DeskItem;
  isSelected: boolean;
}

const PALETTE = ['#0f172a', '#E0562D', '#dc2626', '#2563eb', '#16a34a', '#eab308', '#9333ea', '#ec4899', '#ffffff'];

export const FourCornerArtboard = React.memo(function FourCornerArtboard({
  item,
  isSelected,
}: FourCornerArtboardProps) {
  const { updateArtboard, removeDeskItem, addSticker, transform } = useStudySpace();
  const w = item.width || 520;
  const h = item.height || 440;

  const initialAsset: SavedDrawingAsset = item.artboardData || {
    id: item.id,
    name: item.title || 'Bản vẽ mới',
    dataUrl: '',
    strokes: [],
    images: [],
    backgroundColor: '#ffffff',
    width: w,
    height: h,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [name, setName] = useState(initialAsset.name);
  const [strokes, setStrokes] = useState<ArtboardStroke[]>(initialAsset.strokes || []);
  const [redoStrokes, setRedoStrokes] = useState<ArtboardStroke[]>([]);
  const [images, setImages] = useState<ArtboardImageLayer[]>(initialAsset.images || []);
  const [activeSubTool, setActiveSubTool] = useState<'pen' | 'brush' | 'line' | 'rect' | 'circle' | 'eraser' | 'marquee'>('pen');
  const [color, setColor] = useState('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [savedNotice, setSavedNotice] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [showSavedList, setShowSavedList] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [strokesVisible, setStrokesVisible] = useState(true);
  const [savedAssets, setSavedAssets] = useState<SavedDrawingAsset[]>([]);

  const [selectedStrokeIds, setSelectedStrokeIds] = useState<string[]>([]);
  const [artZoom, setArtZoom] = useState(1);
  const [artPan, setArtPan] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const dragSelectionRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const [draftStroke, setDraftStroke] = useState<ArtboardStroke | null>(null);
  const [marqueeBox, setMarqueeBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDrawingRef = useRef(false);

  const { isDragging, handleMouseDown } = useDeskItemInteraction({
    itemId: item.id,
    itemX: item.x,
    itemY: item.y,
    rotation: item.rotation,
    width: w,
    height: h,
  });

  // Render strokes + images onto HTML5 Canvas
  const renderToCanvas = useCallback(
    (targetCanvas: HTMLCanvasElement | null, transparentBg = false) => {
      if (!targetCanvas) return;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);
      if (!transparentBg) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }

      const drawAllStrokes = () => {
        if (!strokesVisible) return;
        const all = draftStroke ? [...strokes, draftStroke] : strokes;
        for (const st of all) {
          if (st.points.length === 0) continue;
          ctx.save();
          if (st.tool === 'eraser') {
            ctx.globalCompositeOperation = transparentBg ? 'destination-out' : 'source-over';
            ctx.strokeStyle = '#ffffff';
          } else {
            ctx.strokeStyle = st.color;
          }
          const avgPressure =
            st.points.reduce((acc, p) => acc + (p.pressure ?? 0.5), 0) / st.points.length;
          const pressureFactor = st.points.some((p) => typeof p.pressure === 'number')
            ? 0.5 + avgPressure
            : 1;
          ctx.lineWidth = st.width * pressureFactor;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.globalAlpha = st.opacity ?? (st.tool === 'brush' ? 0.65 : 1);

          ctx.beginPath();
          if (st.tool === 'rect' && st.points.length >= 2) {
            const p0 = st.points[0];
            const p1 = st.points[st.points.length - 1];
            ctx.strokeRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
          } else if (st.tool === 'circle' && st.points.length >= 2) {
            const p0 = st.points[0];
            const p1 = st.points[st.points.length - 1];
            const rx = Math.abs(p1.x - p0.x) / 2;
            const ry = Math.abs(p1.y - p0.y) / 2;
            const cx = (p0.x + p1.x) / 2;
            const cy = (p0.y + p1.y) / 2;
            ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
            ctx.stroke();
          } else if (st.tool === 'line' && st.points.length >= 2) {
            const p0 = st.points[0];
            const p1 = st.points[st.points.length - 1];
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          } else {
            ctx.moveTo(st.points[0].x, st.points[0].y);
            for (let i = 1; i < st.points.length; i++) {
              ctx.lineTo(st.points[i].x, st.points[i].y);
            }
            ctx.stroke();
          }
          ctx.restore();
        }
      };

      const visibleImages = images.filter((im) => im.visible !== false);
      if (visibleImages.length === 0) {
        drawAllStrokes();
        return;
      }

      let loadedCount = 0;
      visibleImages.forEach((imgLayer) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.save();
          const cx = imgLayer.x + imgLayer.width / 2;
          const cy = imgLayer.y + imgLayer.height / 2;
          ctx.translate(cx, cy);
          if (imgLayer.rotation) {
            ctx.rotate((imgLayer.rotation * Math.PI) / 180);
          }
          ctx.drawImage(img, -imgLayer.width / 2, -imgLayer.height / 2, imgLayer.width, imgLayer.height);
          ctx.restore();
          loadedCount++;
          if (loadedCount === visibleImages.length) {
            drawAllStrokes();
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === visibleImages.length) {
            drawAllStrokes();
          }
        };
        img.src = imgLayer.url;
      });
    },
    [strokes, draftStroke, images, strokesVisible, w, h]
  );

  useEffect(() => {
    renderToCanvas(canvasRef.current, false);
  }, [renderToCanvas]);

  const exportAssetPayload = (): SavedDrawingAsset => {
    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    renderToCanvas(offscreen, true);
    let dataUrl = '';
    try {
      dataUrl = offscreen.toDataURL('image/png');
    } catch {
      dataUrl = canvasRef.current?.toDataURL('image/png') || '';
    }
    return {
      id: initialAsset.id || item.id,
      name: name.trim() || 'Bản vẽ không tên',
      dataUrl,
      strokes,
      images,
      backgroundColor: '#ffffff',
      width: w,
      height: h,
      createdAt: initialAsset.createdAt,
      updatedAt: new Date().toISOString(),
    };
  };

  const handleUndo = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRedoStrokes((r) => [...r, last]);
      return prev.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStrokes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setStrokes((s) => [...s, last]);
      return prev.slice(0, -1);
    });
  }, []);

  const transformSelectedStrokes = useCallback(
    (mode: 'move' | 'scale' | 'rotate' | 'delete', dx = 0, dy = 0, factor = 1, deg = 0) => {
      if (selectedStrokeIds.length === 0) return;
      const selectedSet = new Set(selectedStrokeIds);
      if (mode === 'delete') {
        setStrokes((prev) => prev.filter((st) => !selectedSet.has(st.id)));
        setSelectedStrokeIds([]);
        return;
      }

      // Tính tâm bounding box của vùng chọn
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      strokes.forEach((st) => {
        if (!selectedSet.has(st.id)) return;
        st.points.forEach((p) => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        });
      });
      if (!Number.isFinite(minX)) return;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const rad = (deg * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      setStrokes((prev) =>
        prev.map((st) => {
          if (!selectedSet.has(st.id)) return st;
          return {
            ...st,
            points: st.points.map((p) => {
              if (mode === 'move') return { ...p, x: p.x + dx, y: p.y + dy };
              if (mode === 'scale') {
                return { ...p, x: cx + (p.x - cx) * factor, y: cy + (p.y - cy) * factor };
              }
              const rx = p.x - cx;
              const ry = p.y - cy;
              return {
                ...p,
                x: cx + rx * cos - ry * sin,
                y: cy + rx * sin + ry * cos,
              };
            }),
          };
        })
      );
    },
    [selectedStrokeIds, strokes]
  );

  // Phím tắt trên Bảng Vẽ (Ctrl+Z / Ctrl+Y / Delete / B / E)
  useEffect(() => {
    if (!isSelected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))
      ) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedStrokeIds.length > 0) {
          e.preventDefault();
          transformSelectedStrokes('delete');
        }
      } else if (e.key.toLowerCase() === 'b') {
        setActiveSubTool('pen');
      } else if (e.key.toLowerCase() === 'e') {
        setActiveSubTool('eraser');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSelected, handleUndo, handleRedo, selectedStrokeIds, transformSelectedStrokes]);

  const handleSaveAsset = async () => {
    const payload = exportAssetPayload();
    const res = await GameCabinetStorage.saveDrawing(payload);
    if (!res.ok) {
      setStorageError(res.error || 'Không thể lưu bản vẽ.');
      return;
    }
    setStorageError(null);
    updateArtboard(item.id, payload);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  const handleCreatePawnFree = async () => {
    const payload = exportAssetPayload();
    const res = await GameCabinetStorage.saveDrawing(payload);
    if (!res.ok) setStorageError(res.error || null);
    updateArtboard(item.id, payload);
    // Phát sự kiện để BoardGameArena nhận làm quân cờ, hoặc tạo sticker nếu chưa có bàn cờ
    const evt = new CustomEvent('vitudy:add-pawn-to-board', {
      detail: { asset: payload, fitToTile: false },
      cancelable: true,
    });
    const dispatched = window.dispatchEvent(evt);
    if (dispatched) {
      // Nếu không có bàn cờ nào hứng sự kiện thì thêm dạng Sticker quân cờ ra bàn
      addSticker(
        {
          type: 'sticker',
          name: payload.name,
          content: payload.name,
          url: payload.dataUrl,
          width: 96,
          height: 96,
        },
        item.x + w + 24,
        item.y,
        96,
        96
      );
    }
  };

  const handleClickTileToFitPawn = async () => {
    const payload = exportAssetPayload();
    await GameCabinetStorage.saveDrawing(payload);
    updateArtboard(item.id, payload);
    window.dispatchEvent(
      new CustomEvent('vitudy:start-fit-pawn-mode', {
        detail: { asset: payload },
      })
    );
  };

  const getLocalPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0, pressure: undefined };
    const scaleX = w / rect.width;
    const scaleY = h / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      pressure: e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : undefined,
    };
  };

  const selectionBbox = React.useMemo(() => {
    if (selectedStrokeIds.length === 0) return null;
    const selectedSet = new Set(selectedStrokeIds);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    strokes.forEach((st) => {
      if (!selectedSet.has(st.id)) return;
      st.points.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });
    });
    if (!Number.isFinite(minX)) return null;
    return { x: minX - 8, y: minY - 8, width: Math.max(24, maxX - minX + 16), height: Math.max(24, maxY - minY + 16) };
  }, [selectedStrokeIds, strokes]);

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.stopPropagation();
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY, panX: artPan.x, panY: artPan.y };
      return;
    }
    if (e.button !== 0) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const pt = getLocalPoint(e);

    if (
      activeSubTool === 'marquee' &&
      selectionBbox &&
      pt.x >= selectionBbox.x &&
      pt.x <= selectionBbox.x + selectionBbox.width &&
      pt.y >= selectionBbox.y &&
      pt.y <= selectionBbox.y + selectionBbox.height
    ) {
      dragSelectionRef.current = { active: true, lastX: pt.x, lastY: pt.y };
      return;
    }

    isDrawingRef.current = true;

    if (activeSubTool === 'marquee') {
      setSelectedStrokeIds([]);
      setMarqueeBox({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
      return;
    }

    setRedoStrokes([]);
    setDraftStroke({
      id: `ab-stroke-${Date.now()}`,
      points: [pt],
      color,
      width: activeSubTool === 'brush' ? strokeWidth * 2.2 : activeSubTool === 'eraser' ? strokeWidth * 3 : strokeWidth,
      tool: activeSubTool,
    });
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanningRef.current) {
      e.stopPropagation();
      setArtPan({
        x: panStartRef.current.panX + (e.clientX - panStartRef.current.x),
        y: panStartRef.current.panY + (e.clientY - panStartRef.current.y),
      });
      return;
    }
    if (dragSelectionRef.current.active) {
      e.stopPropagation();
      const pt = getLocalPoint(e);
      const dx = pt.x - dragSelectionRef.current.lastX;
      const dy = pt.y - dragSelectionRef.current.lastY;
      dragSelectionRef.current.lastX = pt.x;
      dragSelectionRef.current.lastY = pt.y;
      transformSelectedStrokes('move', dx, dy);
      return;
    }
    if (!isDrawingRef.current) return;
    e.stopPropagation();
    const pt = getLocalPoint(e);

    if (activeSubTool === 'marquee' && marqueeBox) {
      setMarqueeBox({ ...marqueeBox, x2: pt.x, y2: pt.y });
      return;
    }

    setDraftStroke((prev) => {
      if (!prev) return null;
      if (prev.tool === 'line' || prev.tool === 'rect' || prev.tool === 'circle') {
        return { ...prev, points: [prev.points[0], pt] };
      }
      return { ...prev, points: [...prev.points, pt] };
    });
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }
    if (dragSelectionRef.current.active) {
      dragSelectionRef.current.active = false;
      return;
    }
    if (!isDrawingRef.current) return;
    e.stopPropagation();
    isDrawingRef.current = false;

    if (activeSubTool === 'marquee' && marqueeBox) {
      const minX = Math.min(marqueeBox.x1, marqueeBox.x2);
      const maxX = Math.max(marqueeBox.x1, marqueeBox.x2);
      const minY = Math.min(marqueeBox.y1, marqueeBox.y2);
      const maxY = Math.max(marqueeBox.y1, marqueeBox.y2);
      const matched = strokes
        .filter((st) => st.points.some((p) => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY))
        .map((st) => st.id);
      setSelectedStrokeIds(matched);
      setMarqueeBox(null);
      return;
    }

    if (draftStroke) {
      setStrokes((prev) => [...prev, draftStroke]);
      setDraftStroke(null);
    }
  };

  const handleExternalImageFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || '');
      if (!url) return;
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min((w * 0.7) / img.width, (h * 0.7) / img.height, 1);
        const drawW = Math.round(img.width * ratio);
        const drawH = Math.round(img.height * ratio);
        setImages((prev) => [
          ...prev,
          {
            id: `img-${Date.now()}`,
            url,
            x: Math.round((w - drawW) / 2),
            y: Math.round((h - drawH) / 2),
            width: drawW,
            height: drawH,
          },
        ]);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      data-desk-item="true"
      onMouseDown={handleMouseDown}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleExternalImageFiles(e.dataTransfer.files);
      }}
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        width: w,
        height: h,
        zIndex: item.zIndex,
        transform: `rotate(${item.rotation}deg)`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      className={`rounded-2xl bg-white shadow-2xl border-2 transition-shadow select-none ${
        isSelected ? 'border-[#E0562D] ring-4 ring-[#E0562D]/15' : 'border-slate-300'
      }`}
    >
      {/* Thanh nắm kéo di chuyển ở mép trên giữa */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white border border-slate-300 rounded-full px-3 py-1 shadow-md cursor-grab active:cursor-grabbing">
        <span className="w-2 h-2 rounded-full bg-[#E0562D]" />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Tên bản vẽ..."
          className="text-xs font-bold text-slate-800 bg-transparent outline-none w-32 text-center"
        />
        <button
          type="button"
          title="Xóa bảng vẽ"
          onClick={(e) => {
            e.stopPropagation();
            removeDeskItem(item.id);
          }}
          className="text-slate-400 hover:text-rose-600 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CANVAS VẼ CHÍNH (hỗ trợ zoom/pan nội bộ) */}
      <div className="w-full h-full rounded-2xl overflow-hidden relative">
        <div
          style={{
            width: w,
            height: h,
            transform: `translate(${artPan.x}px, ${artPan.y}px) scale(${artZoom})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas
            ref={canvasRef}
            width={w}
            height={h}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            className="interactive-control w-full h-full touch-none cursor-crosshair block"
          />
        </div>
      </div>

      {/* Khung chọn vùng + thanh biến đổi (di chuyển, phóng to/thu nhỏ, xoay, xóa) */}
      {selectionBbox && (
        <div
          style={{
            left: selectionBbox.x,
            top: selectionBbox.y,
            width: selectionBbox.width,
            height: selectionBbox.height,
          }}
          className="absolute border-2 border-[#E0562D] bg-[#E0562D]/5 pointer-events-none rounded"
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="interactive-control pointer-events-auto absolute -top-9 left-0 bg-white border border-slate-200 rounded-lg shadow-md px-1.5 py-0.5 flex items-center gap-1 whitespace-nowrap"
          >
            <button
              type="button"
              title="Thu nhỏ 15%"
              onClick={() => transformSelectedStrokes('scale', 0, 0, 0.85)}
              className="px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
            >
              -15%
            </button>
            <button
              type="button"
              title="Phóng to 15%"
              onClick={() => transformSelectedStrokes('scale', 0, 0, 1.15)}
              className="px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
            >
              +15%
            </button>
            <button
              type="button"
              title="Xoay +15°"
              onClick={() => transformSelectedStrokes('rotate', 0, 0, 1, 15)}
              className="p-1 text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
            </button>
            <button
              type="button"
              title="Xóa nét đã chọn (Delete)"
              onClick={() => transformSelectedStrokes('delete')}
              className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              title="Bỏ chọn"
              onClick={() => setSelectedStrokeIds([])}
              className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Preview khung kéo chọn vùng */}
      {marqueeBox && (
        <div
          style={{
            left: Math.min(marqueeBox.x1, marqueeBox.x2),
            top: Math.min(marqueeBox.y1, marqueeBox.y2),
            width: Math.abs(marqueeBox.x2 - marqueeBox.x1),
            height: Math.abs(marqueeBox.y2 - marqueeBox.y1),
          }}
          className="absolute border-2 border-dashed border-[#E0562D] bg-[#E0562D]/10 pointer-events-none"
        />
      )}

      {/* ================= GÓC 1: TRÊN-TRÁI (CÔNG CỤ VẼ & HÌNH) ================= */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="interactive-control absolute top-2 left-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-lg flex items-center gap-0.5"
      >
        {[
          { id: 'pen' as const, icon: <PenTool className="w-3.5 h-3.5" />, title: 'Bút vẽ nét' },
          { id: 'brush' as const, icon: <Paintbrush className="w-3.5 h-3.5" />, title: 'Cọ tô màu' },
          { id: 'line' as const, icon: <Minus className="w-3.5 h-3.5" />, title: 'Đường thẳng' },
          { id: 'rect' as const, icon: <Square className="w-3.5 h-3.5" />, title: 'Hình vuông/chữ nhật' },
          { id: 'circle' as const, icon: <Circle className="w-3.5 h-3.5" />, title: 'Hình tròn/Elip' },
          { id: 'eraser' as const, icon: <Eraser className="w-3.5 h-3.5" />, title: 'Tẩy nét' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.title}
            onClick={() => setActiveSubTool(t.id)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeSubTool === t.id
                ? 'bg-[#E0562D] text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* ================= GÓC 2: TRÊN-PHẢI (MÀU SẮC, CỠ NÉT, UNDO) ================= */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="interactive-control absolute top-2 right-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1.5 shadow-lg flex items-center gap-1.5"
      >
        <div className="flex items-center gap-1">
          {PALETTE.slice(0, 6).map((c) => (
            <button
              key={c}
              type="button"
              title={`Màu ${c}`}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-4 h-4 rounded-full border border-slate-300 cursor-pointer transition-transform ${
                color === c ? 'ring-2 ring-[#E0562D] scale-110' : ''
              }`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="Chọn màu tùy ý"
            className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
          />
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <select
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          title="Độ dày nét"
          className="text-[11px] font-bold text-slate-700 bg-slate-100 rounded-md px-1 py-0.5 outline-none cursor-pointer"
        >
          <option value={2}>2px</option>
          <option value={4}>4px</option>
          <option value={8}>8px</option>
          <option value={14}>14px</option>
        </select>
        <button
          type="button"
          title="Hoàn tác (Ctrl+Z)"
          onClick={handleUndo}
          disabled={strokes.length === 0}
          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-35 cursor-pointer"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Làm lại (Ctrl+Y)"
          onClick={handleRedo}
          disabled={redoStrokes.length === 0}
          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-35 cursor-pointer"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Xóa sạch bảng vẽ"
          onClick={() => {
            setStrokes([]);
            setRedoStrokes([]);
            setImages([]);
            setSelectedStrokeIds([]);
          }}
          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ================= GÓC 3: DƯỚI-TRÁI (CHỌN VÙNG, LỚP, ZOOM, ẢNH, KHO VẼ) ================= */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="interactive-control absolute bottom-2 left-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-lg flex items-center gap-1"
      >
        <button
          type="button"
          title="Kéo thả chọn vùng nét (di chuyển / thu phóng / xoay / xóa)"
          onClick={() => setActiveSubTool('marquee')}
          className={`h-7 px-2 rounded-lg flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
            activeSubTool === 'marquee'
              ? 'bg-[#E0562D] text-white'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <BoxSelect className="w-3.5 h-3.5" />
          <span>Chọn vùng</span>
        </button>
        <button
          type="button"
          title="Chèn ảnh từ máy tính (hoặc kéo thả trực tiếp vào bảng)"
          onClick={() => fileInputRef.current?.click()}
          className="h-7 px-2 rounded-lg flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          <span>Ảnh</span>
        </button>
        <button
          type="button"
          title="Quản lý lớp nét & ảnh (ẩn/hiện, phóng to/nhỏ, xoay ảnh)"
          onClick={() => setShowLayers((v) => !v)}
          className={`h-7 px-2 rounded-lg flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
            showLayers ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Lớp</span>
        </button>
        <button
          type="button"
          title="Thu nhỏ bên trong bảng"
          onClick={() => setArtZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))))}
          className="w-6 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <ZoomOut className="w-3 h-3" />
        </button>
        <button
          type="button"
          title="Đặt lại zoom & vị trí bảng vẽ"
          onClick={() => {
            setArtZoom(1);
            setArtPan({ x: 0, y: 0 });
          }}
          className="px-1 h-7 rounded-lg text-[10px] font-mono font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          {Math.round(artZoom * 100)}%
        </button>
        <button
          type="button"
          title="Phóng to bên trong bảng"
          onClick={() => setArtZoom((z) => Math.min(3, Number((z + 0.15).toFixed(2))))}
          className="w-6 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <ZoomIn className="w-3 h-3" />
        </button>
        <button
          type="button"
          title="Lấy bản vẽ cũ từ kho"
          onClick={async () => {
            const list = await GameCabinetStorage.listDrawings();
            setSavedAssets(list);
            setShowSavedList((v) => !v);
          }}
          className="h-7 px-2 rounded-lg flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Kho vẽ</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleExternalImageFiles(e.target.files)}
        />
      </div>

      {/* ================= GÓC 4: DƯỚI-PHẢI (LƯU & XUẤT QUÂN CỜ) ================= */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="interactive-control absolute bottom-2 right-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-lg flex items-center gap-1"
      >
        <button
          type="button"
          title="Lưu bản vẽ vào kho cá nhân"
          onClick={handleSaveAsset}
          className="h-7 px-2.5 rounded-lg flex items-center gap-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
        >
          {savedNotice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
          <span>{savedNotice ? 'Đã lưu' : 'Lưu'}</span>
        </button>
        <button
          type="button"
          title="Xuất thành quân cờ kích thước tự do"
          onClick={handleCreatePawnFree}
          className="h-7 px-2.5 rounded-lg flex items-center gap-1 text-[11px] font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E0562D]" />
          <span>Quân cờ</span>
        </button>
        <button
          type="button"
          title="Ấn vào 1 ô trên bản đồ game để quân cờ tự động vừa khít ô đó"
          onClick={handleClickTileToFitPawn}
          className="h-7 px-2.5 rounded-lg flex items-center gap-1 text-[11px] font-bold bg-[#E0562D] hover:bg-[#c9451e] text-white cursor-pointer shadow-xs"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Khớp ô Map</span>
        </button>
      </div>

      {/* Thông báo lỗi bộ nhớ (QuotaExceeded) */}
      {storageError && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="interactive-control absolute top-12 left-1/2 -translate-x-1/2 z-30 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2"
        >
          <span>{storageError}</span>
          <button
            type="button"
            onClick={() => setStorageError(null)}
            className="text-rose-500 hover:text-rose-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Popover quản lý Layer (Nét vẽ & Ảnh: bật/tắt, scale, xoay) */}
      {showLayers && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="interactive-control absolute bottom-12 left-2 z-20 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Lớp bảng vẽ (Layers)</span>
            <button
              type="button"
              onClick={() => setShowLayers(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-700">Lớp nét vẽ ({strokes.length})</span>
            <button
              type="button"
              onClick={() => setStrokesVisible((v) => !v)}
              className="p-1 text-slate-600 hover:text-[#E0562D] cursor-pointer"
            >
              {strokesVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
          {images.map((im, idx) => (
            <div
              key={im.id}
              className="flex items-center justify-between gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200"
            >
              <span className="text-xs font-medium text-slate-700 truncate">Ảnh #{idx + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Thu nhỏ ảnh"
                  onClick={() =>
                    setImages((prev) =>
                      prev.map((x) =>
                        x.id === im.id
                          ? { ...x, width: Math.max(24, Math.round(x.width * 0.85)), height: Math.max(24, Math.round(x.height * 0.85)) }
                          : x
                      )
                    )
                  }
                  className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded hover:bg-slate-100 cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  title="Phóng to ảnh"
                  onClick={() =>
                    setImages((prev) =>
                      prev.map((x) =>
                        x.id === im.id
                          ? { ...x, width: Math.round(x.width * 1.15), height: Math.round(x.height * 1.15) }
                          : x
                      )
                    )
                  }
                  className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded hover:bg-slate-100 cursor-pointer"
                >
                  +
                </button>
                <button
                  type="button"
                  title="Xoay ảnh +15°"
                  onClick={() =>
                    setImages((prev) =>
                      prev.map((x) =>
                        x.id === im.id ? { ...x, rotation: ((x.rotation || 0) + 15) % 360 } : x
                      )
                    )
                  }
                  className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  title="Ẩn/hiện ảnh"
                  onClick={() =>
                    setImages((prev) =>
                      prev.map((x) => (x.id === im.id ? { ...x, visible: x.visible === false } : x))
                    )
                  }
                  className="p-1 text-slate-600 hover:text-[#E0562D] cursor-pointer"
                >
                  {im.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  title="Xóa ảnh"
                  onClick={() => setImages((prev) => prev.filter((x) => x.id !== im.id))}
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popover danh sách bản vẽ cũ trong Kho */}
      {showSavedList && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="interactive-control absolute bottom-12 left-2 w-64 max-h-56 overflow-y-auto bg-white border border-slate-300 rounded-xl shadow-2xl p-2 z-30"
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">Kho bản vẽ cá nhân</span>
            <button
              type="button"
              onClick={() => setShowSavedList(false)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {savedAssets.length === 0 ? (
            <p className="text-[11px] text-slate-500 py-3 text-center">Chưa có bản vẽ nào được lưu.</p>
          ) : (
            <div className="space-y-1">
              {savedAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    setName(asset.name);
                    setStrokes(asset.strokes || []);
                    setImages(asset.images || []);
                    setShowSavedList(false);
                  }}
                  className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-left cursor-pointer"
                >
                  {asset.dataUrl ? (
                    <img
                      src={asset.dataUrl}
                      alt={asset.name}
                      width={28}
                      height={28}
                      style={{ width: 28, height: 28, maxWidth: 28, maxHeight: 28 }}
                      className="w-7 h-7 rounded border border-slate-200 object-contain bg-white"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded border border-slate-200 bg-slate-50" />
                  )}
                  <span className="text-xs font-semibold text-slate-800 truncate">{asset.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
