'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { DeskItem, StudySpace, CanvasTransform, PageContent, IntelineThread } from '@/types/studyspace';
import { INITIAL_SPACES } from '@/data/mockSpaces';
import { recognizeSmartShape, recognizeSmartShapeDetailed } from '@/utils/smartShape';
import { useAuth } from '@/hooks/useAuth';
import { StudySpaceService, ensureUUID } from '@/services/StudySpaceService';
import { sanitizeDocumentText } from '@/services/OfficeParserService';
import { OfflineQueue } from '@/services/OfflineQueue';
import { cleanupDeskItemsOnDelete } from '@/lib/boardGameEngine';
import { getActiveStroke, setActiveStroke } from '@/lib/activeStrokeStore';
import { segmentStrokeByDeskItems } from '@/utils/strokeSegmentation';

export interface CreationPlacementTemplate {
  itemType?: import('@/types/studyspace').ItemType;
  text?: string;
  color?: string;
  width?: number;
  height?: number;
  typeLabel: string;
  codeSnippet?: string;
  codeLanguage?: string;
  mindMapColor?: string;
  mindMapParentId?: string;
  mindMapShape?: 'pill' | 'rectangle' | 'cloud';
  stickerData?: {
    type: 'emoji' | 'sticker' | 'gif';
    name: string;
    content: string;
    url?: string;
    isSvg?: boolean;
  };
}

interface StudySpaceContextType {
  spaces: StudySpace[];
  activeSpaceId: string;
  activeSpace: StudySpace;
  threads: IntelineThread[];
  transform: CanvasTransform;
  selectedItemId: string | null;
  searchQuery: string;
  isPanLocked: boolean;
  focusedItemId: string | null;
  isFocusNoticeVisible: boolean;
  enterFocusMode: (itemId: string, itemX: number, itemY: number, width: number, height: number) => void;
  exitFocusMode: () => void;
  triggerFocusNotice: () => void;
  switchSpace: (spaceId: string) => void;
  toggleStarSpace: (spaceId: string) => void;
  createSpace: (name: string, subject: string) => string;
  createSpaceFromTemplate?: (templateType: 'blank' | 'midterm' | 'curriculum_exam' | 'group_study', customName?: string) => string;
  deleteSpace?: (spaceId: string) => void;
  renameSpace?: (spaceId: string, newName: string) => void;
  duplicateSpace?: (spaceId: string) => string;
  setTransform: React.Dispatch<React.SetStateAction<CanvasTransform>>;
  panBy: (dx: number, dy: number) => void;
  zoomBy: (factor: number, originX?: number, originY?: number) => void;
  rotateDeskBy: (deltaDegrees: number, originX?: number, originY?: number) => void;
  resetDeskRotation: () => void;
  resetView: () => void;
  selectItem: (id: string | null) => void;
  updateItemPosition: (id: string, x: number, y: number) => void;
  updateItemDimensions?: (id: string, width: number, height: number) => void;
  updateItemRotation: (id: string, deltaAngle: number) => void;
  updateItemTitle?: (id: string, newTitle: string) => void;
  updateItemPageText?: (id: string, pageIndex: number, text: string) => void;
  setItemRotation: (id: string, rotation: number) => void;
  bringToFront: (id: string) => void;
  turnBookPage: (id: string, direction: 'prev' | 'next', maxPages?: number) => void;
  setBookPage: (id: string, pageIndex: number) => void;
  combineIntoBinder: (targetId: string, draggedId: string) => boolean;
  detachPageFromBinder: (bookId: string, pageIndex: number) => void;
  convertPaperToBook?: (paperId: string, coverColor?: string) => void;
  tidyUpDesk?: () => void;
  fitAllToScreen?: () => void;
  updateStickyNoteColor?: (id: string, color: string) => void;
  updateBookCoverColor?: (id: string, color: string) => void;
  updateStickyNoteText?: (id: string, text: string) => void;
  updateStickyNoteTextAlign?: (id: string, align: 'left' | 'center' | 'right') => void;
  updateStickyNoteIsBold?: (id: string, isBold: boolean) => void;
  addStickyNote: (text?: string, x?: number, y?: number, color?: string, width?: number, height?: number) => string;
  addUploadedDocument: (
    title: string,
    pages: { title?: string; text: string; image?: string }[],
    options?: {
      spreadsheetData?: import('@/types/studyspace').SpreadsheetData;
      presentationData?: import('@/types/studyspace').PresentationData;
    }
  ) => void;
  addMarketItemToSpace: (spaceId: string, marketItem: import('@/data/marketMockData').MarketItem) => void;
  removeDeskItem: (id: string) => void;
  updateDeskItem: (id: string, patch: Partial<DeskItem>) => void;
  setSearchQuery: (query: string) => void;
  togglePanLock: () => void;
  // Drawing & Note creation tools
  activeTool: import('@/types/studyspace').ActiveToolType;
  setActiveTool: (tool: import('@/types/studyspace').ActiveToolType) => void;
  penColor: string;
  setPenColor: (color: string) => void;
  penWidthLevel: 'small' | 'medium' | 'large';
  setPenWidthLevel: (level: 'small' | 'medium' | 'large') => void;
  stickyCreationColor: string | null;
  setStickyCreationColor: (color: string | null) => void;
  stickyCreationTemplate: CreationPlacementTemplate | null;
  setStickyCreationTemplate: (template: CreationPlacementTemplate | null) => void;
  addCodeBlock: (snippet?: string, x?: number, y?: number, language?: string) => string;
  addMindMapNode: (text?: string, x?: number, y?: number, parentId?: string, color?: string) => string;
  addSticker: (
    sticker: { type: 'emoji' | 'sticker' | 'gif'; name: string; content: string; url?: string; isSvg?: boolean; width?: number; height?: number },
    x?: number,
    y?: number,
    customWidth?: number,
    customHeight?: number
  ) => string;
  addArtboard: (
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    initialAsset?: import('@/types/boardgame').SavedDrawingAsset
  ) => string;
  updateArtboard: (id: string, asset: import('@/types/boardgame').SavedDrawingAsset) => void;
  addBoardGame: (pkg: import('@/types/boardgame').BoardGamePackage, x?: number, y?: number) => string;
  updateBoardGame: (id: string, pkg: import('@/types/boardgame').BoardGamePackage) => void;
  activeGamePenTool: import('@/types/boardgame').GamePenTool;
  setActiveGamePenTool: (tool: import('@/types/boardgame').GamePenTool) => void;
  updateCodeBlock: (id: string, snippet: string, language?: string) => void;
  updateMindMapNode: (id: string, text: string, color?: string, shape?: 'pill' | 'rectangle' | 'cloud') => void;
  strokes: import('@/types/studyspace').DrawingStroke[];
  currentStroke: import('@/types/studyspace').DrawingStroke | null;
  startStroke: (point: { x: number; y: number }, color: string, width: number, isHighlighter: boolean) => void;
  appendPoint: (point: { x: number; y: number }) => void;
  snapCurrentStroke: () => import('@/utils/smartShape').RecognizedShapeResult | null;
  revertCurrentStroke: () => void;
  finishStroke: () => void;
  cancelStroke: () => void;
  isFingerDrawingEnabled: boolean;
  setIsFingerDrawingEnabled: (enabled: boolean) => void;
  addStroke: (stroke: import('@/types/studyspace').DrawingStroke) => void;
  undoStroke: () => void;
  redoStroke: () => void;
  redoStack: import('@/types/studyspace').DrawingStroke[];
  clearStrokes: () => void;
  removeStrokeById: (id: string) => void;
  removeStrokesInBox: (box: { x1: number; y1: number; x2: number; y2: number }) => void;
  updateThreadSourceOffset: (threadId: string, offset: { x: number; y: number }) => void;
  addIntelineThread: (params: {
    sourceItemId: string;
    sourcePageNumber: number;
    selectedText: string;
    question: string;
    answer: string;
    sourceOffset?: { x: number; y: number };
  }) => string;
  isViewRotateMode: boolean;
  setIsViewRotateMode: React.Dispatch<React.SetStateAction<boolean>>;
  addExamSheet: (
    title: string, 
    questions: import('@/types/studyspace').ExamQuestion[], 
    timeLimitMinutes?: number,
    pos?: { x: number; y: number }
  ) => string;
  updateExamAnswer: (itemId: string, questionId: string, answerIdx: number) => void;
  gradeExam: (itemId: string) => void;
  resetExam: (itemId: string) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveCurrentSpaceImmediately: (isManual?: boolean) => Promise<boolean>;
  isDeskReady: boolean;
}

const DEFAULT_TRANSFORM: CanvasTransform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0
};

const DEFAULT_EMPTY_SPACE: StudySpace = {
  id: 'space-blank-default',
  name: 'Bàn học trống',
  subject: 'Tổng hợp',
  description: 'Không gian bàn học trống',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  items: []
};

const StudySpaceContext = createContext<StudySpaceContextType | null>(null);

export function StudySpaceProvider({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const [spaces, setSpaces] = useState<StudySpace[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSwitchingSpace, setIsSwitchingSpace] = useState(false);
  const [transform, setTransform] = useState<CanvasTransform>(DEFAULT_TRANSFORM);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPanLocked, setIsPanLocked] = useState(false);
  const [maxZIndex, setMaxZIndex] = useState(20);
  const [isViewRotateMode, setIsViewRotateMode] = useState(false);

  // Focus Reading Mode state
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  // Khôi phục vị trí camera theo từng bàn học
  useEffect(() => {
    if (!activeSpaceId || typeof window === 'undefined') return;
    try {
      const savedCam = localStorage.getItem(`vitudy_cam_${activeSpaceId}`);
      if (savedCam) {
        const parsed = JSON.parse(savedCam);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number' && typeof parsed?.scale === 'number') {
          setTransform({
            x: parsed.x,
            y: parsed.y,
            scale: parsed.scale,
            rotation: typeof parsed.rotation === 'number' ? parsed.rotation : 0,
          });
        }
      }
    } catch {}
  }, [activeSpaceId]);

  // Tự động lưu vị trí camera khi di chuyển (trừ lúc đang Focus Mode)
  useEffect(() => {
    if (!activeSpaceId || !isLoaded || focusedItemId || typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`vitudy_cam_${activeSpaceId}`, JSON.stringify(transform));
      } catch {}
    }, 350);
    return () => clearTimeout(timer);
  }, [transform, activeSpaceId, isLoaded, focusedItemId]);
  const [preFocusTransform, setPreFocusTransform] = useState<CanvasTransform | null>(null);
  const [isFocusNoticeVisible, setIsFocusNoticeVisible] = useState(false);
  const focusNoticeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerFocusNotice = () => {
    setIsFocusNoticeVisible(true);
    if (focusNoticeTimeoutRef.current) {
      clearTimeout(focusNoticeTimeoutRef.current);
    }
    focusNoticeTimeoutRef.current = setTimeout(() => {
      setIsFocusNoticeVisible(false);
    }, 3200);
  };

  const enterFocusMode = (itemId: string, itemX: number, itemY: number, width: number, height: number) => {
    setPreFocusTransform({ ...transform });
    setFocusedItemId(itemId);
    setIsFocusNoticeVisible(false);

    if (typeof window !== 'undefined') {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      // Top margin of ~22px so top edge of book/document sits just slightly below browser top edge
      const topGap = 22;
      const bottomGap = 26;
      const availableH = screenH - (topGap + bottomGap);
      const availableW = screenW - 48; // 24px each side

      // Scale to fit screen height to the maximum extent
      const targetScale = Math.min(availableH / height, availableW / width);
      const scaledW = width * targetScale;

      const targetX = (screenW - scaledW) / 2 - itemX * targetScale;
      const targetY = topGap - itemY * targetScale;

      setTransform({
        x: Math.round(targetX),
        y: Math.round(targetY),
        scale: Number(targetScale.toFixed(3)),
        rotation: 0
      });
    }
  };

  const exitFocusMode = () => {
    setFocusedItemId(null);
    setIsFocusNoticeVisible(false);
    if (preFocusTransform) {
      setTransform(preFocusTransform);
    }
  };

  // Drawing & Note creation tools state
  const [activeTool, setActiveTool] = useState<import('@/types/studyspace').ActiveToolType>('cursor');
  const [activeGamePenTool, setActiveGamePenTool] = useState<import('@/types/boardgame').GamePenTool>('select');
  const [penColor, setPenColor] = useState<string>('#2563eb');
  const [penWidthLevel, setPenWidthLevel] = useState<'small' | 'medium' | 'large'>('medium');
  const [stickyCreationColor, setStickyCreationColor] = useState<string | null>(null);
  const [stickyCreationTemplate, setStickyCreationTemplate] = useState<CreationPlacementTemplate | null>(null);
  const [strokes, setStrokes] = useState<import('@/types/studyspace').DrawingStroke[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Auto-flush offline queue when back online
  useEffect(() => {
    return OfflineQueue.initAutoFlush();
  }, []);

  const createStrokeId = () =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : ensureUUID(`stroke-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`);

  const startStroke = (point: { x: number; y: number }, color: string, width: number, isHighlighter: boolean) => {
    setActiveStroke({
      id: createStrokeId(),
      points: [point],
      color,
      width,
      isHighlighter
    });
  };

  const appendPoint = (point: { x: number; y: number }) => {
    setActiveStroke(prev => {
      if (!prev) return null;
      const last = prev.points[prev.points.length - 1];
      if (last && Math.hypot(point.x - last.x, point.y - last.y) < 2) {
        return prev;
      }
      return {
        ...prev,
        points: [...prev.points, point]
      };
    });
  };

  const snapCurrentStroke = (): import('@/utils/smartShape').RecognizedShapeResult | null => {
    let result: import('@/utils/smartShape').RecognizedShapeResult | null = null;
    setActiveStroke(prev => {
      if (!prev || prev.points.length < 5) return prev;
      const res = recognizeSmartShapeDetailed(prev.points);
      if (res.shape !== 'none') {
        result = res;
        return {
          ...prev,
          points: res.points,
          originalPoints: prev.originalPoints || [...prev.points],
          isSmartShape: true,
          shapeType: res.shape
        };
      }
      return prev;
    });
    return result;
  };

  const revertCurrentStroke = () => {
    setActiveStroke(prev => {
      if (!prev || !prev.originalPoints) return prev;
      return {
        ...prev,
        points: prev.originalPoints,
        originalPoints: undefined,
        isSmartShape: false,
        shapeType: undefined
      };
    });
  };

  const finishStroke = () => {
    const prev = getActiveStroke();
    setActiveStroke(null);
    if (!prev || prev.points.length <= 1) return;

    let finalPoints = prev.points;
    let isSmart = prev.isSmartShape ?? false;
    let origPts = prev.originalPoints;
    let sType = prev.shapeType;

    if (activeTool === 'smart_shape' && !isSmart) {
      const res = recognizeSmartShapeDetailed(prev.points);
      if (res.shape !== 'none') {
        finalPoints = res.points;
        isSmart = true;
        origPts = [...prev.points];
        sType = res.shape;
      }
    }

    const curSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];
    const baseStroke: import('@/types/studyspace').DrawingStroke = {
      ...prev,
      points: finalPoints,
      isSmartShape: isSmart,
      originalPoints: origPts,
      shapeType: sType
    };

    const segmentedStrokes = segmentStrokeByDeskItems(
      baseStroke,
      curSpace?.items || [],
      createStrokeId
    );
    if (segmentedStrokes.length === 0) return;

    setStrokes(s => {
      const updatedStrokes = [...s, ...segmentedStrokes];
      try {
        const uId = user?.id;
        const userPrefix = uId ? `user_${uId}_` : 'guest_';
        localStorage.setItem(`${userPrefix}vitudy_strokes_${activeSpaceId}`, JSON.stringify(updatedStrokes));
        localStorage.setItem(`vitudy_strokes_${activeSpaceId}`, JSON.stringify(updatedStrokes));
      } catch {}
      return updatedStrokes;
    });
  };

  const cancelStroke = () => {
    setCurrentStroke(null);
  };

  const [isFingerDrawingEnabled, setIsFingerDrawingEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vitudy_finger_drawing_enabled') || localStorage.getItem('greenlearn_finger_drawing_enabled');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const setIsFingerDrawingEnabled = (enabled: boolean) => {
    setIsFingerDrawingEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vitudy_finger_drawing_enabled', String(enabled));
    }
  };

  const [redoStack, setRedoStack] = useState<import('@/types/studyspace').DrawingStroke[]>([]);
  const recentAddedItemIdsRef = useRef<string[]>([]);

  const addStroke = (stroke: import('@/types/studyspace').DrawingStroke) => {
    setStrokes(prev => [...prev, stroke]);
    setRedoStack([]); // reset redo on new stroke
  };

  const undoStroke = () => {
    setStrokes(prev => {
      if (prev.length === 0) {
        // Nếu không có nét vẽ nào để hoàn tác, kiểm tra hoàn tác vật thể vừa thêm (Code block, Note, etc.)
        const lastItemId = recentAddedItemIdsRef.current.pop();
        if (lastItemId) {
          removeDeskItem(lastItemId);
        }
        return prev;
      }
      const last = prev[prev.length - 1];
      // If the last stroke was beautified by smart shape, restore its original hand-drawn stroke on first undo
      if (last.isSmartShape && last.originalPoints && last.originalPoints.length > 0) {
        const revertedStroke: import('@/types/studyspace').DrawingStroke = {
          ...last,
          points: last.originalPoints,
          isSmartShape: false,
          originalPoints: undefined,
          shapeType: undefined
        };
        return [...prev.slice(0, -1), revertedStroke];
      }
      setRedoStack(r => [...r, last]);
      return prev.slice(0, -1);
    });
  };

  const redoStroke = () => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const nextStroke = prev[prev.length - 1];
      setStrokes(s => [...s, nextStroke]);
      return prev.slice(0, -1);
    });
  };

  const clearStrokes = () => {
    setStrokes([]);
    setRedoStack([]);
  };

  const removeStrokeById = (id: string) => {
    setStrokes(prev => prev.filter(s => s.id !== id));
  };

  const removeStrokesInBox = (box: { x1: number; y1: number; x2: number; y2: number }) => {
    const minX = Math.min(box.x1, box.x2);
    const maxX = Math.max(box.x1, box.x2);
    const minY = Math.min(box.y1, box.y2);
    const maxY = Math.max(box.y1, box.y2);

    const curSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];

    setStrokes(prev => prev.filter(stroke => {
      if (stroke.attachedToItemId) {
        const item = curSpace?.items.find(i => i.id === stroke.attachedToItemId);
        if (item) {
          const rad = (item.rotation * Math.PI) / 180;
          const isInside = stroke.points.some(p => {
            const wx = item.x + p.x * Math.cos(rad) - p.y * Math.sin(rad);
            const wy = item.y + p.x * Math.sin(rad) + p.y * Math.cos(rad);
            return wx >= minX && wx <= maxX && wy >= minY && wy <= maxY;
          });
          return !isInside;
        }
      }
      const isInside = stroke.points.some(p => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY);
      return !isInside;
    }));
  };

  const updateThreadSourceOffset = (threadId: string, offset: { x: number; y: number }) => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          threads: (s.threads || []).map(t =>
            t.id === threadId ? { ...t, sourceOffset: offset } : t
          )
        };
      })
    );
  };

  const activeSpaceIdRef = useRef(activeSpaceId);
  activeSpaceIdRef.current = activeSpaceId;

  // Helper lưu nhanh và an toàn vào localStorage ngay lập tức
  const syncLocal = useCallback((spacesList: StudySpace[], targetActiveId?: string) => {
    try {
      const uId = user?.id;
      const userPrefix = uId ? `user_${uId}_` : 'guest_';
      const actId = targetActiveId || activeSpaceIdRef.current;
      localStorage.setItem(`${userPrefix}vitudy_spaces`, JSON.stringify(spacesList));
      localStorage.setItem(`${userPrefix}vitudy_active_space_id`, actId);
      localStorage.setItem('vitudy_spaces', JSON.stringify(spacesList));
      localStorage.setItem('vitudy_active_space_id', actId);
    } catch {}
  }, [user?.id]);

  // Deep NFC normalization & binary sanitizer for persistent storage safety (preserves emojis for emoji stickers/notes)
  const normalizeNFC = (text: string) => (text ? sanitizeDocumentText(text).normalize('NFC') : '');

  // Load spaces on startup from Supabase Cloud (when authenticated) or localStorage (guest)
  useEffect(() => {
    if (status === 'loading') return;
    let cancelled = false;
    setIsLoaded(false);

    const isAuth = status === 'authenticated' && Boolean(user?.id);
    const userPrefix = isAuth ? `user_${user!.id}_` : 'guest_';
    let localSpaces: StudySpace[] | null = null;
    let localActiveId: string | null = null;

    try {
      // Khi đã đăng nhập: CHỈ đọc storage riêng của tài khoản này, KHÔNG đọc fallback sang guest/demo chung
      const saved = isAuth 
        ? localStorage.getItem(`${userPrefix}vitudy_spaces`)
        : (localStorage.getItem('guest_vitudy_spaces') || localStorage.getItem('vitudy_spaces'));
      
      localActiveId = isAuth
        ? localStorage.getItem(`${userPrefix}vitudy_active_space_id`)
        : (localStorage.getItem('guest_vitudy_active_space_id') || localStorage.getItem('vitudy_active_space_id'));

      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const deepNormalize = (data: any): any => {
            if (typeof data === 'string') return normalizeNFC(data);
            if (Array.isArray(data)) return data.map(deepNormalize);
            if (data && typeof data === 'object') {
              const res: any = {};
              for (const k of Object.keys(data)) {
                res[k] = deepNormalize(data[k]);
              }
              return res;
            }
            return data;
          };
          localSpaces = deepNormalize(parsed);
        }
      }
    } catch {
      // fallback
    }

    // Đọc URL param ?space=XYZ nếu có
    let urlSpaceId: string | null = null;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      urlSpaceId = params.get('space');
    }

    const loadLocalStrokes = (spaceId: string) => {
      try {
        const savedStrokes = localStorage.getItem(`${userPrefix}vitudy_strokes_${spaceId}`) || localStorage.getItem(`vitudy_strokes_${spaceId}`);
        if (savedStrokes) {
          setStrokes(JSON.parse(savedStrokes));
        }
      } catch {}
    };

    if (isAuth && user?.id) {
      (async () => {
        try {
          const cloudSpaces = await StudySpaceService.loadSpaces(user.id);
          if (cancelled) return;
          let targetId = '';

          // Lọc bỏ các bàn học rỗng demo/thử nghiệm cũ (không xóa "Bàn học trống" do user chủ động tạo)
          const isGhostEmpty = (s: StudySpace) =>
            (!s.items || s.items.length === 0) &&
            ['Ôn thi giữa kỳ', 'Giáo trình + đề thi', 'Học nhóm', 'Toán cho Trí tuệ Nhân tạo'].includes(s.name.trim());

          // Dọn dẹp trên cloud cho các bàn học rỗng
          cloudSpaces.forEach(cs => {
            if (isGhostEmpty(cs)) {
              StudySpaceService.deleteSpace(cs.id).catch(() => {});
            }
          });

          const cleanCloudSpaces = cloudSpaces.filter(cs => !isGhostEmpty(cs));
          const cleanLocalSpaces = (localSpaces || []).filter(ls => !isGhostEmpty(ls));

          if (cleanCloudSpaces.length > 0) {
            // Bảo toàn dữ liệu cục bộ: Nếu local có bàn học cùng id mà có tài liệu mới hơn/đầy đủ hơn, giữ local
            const mergedSpaces = cleanCloudSpaces.map(cs => {
              const localMatch = cleanLocalSpaces.find(ls => ls.id === cs.id || ensureUUID(ls.id) === cs.id);
              if (!localMatch) return cs;
              const localTime = new Date(localMatch.updatedAt || localMatch.lastOpenedAt || 0).getTime();
              const cloudTime = new Date(cs.updatedAt || cs.lastOpenedAt || 0).getTime();
              if (localMatch.items && (cs.items.length === 0 || localTime >= cloudTime || localMatch.items.length >= cs.items.length)) {
                StudySpaceService.saveSpace(localMatch, user.id)
                  .then(() => StudySpaceService.upsertItems(localMatch.id, localMatch.items))
                  .catch(() => {});
                return {
                  ...cs,
                  ...localMatch,
                  items: localMatch.items
                };
              }
              return cs;
            });

            // Chỉ merge các space local của chính user này nếu chưa có trên cloud
            cleanLocalSpaces.forEach(ls => {
              if (!mergedSpaces.some(cs => cs.id === ls.id || ensureUUID(cs.id) === ensureUUID(ls.id))) {
                mergedSpaces.push(ls);
                StudySpaceService.saveSpace(ls, user.id)
                  .then(() => StudySpaceService.upsertItems(ls.id, ls.items))
                  .catch(() => {});
              }
            });

            setSpaces(mergedSpaces);
            syncLocal(mergedSpaces);

            targetId = (urlSpaceId && mergedSpaces.some(s => s.id === urlSpaceId))
              ? urlSpaceId
              : (localActiveId && mergedSpaces.some(s => s.id === localActiveId))
              ? localActiveId
              : mergedSpaces[0].id;
            setActiveSpaceId(targetId);
          } else if (cleanLocalSpaces.length > 0) {
            // Chưa có trên cloud nhưng có local của user -> sync local lên cloud
            setSpaces(cleanLocalSpaces);
            syncLocal(cleanLocalSpaces);
            targetId = (urlSpaceId && cleanLocalSpaces.some(s => s.id === urlSpaceId))
              ? urlSpaceId
              : (localActiveId && cleanLocalSpaces.some(s => s.id === localActiveId))
              ? localActiveId
              : cleanLocalSpaces[0].id;
            setActiveSpaceId(targetId);
            cleanLocalSpaces.forEach(s => {
              StudySpaceService.saveSpace(s, user.id)
                .then(() => StudySpaceService.upsertItems(s.id, s.items))
                .catch(() => {});
            });
          } else {
            // Tài khoản mới chưa tạo bàn học: giữ danh sách trống
            setSpaces([]);
            setActiveSpaceId('');
            syncLocal([]);
          }

          if (targetId) {
            loadLocalStrokes(targetId);
            const cloudStrokes = await StudySpaceService.loadStrokes(targetId);
            if (!cancelled && cloudStrokes && cloudStrokes.length > 0) {
              setStrokes(cloudStrokes);
            }
          }
        } finally {
          if (!cancelled) {
            setIsLoaded(true);
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    // Khi là khách (Guest)
    const cleanGuestSpaces = (localSpaces || []).filter(ls => {
      return (ls.items && ls.items.length > 0) || !['Ôn thi giữa kỳ', 'Giáo trình + đề thi', 'Học nhóm'].includes(ls.name.trim());
    });
    if (cleanGuestSpaces.length > 0) {
      setSpaces(cleanGuestSpaces);
      const targetId = (urlSpaceId && cleanGuestSpaces.some(s => s.id === urlSpaceId))
        ? urlSpaceId
        : (localActiveId && cleanGuestSpaces.some(s => s.id === localActiveId))
        ? localActiveId
        : cleanGuestSpaces[0].id;
      setActiveSpaceId(targetId);
      loadLocalStrokes(targetId);
    } else {
      // Khách mới chưa có bàn học: Khởi tạo ngay 1 bàn học trắng sẵn sàng sử dụng
      const initialBlankSpace: StudySpace = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `space-${Date.now()}`,
        name: 'Bàn học của tôi',
        subject: 'Học tập',
        description: 'Không gian bàn học tự do',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastOpenedAt: new Date().toISOString(),
        starred: false,
        items: []
      };
      setSpaces([initialBlankSpace]);
      setActiveSpaceId(initialBlankSpace.id);
      syncLocal([initialBlankSpace]);
    }
    setIsLoaded(true);
  }, [status, user?.id, syncLocal]);

  // Lắng nghe điều hướng Lịch sử trình duyệt (Back/Forward)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlSpaceId = params.get('space');
      if (urlSpaceId && spaces.some(s => s.id === urlSpaceId)) {
        setActiveSpaceId(urlSpaceId);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [spaces]);

  // Kiểm tra nếu có tài liệu Chợ vừa mua cần mở trên bàn học
  useEffect(() => {
    if (isLoaded && activeSpaceId) {
      try {
        const pendingDocStr = localStorage.getItem('vitudy_pending_market_item');
        if (pendingDocStr) {
          const pendingItem = JSON.parse(pendingDocStr);
          localStorage.removeItem('vitudy_pending_market_item');
          if (pendingItem.type === 'exam' && pendingItem.examQuestions) {
            addExamSheet(pendingItem.title, pendingItem.examQuestions, 20);
          } else {
            addUploadedDocument(pendingItem.title, pendingItem.pages || [{ title: pendingItem.title, text: pendingItem.summary }]);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [isLoaded, activeSpaceId]);

  // Hàm lưu tức thì trạng thái bàn học lên localStorage và Supabase Cloud
  const saveCurrentSpaceImmediately = useCallback(async (isManual: boolean = false): Promise<boolean> => {
    if (!isLoaded) return false;
    const curSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];
    if (!curSpace) return false;

    const uId = user?.id;
    const userPrefix = uId ? `user_${uId}_` : 'guest_';

    // 1. Lưu tức thì vào localStorage theo tài khoản
    try {
      localStorage.setItem(`${userPrefix}vitudy_spaces`, JSON.stringify(spaces));
      localStorage.setItem(`${userPrefix}vitudy_active_space_id`, activeSpaceId);
      localStorage.setItem(`${userPrefix}vitudy_strokes_${curSpace.id}`, JSON.stringify(strokes));
      // Dự phòng key chung
      localStorage.setItem('vitudy_spaces', JSON.stringify(spaces));
      localStorage.setItem('vitudy_active_space_id', activeSpaceId);
    } catch (err) {
      console.warn('Lỗi lưu localStorage:', err);
    }

    // 2. Lưu lên Supabase Cloud nếu đã đăng nhập
    if (status === 'authenticated' && uId) {
      if (isManual) setSaveStatus('saving');
      try {
        // Lưu space trước, sau đó items (để FK của threads/strokes tồn tại), rồi mới lưu threads & strokes
        await StudySpaceService.saveSpace(curSpace, uId);
        await StudySpaceService.upsertItems(curSpace.id, curSpace.items);
        await Promise.all([
          curSpace.threads && curSpace.threads.length > 0
            ? StudySpaceService.saveThreads(curSpace.id, curSpace.threads)
            : Promise.resolve(),
          StudySpaceService.saveStrokes(curSpace.id, strokes, uId)
        ]);
        if (isManual) {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2500);
        }
        return true;
      } catch (err) {
        console.warn('Lỗi lưu Supabase Cloud:', err);
        if (isManual) {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 3500);
        }
        return false;
      }
    } else {
      if (isManual) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
      return true;
    }
  }, [isLoaded, spaces, activeSpaceId, strokes, status, user?.id]);

  // Tự động lưu sau mỗi 10 phút (600.000 ms)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLoaded && status === 'authenticated' && user?.id) {
        saveCurrentSpaceImmediately();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoaded, status, user?.id, saveCurrentSpaceImmediately]);

  // Tự động lưu khi thoát trang, chuyển tab hoặc đóng trình duyệt
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      saveCurrentSpaceImmediately();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveCurrentSpaceImmediately();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      saveCurrentSpaceImmediately();
    };
  }, [saveCurrentSpaceImmediately]);

  // Debounce autosave khi thay đổi vật thể hoặc nét vẽ
  useEffect(() => {
    if (!isLoaded || isSwitchingSpace) return;
    const timer = setTimeout(() => {
      saveCurrentSpaceImmediately();
    }, 800);
    return () => clearTimeout(timer);
  }, [spaces, strokes, saveCurrentSpaceImmediately, isLoaded, isSwitchingSpace]);

  // Lắng nghe đồng bộ realtime bàn học khi học nhóm multiplayer
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleMultiplayerSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string; data: any }>;
      const { type, data } = customEvent.detail || {};
      if (type === 'items' && Array.isArray(data)) {
        setSpaces(prev => prev.map(s => s.id === activeSpaceId ? { ...s, items: data } : s));
      } else if (type === 'strokes' && Array.isArray(data)) {
        setStrokes(data);
      }
    };
    window.addEventListener('vitudy:multiplayer-sync', handleMultiplayerSync);
    return () => window.removeEventListener('vitudy:multiplayer-sync', handleMultiplayerSync);
  }, [activeSpaceId]);

  const activeSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0] || DEFAULT_EMPTY_SPACE;

  const switchSpace = (spaceId: string) => {
    if (spaces.some(s => s.id === spaceId)) {
      saveCurrentSpaceImmediately();
      setActiveSpaceId(spaceId);
      setSelectedItemId(null);
      resetView();

      // Cập nhật URL đồng bộ tức thì
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('space', spaceId);
        window.history.replaceState({}, '', url.toString());
      }

      // Cập nhật mốc mở lần cuối
      const nowIso = new Date().toISOString();
      let switchedSpace: StudySpace | null = null;
      const nextSpaces = spaces.map(s => {
        if (s.id === spaceId) {
          switchedSpace = { ...s, lastOpenedAt: nowIso };
          return switchedSpace;
        }
        return s;
      });
      setSpaces(nextSpaces);

      // Lưu ngay vào localStorage
      const userPrefix = user?.id ? `user_${user.id}_` : 'guest_';
      try {
        localStorage.setItem(`${userPrefix}vitudy_spaces`, JSON.stringify(nextSpaces));
        localStorage.setItem(`${userPrefix}vitudy_active_space_id`, spaceId);
        localStorage.setItem('vitudy_spaces', JSON.stringify(nextSpaces));
        localStorage.setItem('vitudy_active_space_id', spaceId);
      } catch {}

      if (status === 'authenticated' && user?.id && switchedSpace) {
        StudySpaceService.saveSpace(switchedSpace, user.id).catch(() => {});
      }

      // Nạp nét vẽ của bàn học mới
      try {
        const savedStrokes = localStorage.getItem(`${userPrefix}vitudy_strokes_${spaceId}`) || localStorage.getItem(`vitudy_strokes_${spaceId}`);
        if (savedStrokes) {
          setStrokes(JSON.parse(savedStrokes));
        } else {
          setStrokes([]);
        }
      } catch {
        setStrokes([]);
      }

      if (status === 'authenticated' && user?.id) {
        setIsSwitchingSpace(true);
        StudySpaceService.loadStrokes(spaceId)
          .then(cloudStrokes => {
            if (cloudStrokes && cloudStrokes.length > 0) {
              setStrokes(cloudStrokes);
            }
          })
          .finally(() => {
            setIsSwitchingSpace(false);
          });
      }
    }
  };

  const toggleStarSpace = (spaceId: string) => {
    setSpaces(prev => {
      const updated = prev.map(s => {
        if (s.id !== spaceId) return s;
        const nextStar = !s.starred;
        if (status === 'authenticated' && user?.id) {
          StudySpaceService.saveSpace({ ...s, starred: nextStar }, user.id).catch(() => {});
        }
        return { ...s, starred: nextStar };
      });
      const userPrefix = user?.id ? `user_${user.id}_` : 'guest_';
      try {
        localStorage.setItem(`${userPrefix}vitudy_spaces`, JSON.stringify(updated));
        localStorage.setItem('vitudy_spaces', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const createSpace = (name: string, subject: string): string => {
    const newSpaceId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `space-${Date.now()}`;
    const newSpace: StudySpace = {
      id: newSpaceId,
      name,
      subject,
      description: `Không gian học tập bộ môn ${subject}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
      starred: false,
      items: []
    };

    const nextSpaces = [...spaces, newSpace];
    setSpaces(nextSpaces);
    setActiveSpaceId(newSpace.id);
    setSelectedItemId(null);
    resetView();
    setStrokes([]);

    // Cập nhật URL đồng bộ tức thì
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('space', newSpace.id);
      window.history.replaceState({}, '', url.toString());
    }

    // Lưu ngay vào localStorage
    const userPrefix = user?.id ? `user_${user.id}_` : 'guest_';
    try {
      localStorage.setItem(`${userPrefix}vitudy_spaces`, JSON.stringify(nextSpaces));
      localStorage.setItem(`${userPrefix}vitudy_active_space_id`, newSpace.id);
      localStorage.setItem('vitudy_spaces', JSON.stringify(nextSpaces));
      localStorage.setItem('vitudy_active_space_id', newSpace.id);
    } catch {}

    if (status === 'authenticated' && user?.id) {
      StudySpaceService.saveSpace(newSpace, user.id);
    }
    return newSpace.id;
  };

  const createSpaceFromTemplate = (templateType: 'blank' | 'midterm' | 'curriculum_exam' | 'group_study', customName?: string): string => {
    const newSpaceId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `space-${Date.now()}`;
    let name = customName || 'Bàn học mới';
    let subject = 'Học tập';
    let items: DeskItem[] = [];

    if (templateType === 'blank') {
      name = customName || 'Bàn học trống';
      subject = 'Tự do';
      items = [];
    } else if (templateType === 'midterm') {
      name = customName || 'Ôn thi giữa kỳ';
      subject = 'Ôn tập';
      items = [
        {
          id: `book-${Date.now()}`,
          type: 'book',
          title: 'Giáo trình Ôn Thi Giữa Kỳ: Giải Tích & Tối Ưu',
          x: 160,
          y: 80,
          rotation: 0,
          scale: 1,
          zIndex: 10,
          pageCount: 4,
          currentPageIndex: 0,
          colorTheme: '#5c3920',
          isBinder: false,
          pages: [
            {
              id: 'p-mid-1',
              pageNumber: 1,
              title: 'Chương 1: Đạo hàm hàm nhiều biến & Gradient',
              text: `## 1.1 Khái niệm Gradient trong không gian đa chiều
Gradient của hàm khả vi $f: \\mathbb{R}^n \\to \\mathbb{R}$ tại điểm $x$ được định nghĩa bởi vector các đạo hàm riêng:

$$\\nabla f(x) = \\left[ \\frac{\\partial f}{\\partial x_1}, \\frac{\\partial f}{\\partial x_2}, \\dots, \\frac{\\partial f}{\\partial x_n} \\right]^T$$

• Hướng của $\\nabla f(x)$ là hướng mà hàm số tăng nhanh nhất.
• Độ lớn của gradient biểu thị tốc độ tăng của giá trị hàm số.`
            },
            {
              id: 'p-mid-2',
              pageNumber: 2,
              title: 'Chương 2: Ma trận Hessian & Cực trị địa phương',
              text: `## 2.1 Điều kiện tối ưu bậc hai
Ma trận Hessian chứa toàn bộ các đạo hàm riêng cấp hai của hàm $f$:

$$H(x) = \\nabla^2 f(x) = \\left[ \\frac{\\partial^2 f}{\\partial x_i \\partial x_j} \\right]_{i,j=1}^n$$

• Điểm dừng $x^*$ thỏa mãn $\\nabla f(x^*) = 0$.
• Nếu $H(x^*)$ xác định dương ($H \\succ 0$), $x^*$ là điểm cực tiểu địa phương ngặt.
• Nếu $H(x^*)$ có cả giá trị riêng âm và dương, $x^*$ là điểm yên ngựa (saddle point).`
            },
            {
              id: 'p-mid-3',
              pageNumber: 3,
              title: 'Chương 3: Thuật toán Tối ưu Gradient Descent',
              text: `## 3.1 Quy tắc cập nhật trọng số
Thuật toán Gradient Descent cập nhật vector tham số $\\theta$ theo công thức:

$$\\theta^{(t+1)} = \\theta^{(t)} - \\eta \\nabla L(\\theta^{(t)})$$

Trong đó:
• $\\eta > 0$ là tốc độ học (learning rate).
• $L(\\theta)$ là hàm mất mát (loss function).
• Dấu trừ biểu thị việc di chuyển ngược hướng gradient để tìm cực tiểu toàn cục hoặc địa phương.`
            },
            {
              id: 'p-mid-4',
              pageNumber: 4,
              title: 'Chương 4: Tóm tắt công thức & Bẫy điểm thi',
              text: `## 4.1 Bảng tổng kết trước giờ vào phòng thi
• Nhân tử Lagrange cho ràng buộc đẳng thức: $\\mathcal{L}(x, \\lambda) = f(x) + \\lambda^T h(x)$.
• Điều kiện KKT cho ràng buộc bất đẳng thức: $\\mu_i g_i(x) = 0$ và $\\mu_i \\ge 0$.
• Phân rã SVD: $A = U \\Sigma V^T$ với $\\Sigma$ chứa các giá trị suy biến giảm dần $\\sigma_1 \\ge \\sigma_2 \\ge \\dots \\ge 0$.`
            }
          ]
        },
        {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `note-${Date.now()}`,
          type: 'sticky_note',
          title: 'Ghi chú ôn thi',
          x: 1120,
          y: 100,
          rotation: 0,
          scale: 1,
          zIndex: 15,
          pageCount: 1,
          currentPageIndex: 0,
          stickyColor: '#fef08a',
          stickyText: `Kế hoạch ôn thi 7 ngày:
• Thứ 2 - Thứ 4: Ôn giải tích và đạo hàm ma trận
• Thứ 5 - Thứ 6: Giải 5 đề thi mẫu trên bàn học
• Thứ 7: Làm bài test thử tính giờ và rà soát bẫy điểm số!`,
          pages: []
        }
      ];
    } else if (templateType === 'curriculum_exam') {
      name = customName || 'Giáo trình + đề thi';
      subject = 'Luyện đề';
      items = [
        {
          id: `paper-theory-${Date.now()}`,
          type: 'paper',
          title: 'Tóm Tắt Giáo Trình Giải Tích & Tối Ưu',
          x: 120,
          y: 70,
          rotation: 0,
          scale: 1,
          zIndex: 11,
          pageCount: 2,
          currentPageIndex: 0,
          colorTheme: '#047857',
          isBinder: false,
          pages: [
            {
              id: 'p-theory-1',
              pageNumber: 1,
              title: 'Phần 1: Công thức Đạo hàm Ma trận cốt lõi',
              text: `## 1. Vi phân Ma trận trong Học Máy
• Đạo hàm tích vô hướng: $\\frac{\\partial (a^T x)}{\\partial x} = a$.
• Đạo hàm dạng toàn phương: $\\frac{\\partial (x^T A x)}{\\partial x} = (A + A^T)x$. Khi $A$ đối xứng: $\\frac{\\partial (x^T A x)}{\\partial x} = 2Ax$.
• Gradient hàm mất mát MSE: $\\nabla_w \\|Xw - y\\|^2 = 2 X^T(Xw - y)$.`
            },
            {
              id: 'p-theory-2',
              pageNumber: 2,
              title: 'Phần 2: Phương pháp Tối ưu hóa Hiện đại',
              text: `## 2. Các biến thể Gradient Descent
• Momentum: $v_{t+1} = \\gamma v_t + \\eta \\nabla L(\\theta_t)$, $\\theta_{t+1} = \\theta_t - v_{t+1}$.
• Adam: Kết hợp trung bình trượt bậc 1 $m_t$ và bậc 2 $v_t$, tự động điều chỉnh learning rate cho từng trọng số.
• L1 Regularization (Lasso): Tạo nghiệm thưa (sparsity), ép các trọng số không quan trọng về đúng 0.`
            }
          ]
        },
        {
          id: `exam-sheet-${Date.now()}`,
          type: 'paper',
          title: 'Đề Thi Thử Học Phần: Giải Tích & Machine Learning (15 Phút)',
          x: 620,
          y: 70,
          rotation: 0,
          scale: 1,
          zIndex: 12,
          pageCount: 1,
          currentPageIndex: 0,
          colorTheme: '#0284c7',
          isBinder: false,
          isExamSheet: true,
          examData: {
            questions: [
              {
                id: 'eq-1',
                question: 'Gradient của hàm số $f(x, y) = x^2 + 3y^2$ tại điểm $(1, 2)$ là:',
                options: ['[2, 6]^T', '[2, 12]^T', '[1, 6]^T', '[4, 12]^T'],
                correctAnswer: 1,
                explanation: 'Ta có $\\frac{\\partial f}{\\partial x} = 2x$, $\\frac{\\partial f}{\\partial y} = 6y$. Tại $(1, 2)$: $\\nabla f(1, 2) = [2(1), 6(2)]^T = [2, 12]^T$.'
              },
              {
                id: 'eq-2',
                question: 'Khi ma trận Hessian $H$ tại điểm dừng $x^*$ xác định dương, điểm $x^*$ là:',
                options: ['Điểm yên ngựa', 'Điểm cực đại địa phương', 'Điểm cực tiểu địa phương ngặt', 'Không xác định'],
                correctAnswer: 2,
                explanation: 'Theo điều kiện đủ bậc hai, ma trận Hessian xác định dương (mọi giá trị riêng > 0) tại điểm dừng chứng minh hàm số có cực tiểu địa phương ngặt.'
              },
              {
                id: 'eq-3',
                question: 'Trong thuật toán Gradient Descent, siêu tham số $\\eta$ (learning rate) quá lớn sẽ dẫn tới:',
                options: ['Hội tụ nhanh hơn tới cực tiểu', 'Mô hình phân kỳ và dao động mạnh', 'Trọng số bị triệt tiêu về 0', 'Tăng thời gian huấn luyện mà không đổi giá trị'],
                correctAnswer: 1,
                explanation: 'Nếu learning rate quá lớn, bước cập nhật vượt qua đáy cực tiểu khiến hàm mất mát nhảy vọt và phân kỳ.'
              },
              {
                id: 'eq-4',
                question: 'Phân rã SVD của ma trận $A = U \\Sigma V^T$, các cột của ma trận $U$ là:',
                options: ['Vector riêng của $AA^T$', 'Vector riêng của $A^TA$', 'Các giá trị suy biến', 'Các trọng số chuẩn hóa'],
                correctAnswer: 0,
                explanation: 'Các cột của $U$ (left singular vectors) là các vector riêng trực chuẩn của ma trận đối xứng $AA^T$.'
              },
              {
                id: 'eq-5',
                question: 'Thuật toán tối ưu nào kết hợp giữa quán tính Momentum và điều chỉnh tốc độ học thích nghi RMSProp?',
                options: ['SGD', 'AdaGrad', 'Adam', 'L-BFGS'],
                correctAnswer: 2,
                explanation: 'Adam (Adaptive Moment Estimation) ước lượng cả moment bậc 1 (trung bình có trọng số của gradient) và moment bậc 2 (phương sai không định tâm).'
              }
            ],
            userAnswers: {},
            timeLimitMinutes: 15,
            isGraded: false
          },
          pages: [
            {
              id: 'p-exam-cover',
              pageNumber: 1,
              title: 'Đề Thi Thử Giải Tích & ML',
              text: 'Đề thi 5 câu hỏi trắc nghiệm chuẩn hóa. Nhấp vào các đáp án để chọn câu trả lời, sau đó bấm "Chấm điểm ngay" để xem điểm số và lời giải chi tiết.'
            }
          ]
        },
        {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `note-${Date.now()}`,
          type: 'sticky_note',
          title: 'Nháp thi & Công thức',
          x: 1140,
          y: 90,
          rotation: 0,
          scale: 1,
          zIndex: 15,
          pageCount: 1,
          currentPageIndex: 0,
          stickyColor: '#fef08a',
          stickyText: `Nháp tính nhanh:
• Câu 1: Đạo hàm riêng 2x và 6y -> Thay (1,2) -> [2, 12]
• Bấm STudy trên đề thi để mở đồng hồ đếm ngược và chấm điểm tự động!`,
          pages: []
        }
      ];
    } else if (templateType === 'group_study') {
      name = customName || 'Học nhóm';
      subject = 'Học nhóm';
      items = [
        {
          id: `book-group-${Date.now()}`,
          type: 'book',
          title: 'Sổ Tay Thảo Luận Nhóm: Nghiên Cứu Deep Learning',
          x: 160,
          y: 80,
          rotation: 0,
          scale: 1,
          zIndex: 10,
          pageCount: 3,
          currentPageIndex: 0,
          colorTheme: '#5c3920',
          isBinder: false,
          pages: [
            {
              id: 'p-group-1',
              pageNumber: 1,
              title: 'Mục tiêu & Phân công công việc',
              text: `## Phân công nhiệm vụ đề tài học máy
• Thành (Trưởng nhóm): Huấn luyện kiến trúc Transformer & ViT.
• Tuấn: Tiền xử lý tập dữ liệu CIFAR-100 và làm sạch nhãn.
• Lan: Viết báo cáo giải thích độ đo Precision, Recall, F1 và vẽ biểu đồ ROC-AUC.`
            },
            {
              id: 'p-group-2',
              pageNumber: 2,
              title: 'Kết quả thực nghiệm mô hình',
              text: `## Báo cáo thực nghiệm tuần 3
• Baseline CNN: Accuracy đạt 78.4% sau 20 epochs.
• ResNet-18: Accuracy đạt 86.2%, không còn hiện tượng vanishing gradient.
• Transformer (ViT-B/16): Accuracy đạt 92.8% khi áp dụng Data Augmentation (Mixup + CutMix).`
            },
            {
              id: 'p-group-3',
              pageNumber: 3,
              title: 'Câu hỏi cần thảo luận trong buổi họp',
              text: `## Các vấn đề cần giải quyết
• Làm thế nào để giảm kích thước mô hình khi triển khai lên thiết bị di động?
• Thử nghiệm kỹ thuật Quantization INT8 và Knowledge Distillation để nén mô hình.`
            }
          ]
        },
        {
          id: `note-group-1-${Date.now()}`,
          type: 'sticky_note',
          title: 'Ý kiến Thành',
          x: 1120,
          y: 90,
          rotation: 0,
          scale: 1,
          zIndex: 15,
          pageCount: 1,
          currentPageIndex: 0,
          stickyColor: '#fed7aa',
          stickyText: `Tiến độ nhóm:
Đã hoàn thành huấn luyện mô hình Transformer, kết quả vượt kỳ vọng 92.8%! Chiều nay 15h họp online nhé cả nhóm.`,
          pages: []
        },
        {
          id: `note-group-2-${Date.now()}`,
          type: 'sticky_note',
          title: 'Góp ý từ Tuấn',
          x: 1120,
          y: 330,
          rotation: 0,
          scale: 1,
          zIndex: 16,
          pageCount: 1,
          currentPageIndex: 0,
          stickyColor: '#bbf7d0',
          stickyText: `Tập dữ liệu đã chuẩn hóa xong và đẩy lên Google Drive. Mình đã chia sẵn train/val/test tỉ lệ 7:1.5:1.5 rồi nhé!`,
          pages: []
        }
      ];
    }

    const newSpace: StudySpace = {
      id: newSpaceId,
      name,
      subject,
      description: templateType === 'blank' ? 'Không gian bàn học trống' : `Bàn học ${name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
      starred: false,
      items
    };

    const updatedSpaces = [...spaces, newSpace];
    setSpaces(updatedSpaces);
    setActiveSpaceId(newSpace.id);
    setSelectedItemId(null);
    resetView();
    setStrokes([]);

    // Cập nhật URL đồng bộ tức thì
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('space', newSpace.id);
      window.history.replaceState({}, '', url.toString());
    }

    // Lưu ngay lập tức vào localStorage để chống mất dữ liệu khi reload
    const userPrefix = user?.id ? `user_${user.id}_` : 'guest_';
    try {
      localStorage.setItem(`${userPrefix}vitudy_spaces`, JSON.stringify(updatedSpaces));
      localStorage.setItem(`${userPrefix}vitudy_active_space_id`, newSpaceId);
      localStorage.setItem('vitudy_spaces', JSON.stringify(updatedSpaces));
      localStorage.setItem('vitudy_active_space_id', newSpaceId);
    } catch {
      // ignore
    }

    if (status === 'authenticated' && user?.id) {
      StudySpaceService.saveSpace(newSpace, user.id);
      if (items.length > 0) {
        StudySpaceService.upsertItems(newSpace.id, items).catch(() => {});
      }
    }
    return newSpaceId;
  };

  const deleteSpace = (spaceId: string) => {
    setSpaces(prev => {
      if (prev.length <= 1) {
        alert('Cần giữ lại ít nhất một bàn học.');
        return prev;
      }
      const updated = prev.filter(s => s.id !== spaceId);
      const nextActiveId = activeSpaceId === spaceId && updated.length > 0 ? updated[0].id : activeSpaceId;
      if (activeSpaceId === spaceId && updated.length > 0) {
        setActiveSpaceId(nextActiveId);
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          if (url.searchParams.has('space')) {
            url.searchParams.set('space', nextActiveId);
            window.history.replaceState({}, '', url.toString());
          }
        }
      }
      const userPrefix = user?.id ? `user_${user.id}_` : 'guest_';
      try {
        localStorage.setItem(`${userPrefix}vitudy_spaces`, JSON.stringify(updated));
        localStorage.setItem('vitudy_spaces', JSON.stringify(updated));
        if (nextActiveId) {
          localStorage.setItem(`${userPrefix}vitudy_active_space_id`, nextActiveId);
          localStorage.setItem('vitudy_active_space_id', nextActiveId);
        }
      } catch {
        // ignore
      }
      return updated;
    });

    if (status === 'authenticated' && user?.id) {
      StudySpaceService.deleteSpace(spaceId).catch(() => {});
    }
  };

  const renameSpace = (spaceId: string, newName: string) => {
    const trimmed = normalizeNFC(newName.trim());
    if (!trimmed) return;
    let targetRenamedSpace: StudySpace | null = null;
    setSpaces(prev => {
      const updated = prev.map(s => {
        if (s.id === spaceId) {
          targetRenamedSpace = { ...s, name: trimmed, updatedAt: new Date().toISOString() };
          return targetRenamedSpace;
        }
        return s;
      });
      const userPrefix = user?.id ? `user_${user.id}_` : 'guest_';
      try {
        localStorage.setItem(`${userPrefix}vitudy_spaces`, JSON.stringify(updated));
        localStorage.setItem('vitudy_spaces', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (status === 'authenticated' && user?.id && targetRenamedSpace) {
      StudySpaceService.saveSpace(targetRenamedSpace, user.id).catch(() => {});
    }
  };

  const duplicateSpace = (spaceId: string): string => {
    const source = spaces.find(s => s.id === spaceId);
    if (!source) return '';
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `space-${Date.now()}`;
    const newSpace: StudySpace = {
      ...source,
      id: newId,
      name: `${source.name} (Bản sao)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
      items: (source.items || []).map(i => ({
        ...i,
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${i.id}-dup-${Math.random().toString(36).slice(2, 6)}`,
        x: i.x + 30,
        y: i.y + 30
      }))
    };
    setSpaces(prev => {
      const updated = [newSpace, ...prev];
      const userPrefix = user?.id ? `user_${user.id}_` : 'guest_';
      try {
        localStorage.setItem(`${userPrefix}vitudy_spaces`, JSON.stringify(updated));
        localStorage.setItem('vitudy_spaces', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (status === 'authenticated' && user?.id) {
      StudySpaceService.saveSpace(newSpace, user.id).then(() => {
        if (newSpace.items && newSpace.items.length > 0) {
          StudySpaceService.upsertItems(newSpace.id, newSpace.items).catch(() => {});
        }
      }).catch(() => {});
    }
    return newId;
  };

  const panBy = (dx: number, dy: number) => {
    if (focusedItemId) {
      triggerFocusNotice();
      return;
    }
    if (isPanLocked) return;
    setTransform(prev => ({
      ...prev,
      x: Math.round(prev.x + dx),
      y: Math.round(prev.y + dy)
    }));
  };

  const zoomBy = (factor: number, originX?: number, originY?: number) => {
    setTransform(prev => {
      const newScale = Math.min(Math.max(Number((prev.scale * factor).toFixed(3)), 0.4), 2.5);
      if (Math.abs(newScale - prev.scale) < 0.0005) return prev;
      if (originX === undefined || originY === undefined) {
        return { ...prev, scale: newScale };
      }
      // Zoom centered on pointer with pixel-grid integer snapping
      const scaleChange = newScale / prev.scale;
      const newX = Math.round(originX - (originX - prev.x) * scaleChange);
      const newY = Math.round(originY - (originY - prev.y) * scaleChange);
      return { x: newX, y: newY, scale: newScale };
    });
  };

  const rotateDeskBy = (deltaDegrees: number, originX?: number, originY?: number) => {
    if (focusedItemId) {
      triggerFocusNotice();
      return;
    }
    if (isPanLocked) return;
    setTransform(prev => {
      const curRot = prev.rotation || 0;
      let newRot = curRot + deltaDegrees;

      // Normalize to (-180, 180]
      while (newRot > 180) newRot -= 360;
      while (newRot <= -180) newRot += 360;

      // Magnetic snap to 0 if within +/- 2.5 degrees
      if (Math.abs(newRot) < 2.5) {
        newRot = 0;
      }

      const effectiveDelta = newRot - curRot;
      if (Math.abs(effectiveDelta) < 0.0001) {
        return { ...prev, rotation: newRot };
      }

      // Pivot around given origin or window center
      const cx = originX !== undefined ? originX : (typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
      const cy = originY !== undefined ? originY : (typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

      const vx = cx - prev.x;
      const vy = cy - prev.y;
      const rad = (effectiveDelta * Math.PI) / 180;

      const unrotVx = vx * Math.cos(rad) - vy * Math.sin(rad);
      const unrotVy = vx * Math.sin(rad) + vy * Math.cos(rad);

      const newX = Math.round(cx - unrotVx);
      const newY = Math.round(cy - unrotVy);

      return {
        ...prev,
        x: newX,
        y: newY,
        rotation: Number(newRot.toFixed(2))
      };
    });
  };

  const resetDeskRotation = () => {
    setTransform(prev => {
      if (!prev.rotation) return prev;
      const curRot = prev.rotation;
      const effectiveDelta = -curRot;
      const cx = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
      const cy = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
      const vx = cx - prev.x;
      const vy = cy - prev.y;
      const rad = (effectiveDelta * Math.PI) / 180;
      const unrotVx = vx * Math.cos(rad) - vy * Math.sin(rad);
      const unrotVy = vx * Math.sin(rad) + vy * Math.cos(rad);
      return {
        ...prev,
        x: Math.round(cx - unrotVx),
        y: Math.round(cy - unrotVy),
        rotation: 0
      };
    });
  };

  const resetView = () => {
    setTransform(DEFAULT_TRANSFORM);
  };

  const selectItem = (id: string | null) => {
    setSelectedItemId(id);
    if (id) bringToFront(id);
  };

  const bringToFront = (id: string) => {
    setMaxZIndex(prev => {
      const nextZ = prev + 1;
      setSpaces(sList =>
        sList.map(s => {
          if (s.id !== activeSpaceId) return s;
          return {
            ...s,
            items: s.items.map(item => (item.id === id ? { ...item, zIndex: nextZ } : item))
          };
        })
      );
      return nextZ;
    });
  };

  const updateItemPosition = (id: string, x: number, y: number) => {
    setSpaces(sList => {
      const nextList = sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          items: s.items.map(item => (item.id === id ? { ...item, x, y } : item))
        };
      });
      syncLocal(nextList);
      return nextList;
    });
  };

  const updateDeskItem = (id: string, patch: Partial<DeskItem>) => {
    setSpaces(sList => {
      const nextList = sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          items: s.items.map(item => (item.id === id ? { ...item, ...patch } : item))
        };
      });
      syncLocal(nextList);
      return nextList;
    });
  };

  const updateItemDimensions = (id: string, width: number, height: number) => {
    setSpaces(sList => {
      const nextList = sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          items: s.items.map(item => (item.id === id ? { ...item, width, height } : item))
        };
      });
      syncLocal(nextList);
      return nextList;
    });
  };

  const updateItemTitle = (id: string, newTitle: string) => {
    setSpaces(sList => {
      const nextList = sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          items: s.items.map(item =>
            item.id === id ? { ...item, title: normalizeNFC(newTitle) } : item
          )
        };
      });
      syncLocal(nextList);
      return nextList;
    });
  };

  const updateItemPageText = (id: string, pageIndex: number, text: string) => {
    setSpaces(sList => {
      const nextList = sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          items: s.items.map(item => {
            if (item.id !== id) return item;
            const updatedPages = [...item.pages];
            if (updatedPages[pageIndex]) {
              updatedPages[pageIndex] = {
                ...updatedPages[pageIndex],
                text: normalizeNFC(text)
              };
            }
            return {
              ...item,
              pages: updatedPages
            };
          })
        };
      });
      syncLocal(nextList);
      return nextList;
    });
  };

  const updateStickyNoteText = (id: string, text: string) => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item =>
            item.id === id ? { ...item, stickyText: text.normalize('NFC') } : item
          )
        };
      })
    );
  };

  const updateStickyNoteColor = (id: string, color: string) => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item =>
            item.id === id ? { ...item, stickyColor: color } : item
          )
        };
      })
    );
  };

  const updateBookCoverColor = (id: string, color: string) => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item =>
            item.id === id ? { ...item, coverColor: color } : item
          )
        };
      })
    );
  };

  const updateStickyNoteTextAlign = (id: string, align: 'left' | 'center' | 'right') => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item =>
            item.id === id ? { ...item, textAlign: align } : item
          )
        };
      })
    );
  };

  const updateStickyNoteIsBold = (id: string, isBold: boolean) => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item =>
            item.id === id ? { ...item, isBold } : item
          )
        };
      })
    );
  };

  const tidyUpDesk = () => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;

        const books = s.items.filter(i => i.type === 'book');
        const papers = s.items.filter(i => i.type === 'paper');
        const notes = s.items.filter(i => i.type === 'sticky_note');
        const others = s.items.filter(i => i.type !== 'book' && i.type !== 'paper' && i.type !== 'sticky_note');

        // Central Book(s)
        let bookOffset = 0;
        const arrangedBooks = books.map(b => {
          const item = { ...b, x: 120 + bookOffset, y: 80, rotation: 0 };
          bookOffset += 1020;
          return item;
        });

        // Papers on the right
        let paperOffsetY = 80;
        const arrangedPapers = papers.map(p => {
          const item = { ...p, x: 1160, y: paperOffsetY, rotation: 0 };
          paperOffsetY += 520;
          return item;
        });

        // Sticky Notes placed neatly on the left in a 2-column grid
        let noteOffsetY = 80;
        const arrangedNotes = notes.map((n, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const item = {
            ...n,
            x: -160 - (col * 240),
            y: noteOffsetY + (row * 220),
            rotation: 0
          };
          return item;
        });

        return {
          ...s,
          items: [...arrangedBooks, ...arrangedPapers, ...arrangedNotes, ...others]
        };
      })
    );

    // Center camera comfortably
    setTransform({
      x: 350,
      y: 120,
      scale: 0.72
    });
  };

  const fitAllToScreen = () => {
    const items = activeSpace.items;
    if (items.length === 0) {
      resetView();
      return;
    }

    const minX = Math.min(...items.map(i => i.x));
    const maxX = Math.max(...items.map(i => i.x + (i.type === 'book' ? 980 : i.type === 'paper' ? 400 : 240)));
    const minY = Math.min(...items.map(i => i.y));
    const maxY = Math.max(...items.map(i => i.y + (i.type === 'book' ? 660 : i.type === 'paper' ? 560 : 220)));

    const contentW = Math.max(maxX - minX, 400);
    const contentH = Math.max(maxY - minY, 300);

    const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;

    const isMobile = winW < 640;
    const pad = isMobile ? 16 : 100;
    const scale = Math.min((winW - pad * 2) / contentW, (winH - pad * 2) / contentH, 1.2);
    const clampedScale = Math.max(isMobile ? 0.35 : 0.25, Math.min(scale, 1.0));

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    setTransform({
      x: winW / 2 - cx * clampedScale,
      y: winH / 2 - cy * clampedScale,
      scale: clampedScale
    });
  };

  const updateItemRotation = (id: string, deltaAngle: number) => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item =>
            item.id === id ? { ...item, rotation: (item.rotation + deltaAngle) % 360 } : item
          )
        };
      })
    );
  };

  const setItemRotation = (id: string, rotation: number) => {
    const normalized = ((rotation % 360) + 360) % 360;
    const finalRot = normalized > 180 ? normalized - 360 : normalized;
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item =>
            item.id === id ? { ...item, rotation: finalRot } : item
          )
        };
      })
    );
  };

  const turnBookPage = (id: string, direction: 'prev' | 'next', maxPages?: number) => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item => {
            if (item.id !== id) return item;
            // For a book spread, turn 2 pages at a time (0, 2, 4, ...)
            const step = item.type === 'book' ? 2 : 1;
            const total = maxPages !== undefined ? maxPages : item.pageCount;
            const limit = Math.max(0, total - 1);
            const newIndex = direction === 'next' 
              ? Math.min(item.currentPageIndex + step, limit)
              : Math.max(item.currentPageIndex - step, 0);
            return { ...item, currentPageIndex: newIndex };
          })
        };
      })
    );
  };

  const setBookPage = (id: string, pageIndex: number) => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item => {
            if (item.id !== id) return item;
            return { ...item, currentPageIndex: Math.min(Math.max(0, pageIndex), item.pageCount - 1) };
          })
        };
      })
    );
  };

  // Combine non-destructive binder merging
  const isViewerSession = () => {
    if (typeof window === 'undefined' || !window.location.search.includes('room=')) return false;
    return new URLSearchParams(window.location.search).get('role') === 'viewer';
  };

  const combineIntoBinder = (targetId: string, draggedId: string): boolean => {
    if (isViewerSession()) return false;
    if (targetId === draggedId) return false;

    const targetItem = activeSpace.items.find(i => i.id === targetId);
    const draggedItem = activeSpace.items.find(i => i.id === draggedId);
    if (!targetItem || !draggedItem) return false;

    // Convert dragged item's pages into target item's pages
    const newPages: PageContent[] = [
      ...targetItem.pages,
      ...draggedItem.pages.map((p, idx) => ({
        ...p,
        id: `p-${Date.now()}-${idx}`,
        pageNumber: targetItem.pages.length + idx + 1
      }))
    ];

    const totalPages = newPages.length;
    // Automatically promote to Book if totalPages >= 5
    const newType = totalPages >= 5 ? 'book' : targetItem.type;

    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items
            .filter(i => i.id !== draggedId)
            .map(i => {
              if (i.id !== targetId) return i;
              return {
                ...i,
                type: newType,
                title: i.isBinder ? i.title : `Sổ tổng hợp: ${i.title}`,
                isBinder: true,
                pageCount: totalPages,
                pages: newPages,
                sourceDocuments: [
                  ...(i.sourceDocuments || [{ id: i.id, title: i.title, pageCount: i.pageCount }]),
                  { id: draggedItem.id, title: draggedItem.title, pageCount: draggedItem.pageCount }
                ]
              };
            })
        };
      })
    );
    return true;
  };

  // Detach a page from a book/binder and place it as a single paper sheet on the desk
  const detachPageFromBinder = (bookId: string, pageIndex: number) => {
    const book = activeSpace.items.find(i => i.id === bookId);
    if (!book || book.pages.length <= 1) return;

    const detachedPage = book.pages[pageIndex];
    if (!detachedPage) return;

    // Remaining pages re-indexed
    const remainingPages = book.pages
      .filter((_, idx) => idx !== pageIndex)
      .map((p, idx) => ({ ...p, pageNumber: idx + 1 }));

    const newPaperSheet: DeskItem = {
      id: `paper-detached-${Date.now()}`,
      type: 'paper',
      title: detachedPage.title || `Trích từ: ${book.title} (Trang ${detachedPage.pageNumber})`,
      x: book.x + 380,
      y: book.y + 20,
      rotation: 0,
      scale: 1,
      zIndex: maxZIndex + 2,
      pageCount: 1,
      currentPageIndex: 0,
      colorTheme: book.colorTheme,
      pages: [{ ...detachedPage, pageNumber: 1 }]
    };

    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: [
            ...s.items.map(item => {
              if (item.id !== bookId) return item;
              const nextCount = remainingPages.length;
              return {
                ...item,
                // Bảo toàn loại sách và bìa da ban đầu kể cả khi số trang < 5
                type: item.type === 'book' ? ('book' as const) : nextCount < 5 ? ('paper' as const) : ('book' as const),
                pageCount: nextCount,
                currentPageIndex: Math.min(item.currentPageIndex, Math.max(0, nextCount - 1)),
                pages: remainingPages
              };
            }),
            newPaperSheet
          ]
        };
      })
    );
  };

  // Convert a loose paper sheet into a bound book with a cover
  const convertPaperToBook = (paperId: string, coverColor = 'brown') => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item => {
            if (item.id !== paperId) return item;
            return {
              ...item,
              type: 'book' as const,
              coverColor,
              colorTheme: coverColor
            };
          })
        };
      })
    );
  };

  const addStickyNote = (text = '', x?: number, y?: number, color = '#fef08a', width?: number, height?: number): string => {
    const noteId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sticky-${Date.now()}`;
    const w = width || 220;
    const h = height || 200;

    let targetX = x;
    let targetY = y;

    if (targetX === undefined || targetY === undefined) {
      const viewW = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const viewH = typeof window !== 'undefined' ? window.innerHeight : 800;
      const curScale = transform.scale || 1;
      const centerX = (-transform.x + (viewW / 2)) / curScale - (w / 2);
      const centerY = (-transform.y + (viewH / 2)) / curScale - (h / 2);
      const jitterX = Math.round(Math.random() * 40 - 20);
      const jitterY = Math.round(Math.random() * 40 - 20);
      targetX = Math.round(centerX + jitterX);
      targetY = Math.round(centerY + jitterY);
    }

    const newNote: DeskItem = {
      id: noteId,
      type: 'sticky_note',
      title: 'Ghi chú',
      x: targetX,
      y: targetY,
      rotation: 0,
      scale: 1,
      zIndex: maxZIndex + 1,
      pageCount: 1,
      currentPageIndex: 0,
      stickyColor: color,
      stickyText: normalizeNFC(text),
      pages: [],
      width: w,
      height: h
    };

    setSpaces(sList => {
      const nextList = sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return { ...s, updatedAt: new Date().toISOString(), items: [...s.items, newNote] };
      });
      syncLocal(nextList);
      return nextList;
    });
    setSelectedItemId(noteId);
    recentAddedItemIdsRef.current.push(noteId);
    return noteId;
  };

  const addCodeBlock = (snippet = '', x?: number, y?: number, language = 'javascript'): string => {
    const codeId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `code-${Date.now()}`;
    const w = 480;
    const h = 200;

    let targetX = x;
    let targetY = y;
    if (targetX === undefined || targetY === undefined) {
      const viewW = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const viewH = typeof window !== 'undefined' ? window.innerHeight : 800;
      const curScale = transform.scale || 1;
      targetX = Math.round((-transform.x + (viewW / 2)) / curScale - (w / 2));
      targetY = Math.round((-transform.y + (viewH / 2)) / curScale - (h / 2));
    }

    const defaultCode = snippet || 'print screen\nhello;';
    const newCodeItem: DeskItem = {
      id: codeId,
      type: 'code_block',
      title: 'Code block',
      x: targetX,
      y: targetY,
      rotation: 0,
      scale: 1,
      zIndex: maxZIndex + 1,
      pageCount: 1,
      currentPageIndex: 0,
      pages: [],
      codeSnippet: defaultCode,
      codeLanguage: language,
      width: w,
      height: h
    };

    setSpaces(sList => {
      const nextList = sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return { ...s, updatedAt: new Date().toISOString(), items: [...s.items, newCodeItem] };
      });
      syncLocal(nextList);
      return nextList;
    });
    setSelectedItemId(codeId);
    recentAddedItemIdsRef.current.push(codeId);
    return codeId;
  };

  const addMindMapNode = (text = '', x?: number, y?: number, parentId?: string, color = '#a855f7'): string => {
    const mindId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mind-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const w = 240;
    const h = 64;

    let targetX = x;
    let targetY = y;
    if (targetX === undefined || targetY === undefined) {
      const viewW = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const viewH = typeof window !== 'undefined' ? window.innerHeight : 800;
      const curScale = transform.scale || 1;
      targetX = Math.round((-transform.x + (viewW / 2)) / curScale - (w / 2));
      targetY = Math.round((-transform.y + (viewH / 2)) / curScale - (h / 2));
    }

    const newNode: DeskItem = {
      id: mindId,
      type: 'mind_map',
      title: 'Ý tưởng',
      x: targetX,
      y: targetY,
      rotation: 0,
      scale: 1,
      zIndex: maxZIndex + 1,
      pageCount: 1,
      currentPageIndex: 0,
      pages: [],
      stickyText: normalizeNFC(text),
      mindMapParentId: parentId,
      mindMapColor: color,
      mindMapShape: 'pill',
      width: w,
      height: h
    };

    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return { ...s, items: [...s.items, newNode] };
      })
    );
    setSelectedItemId(mindId);
    recentAddedItemIdsRef.current.push(mindId);
    return mindId;
  };

  const addSticker = (
    sticker: { type: 'emoji' | 'sticker' | 'gif'; name: string; content: string; url?: string; isSvg?: boolean; width?: number; height?: number },
    x?: number,
    y?: number,
    customWidth?: number,
    customHeight?: number
  ): string => {
    const stickerId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : ensureUUID(`sticker-${Date.now()}`);
    const w = customWidth || sticker.width || (sticker.type === 'gif' ? 260 : sticker.type === 'sticker' ? 140 : 100);
    const h = customHeight || sticker.height || (sticker.type === 'gif' ? 200 : sticker.type === 'sticker' ? 140 : 100);

    let targetX = x;
    let targetY = y;
    if (targetX === undefined || targetY === undefined) {
      const viewW = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const viewH = typeof window !== 'undefined' ? window.innerHeight : 800;
      const curScale = transform.scale || 1;
      targetX = Math.round((-transform.x + (viewW / 2)) / curScale - (w / 2));
      targetY = Math.round((-transform.y + (viewH / 2)) / curScale - (h / 2));
    }

    const newSticker: DeskItem = {
      id: stickerId,
      type: 'sticker',
      title: sticker.name,
      x: targetX,
      y: targetY,
      rotation: 0,
      scale: 1,
      zIndex: maxZIndex + 1,
      pageCount: 1,
      currentPageIndex: 0,
      pages: [],
      stickerData: sticker,
      width: w,
      height: h
    };

    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return { ...s, items: [...s.items, newSticker] };
      })
    );
    setSelectedItemId(stickerId);
    return stickerId;
  };

  const addArtboard = (
    x?: number,
    y?: number,
    width = 480,
    height = 420,
    initialAsset?: import('@/types/boardgame').SavedDrawingAsset
  ): string => {
    const artId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : ensureUUID(`artboard-${Date.now()}`);
    const w = Math.max(320, width);
    const h = Math.max(280, height);

    let targetX = x;
    let targetY = y;
    if (targetX === undefined || targetY === undefined) {
      const viewW = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const viewH = typeof window !== 'undefined' ? window.innerHeight : 800;
      const curScale = transform.scale || 1;
      targetX = Math.round((-transform.x + viewW / 2) / curScale - w / 2);
      targetY = Math.round((-transform.y + viewH / 2) / curScale - h / 2);
    }

    const now = new Date().toISOString();
    const asset: import('@/types/boardgame').SavedDrawingAsset = initialAsset || {
      id: artId,
      name: 'Bản vẽ mới',
      dataUrl: '',
      strokes: [],
      images: [],
      backgroundColor: '#ffffff',
      width: w,
      height: h,
      createdAt: now,
      updatedAt: now,
    };

    const newItem: DeskItem = {
      id: artId,
      type: 'artboard',
      title: asset.name,
      x: targetX,
      y: targetY,
      rotation: 0,
      scale: 1,
      zIndex: maxZIndex + 1,
      pageCount: 1,
      currentPageIndex: 0,
      pages: [],
      width: w,
      height: h,
      artboardData: asset,
    };

    setSpaces(sList => {
      const nextList = sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return { ...s, updatedAt: now, items: [...s.items, newItem] };
      });
      syncLocal(nextList);
      return nextList;
    });
    setSelectedItemId(artId);
    recentAddedItemIdsRef.current.push(artId);
    return artId;
  };

  const updateArtboard = (id: string, asset: import('@/types/boardgame').SavedDrawingAsset) => {
    setSpaces(sList => {
      const nextList = sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          items: s.items.map(item =>
            item.id === id ? { ...item, title: asset.name, artboardData: asset } : item
          ),
        };
      });
      syncLocal(nextList);
      return nextList;
    });
  };

  const addBoardGame = (
    pkg: import('@/types/boardgame').BoardGamePackage,
    x?: number,
    y?: number
  ): string => {
    const gameItemId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : ensureUUID(`game-${Date.now()}`);
    const w = pkg.mapConfig.width || 770;
    const h = pkg.mapConfig.height || 770;

    let targetX = x;
    let targetY = y;
    if (targetX === undefined || targetY === undefined) {
      const viewW = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const viewH = typeof window !== 'undefined' ? window.innerHeight : 800;
      const curScale = transform.scale || 1;
      targetX = Math.round((-transform.x + viewW / 2) / curScale - w / 2);
      targetY = Math.round((-transform.y + viewH / 2) / curScale - h / 2);
    }

    const newItem: DeskItem = {
      id: gameItemId,
      type: 'board_game',
      title: pkg.title,
      x: targetX,
      y: targetY,
      rotation: 0,
      scale: 1,
      zIndex: maxZIndex + 1,
      pageCount: 1,
      currentPageIndex: 0,
      pages: [],
      width: w,
      height: h,
      boardGameData: pkg,
    };

    setSpaces(sList => {
      const nextList = sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return { ...s, updatedAt: new Date().toISOString(), items: [...s.items, newItem] };
      });
      syncLocal(nextList);
      return nextList;
    });
    setSelectedItemId(gameItemId);
    recentAddedItemIdsRef.current.push(gameItemId);
    return gameItemId;
  };

  const updateBoardGame = (id: string, pkg: import('@/types/boardgame').BoardGamePackage) => {
    setSpaces(sList => {
      const nextList = sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          items: s.items.map(item =>
            item.id === id
              ? {
                  ...item,
                  title: pkg.title,
                  width: pkg.mapConfig.width,
                  height: pkg.mapConfig.height,
                  boardGameData: pkg,
                }
              : item
          ),
        };
      });
      syncLocal(nextList);
      return nextList;
    });
  };

  const updateCodeBlock = (id: string, snippet: string, language?: string) => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item =>
            item.id === id
              ? { ...item, codeSnippet: snippet, codeLanguage: language ?? item.codeLanguage }
              : item
          )
        };
      })
    );
  };

  const updateMindMapNode = (id: string, text: string, color?: string, shape?: 'pill' | 'rectangle' | 'cloud') => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item =>
            item.id === id
              ? {
                  ...item,
                  stickyText: normalizeNFC(text),
                  mindMapColor: color ?? item.mindMapColor,
                  mindMapShape: shape ?? item.mindMapShape
                }
              : item
          )
        };
      })
    );
  };

  const addIntelineThread = (params: {
    sourceItemId: string;
    sourcePageNumber: number;
    selectedText: string;
    question: string;
    answer: string;
    sourceOffset?: { x: number; y: number };
  }): string => {
    const sourceItem = activeSpace.items.find(i => i.id === params.sourceItemId);
    const placeX = sourceItem ? sourceItem.x + (sourceItem.type === 'book' ? 750 : 390) : 500;
    const placeY = sourceItem ? sourceItem.y + 30 : 300;

    const stickyId = `sticky-inteline-${Date.now()}`;
    const stickyText = `[INTELINE TRÍ TUỆ TỪNG DÒNG]\n"${params.selectedText.slice(0, 90)}..."\n\nTrả lời:\n${params.answer}`;

    const newSticky: DeskItem = {
      id: stickyId,
      type: 'sticky_note',
      title: 'Inteline Note',
      x: placeX,
      y: placeY,
      rotation: Math.floor(Math.random() * 6) - 3,
      scale: 1,
      zIndex: maxZIndex + 3,
      pageCount: 1,
      currentPageIndex: 0,
      stickyColor: '#fed7aa',
      stickyText,
      pages: []
    };

    const threadId = `thread-${Date.now()}`;
    const newThread: IntelineThread = {
      id: threadId,
      sourceItemId: params.sourceItemId,
      sourcePageNumber: params.sourcePageNumber,
      selectedText: params.selectedText,
      sourceOffset: params.sourceOffset || { x: 200, y: 150 },
      targetStickyId: stickyId,
      question: params.question,
      answer: params.answer,
      createdAt: new Date().toISOString()
    };

    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: [...s.items, newSticky],
          threads: [...(s.threads || []), newThread]
        };
      })
    );

    return stickyId;
  };

  const addUploadedDocument = (
    title: string,
    rawPages: { title?: string; text: string; image?: string }[],
    options?: {
      spreadsheetData?: import('@/types/studyspace').SpreadsheetData;
      presentationData?: import('@/types/studyspace').PresentationData;
    }
  ) => {
    if (isViewerSession()) return;
    const pageCount = rawPages.length;
    const type: import('@/types/studyspace').ItemType = options?.spreadsheetData
      ? 'spreadsheet'
      : options?.presentationData
      ? 'presentation'
      : pageCount < 5
      ? 'paper'
      : 'book';

    const pages: PageContent[] = rawPages.map((p, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      pageNumber: idx + 1,
      title: normalizeNFC(p.title || `Trang ${idx + 1}`),
      text: normalizeNFC(p.text),
      image: p.image
    }));

    const newItem: DeskItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `doc-${Date.now()}`,
      type,
      title: normalizeNFC(title),
      x: 320 + Math.random() * 80,
      y: 200 + Math.random() * 60,
      rotation: type === 'spreadsheet' || type === 'presentation' ? 0 : Math.floor(Math.random() * 6) - 3,
      scale: 1,
      zIndex: maxZIndex + 1,
      pageCount,
      currentPageIndex: 0,
      pages,
      width: type === 'spreadsheet' ? 580 : type === 'presentation' ? 620 : undefined,
      height: type === 'spreadsheet' ? 400 : type === 'presentation' ? 400 : undefined,
      spreadsheetData: options?.spreadsheetData,
      presentationData: options?.presentationData,
      colorTheme:
        type === 'spreadsheet'
          ? '#059669'
          : type === 'presentation'
          ? '#E0562D'
          : type === 'book'
          ? '#1e3a8a'
          : '#047857'
    };

    setSpaces(sList => {
      const nextList = sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return { ...s, updatedAt: new Date().toISOString(), items: [...s.items, newItem] };
      });
      syncLocal(nextList);
      return nextList;
    });
  };

  const addMarketItemToSpace = (spaceId: string, marketItem: import('@/data/marketMockData').MarketItem) => {
    let newItem: DeskItem;
    const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}`;

    if (marketItem.type === 'exam' && marketItem.examQuestions && marketItem.examQuestions.length > 0) {
      const examId = generateId();
      newItem = {
        id: examId,
        type: 'paper',
        title: normalizeNFC(marketItem.title),
        x: 380 + Math.random() * 40,
        y: 160 + Math.random() * 40,
        rotation: 0,
        scale: 1,
        zIndex: maxZIndex + 2,
        pageCount: 1,
        currentPageIndex: 0,
        isExamSheet: true,
        stickyColor: '#bae6fd',
        width: 380,
        height: 490,
        examData: {
          timeLimitMinutes: 20,
          remainingSeconds: 20 * 60,
          questions: marketItem.examQuestions,
          userAnswers: {},
          isGraded: false,
          totalQuestions: marketItem.examQuestions.length
        },
        pages: [
          {
            id: generateId(),
            pageNumber: 1,
            title: normalizeNFC(marketItem.title),
            text: normalizeNFC(`${marketItem.summary}\n\n${marketItem.previewText}`)
          }
        ]
      };
    } else {
      const isBook = marketItem.type === 'book';
      const rawPages = marketItem.pages && marketItem.pages.length > 0
        ? marketItem.pages
        : [
            {
              title: marketItem.title,
              text: `${marketItem.summary}\n\n${marketItem.previewText}\n\n[Tài liệu đã mở từ tác giả ${marketItem.author}]`
            }
          ];
      
      const pages: PageContent[] = rawPages.map((p: any, idx: number) => ({
        id: generateId(),
        pageNumber: idx + 1,
        title: normalizeNFC(p.title || `Trang ${idx + 1}`),
        text: normalizeNFC(p.text),
        image: p.image
      }));

      const docId = generateId();
      newItem = {
        id: docId,
        type: isBook ? 'book' : 'paper',
        title: normalizeNFC(marketItem.title),
        x: 320 + Math.random() * 60,
        y: 180 + Math.random() * 40,
        rotation: 0,
        scale: 1,
        zIndex: maxZIndex + 1,
        pageCount: pages.length,
        currentPageIndex: 0,
        pages,
        colorTheme: isBook ? '#1e3a8a' : '#047857'
      };
    }

    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== spaceId) return s;
        return {
          ...s,
          lastOpenedAt: new Date().toISOString(),
          items: [...s.items, newItem]
        };
      })
    );

    setActiveSpaceId(spaceId);
    setSelectedItemId(newItem.id);

    // Lưu vào cloud database nếu đã đăng nhập
    if (status === 'authenticated' && user?.id) {
      StudySpaceService.upsertItems(spaceId, [newItem]).catch(() => {});
    }
  };

  const addExamSheet = (
    title: string, 
    questions: import('@/types/studyspace').ExamQuestion[], 
    timeLimitMinutes = 15,
    pos?: { x: number; y: number }
  ): string => {
    const sheetId = `exam-${Date.now()}`;
    const NOTE_COLORS = ['#fef08a', '#fed7aa', '#bbf7d0', '#bae6fd', '#fbcfe8'];
    const randomColor = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];

    const examItem: DeskItem = {
      id: sheetId,
      type: 'paper',
      title: normalizeNFC(title),
      x: pos ? pos.x : (380 + Math.random() * 40),
      y: pos ? pos.y : (160 + Math.random() * 40),
      rotation: 0,
      scale: 1,
      zIndex: maxZIndex + 2,
      pageCount: 1,
      currentPageIndex: 0,
      isExamSheet: true,
      stickyColor: randomColor,
      width: 380,
      height: 490,
      examData: {
        timeLimitMinutes,
        remainingSeconds: timeLimitMinutes * 60,
        questions,
        userAnswers: {},
        isGraded: false,
        totalQuestions: questions.length
      },
      pages: [{
        id: `p-exam-${sheetId}`,
        pageNumber: 1,
        title: normalizeNFC(title),
        text: questions.map((q, idx) => `Câu ${idx + 1}: ${q.question}`).join('\n\n')
      }]
    };

    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return { ...s, items: [...s.items, examItem] };
      })
    );

    return sheetId;
  };

  const updateExamAnswer = (itemId: string, questionId: string, answerIdx: number) => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item => {
            if (item.id !== itemId || !item.examData) return item;
            return {
              ...item,
              examData: {
                ...item.examData,
                userAnswers: {
                  ...item.examData.userAnswers,
                  [questionId]: answerIdx
                }
              }
            };
          })
        };
      })
    );
  };

  const gradeExam = (itemId: string) => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item => {
            if (item.id !== itemId || !item.examData) return item;
            const { questions, userAnswers } = item.examData;
            let correct = 0;
            questions.forEach(q => {
              if (userAnswers[q.id] === q.correctAnswer) {
                correct++;
              }
            });
            const score = Math.round((correct / (questions.length || 1)) * 100) / 10;
            let teacherNote = 'Cần cố gắng thêm ở các câu lý thuyết!';
            if (score >= 9) teacherNote = 'Xuất sắc! Nắm rất vững toàn bộ trọng tâm bài học.';
            else if (score >= 7) teacherNote = 'Khá tốt! Đã nắm được các khái niệm cốt lõi.';
            else if (score >= 5) teacherNote = 'Đạt yêu cầu cơ bản. Hãy xem lại các câu sai.';

            return {
              ...item,
              examData: {
                ...item.examData,
                isGraded: true,
                score,
                teacherNote
              }
            };
          })
        };
      })
    );
  };

  const resetExam = (itemId: string) => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item => {
            if (item.id !== itemId || !item.examData) return item;
            return {
              ...item,
              examData: {
                ...item.examData,
                isGraded: false,
                userAnswers: {},
                score: undefined,
                teacherNote: undefined
              }
            };
          })
        };
      })
    );
  };

  const removeDeskItem = (id: string) => {
    if (isViewerSession()) return;
    if (status === 'authenticated') {
      StudySpaceService.deleteItem(id);
    }
    setSpaces(sList => {
      const nextList = sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          items: cleanupDeskItemsOnDelete(s.items, id),
          threads: (s.threads || []).filter(t => t.sourceItemId !== id && t.targetStickyId !== id),
        };
      });
      syncLocal(nextList);
      return nextList;
    });
    setStrokes(prev => prev.filter(s => s.attachedToItemId !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const togglePanLock = () => {
    setIsPanLocked(prev => !prev);
  };

  return (
    <StudySpaceContext.Provider
      value={{
        spaces,
        activeSpaceId,
        activeSpace,
        transform,
        selectedItemId,
        searchQuery,
        isPanLocked,
        focusedItemId,
        isFocusNoticeVisible,
        enterFocusMode,
        exitFocusMode,
        triggerFocusNotice,
        switchSpace,
        toggleStarSpace,
        createSpace,
        createSpaceFromTemplate,
        deleteSpace,
        renameSpace,
        duplicateSpace,
        setTransform,
        panBy,
        zoomBy,
        rotateDeskBy,
        resetDeskRotation,
        resetView,
        selectItem,
        updateItemPosition,
        updateItemDimensions,
        updateItemRotation,
        updateItemTitle,
        updateItemPageText,
        setItemRotation,
        bringToFront,
        turnBookPage,
        setBookPage,
        combineIntoBinder,
        detachPageFromBinder,
        convertPaperToBook,
        updateStickyNoteText,
        updateStickyNoteColor,
        updateBookCoverColor,
        updateStickyNoteTextAlign,
        updateStickyNoteIsBold,
        tidyUpDesk,
        fitAllToScreen,
        addStickyNote,
        addCodeBlock,
        addMindMapNode,
        addSticker,
        addArtboard,
        updateArtboard,
        addBoardGame,
        updateBoardGame,
        activeGamePenTool,
        setActiveGamePenTool,
        updateCodeBlock,
        updateMindMapNode,
        addUploadedDocument,
        addMarketItemToSpace,
        addExamSheet,
        updateExamAnswer,
        gradeExam,
        resetExam,
        removeDeskItem,
        updateDeskItem,
        setSearchQuery,
        togglePanLock,
        activeTool,
        setActiveTool,
        penColor,
        setPenColor,
        penWidthLevel,
        setPenWidthLevel,
        stickyCreationColor,
        setStickyCreationColor,
        stickyCreationTemplate,
        setStickyCreationTemplate,
        strokes,
        currentStroke: null,
        startStroke,
        appendPoint,
        snapCurrentStroke,
        revertCurrentStroke,
        finishStroke,
        cancelStroke,
        isFingerDrawingEnabled,
        setIsFingerDrawingEnabled,
        addStroke,
        undoStroke,
        redoStroke,
        redoStack,
        clearStrokes,
        removeStrokeById,
        removeStrokesInBox,
        updateThreadSourceOffset,
        threads: activeSpace.threads || [],
        addIntelineThread,
        isViewRotateMode,
        setIsViewRotateMode,
        saveStatus,
        saveCurrentSpaceImmediately,
        isDeskReady: isLoaded && !isSwitchingSpace
      }}
    >
      {children}
    </StudySpaceContext.Provider>
  );
}

export function useStudySpace() {
  const context = useContext(StudySpaceContext);
  if (!context) {
    throw new Error('useStudySpace must be used within a StudySpaceProvider');
  }
  return context;
}
