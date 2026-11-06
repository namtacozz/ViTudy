'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeskItem, StudySpace, CanvasTransform, PageContent, IntelineThread } from '@/types/studyspace';
import { INITIAL_SPACES } from '@/data/mockSpaces';

interface StudySpaceContextType {
  spaces: StudySpace[];
  activeSpaceId: string;
  activeSpace: StudySpace;
  threads: IntelineThread[];
  transform: CanvasTransform;
  selectedItemId: string | null;
  searchQuery: string;
  isPanLocked: boolean;
  switchSpace: (spaceId: string) => void;
  createSpace: (name: string, subject: string) => void;
  setTransform: React.Dispatch<React.SetStateAction<CanvasTransform>>;
  panBy: (dx: number, dy: number) => void;
  zoomBy: (factor: number, originX?: number, originY?: number) => void;
  resetView: () => void;
  selectItem: (id: string | null) => void;
  updateItemPosition: (id: string, x: number, y: number) => void;
  updateItemRotation: (id: string, deltaAngle: number) => void;
  bringToFront: (id: string) => void;
  turnBookPage: (id: string, direction: 'prev' | 'next') => void;
  setBookPage: (id: string, pageIndex: number) => void;
  combineIntoBinder: (targetId: string, draggedId: string) => boolean;
  detachPageFromBinder: (bookId: string, pageIndex: number) => void;
  addStickyNote: (text?: string, x?: number, y?: number, color?: string) => string;
  addUploadedDocument: (title: string, pages: { title?: string; text: string }[]) => void;
  removeDeskItem: (id: string) => void;
  setSearchQuery: (query: string) => void;
  togglePanLock: () => void;
  addIntelineThread: (params: {
    sourceItemId: string;
    sourcePageNumber: number;
    selectedText: string;
    question: string;
    answer: string;
    sourceOffset?: { x: number; y: number };
  }) => string;
}

const DEFAULT_TRANSFORM: CanvasTransform = {
  x: 0,
  y: 0,
  scale: 1
};

const StudySpaceContext = createContext<StudySpaceContextType | null>(null);

export function StudySpaceProvider({ children }: { children: React.ReactNode }) {
  const [spaces, setSpaces] = useState<StudySpace[]>(INITIAL_SPACES);
  const [activeSpaceId, setActiveSpaceId] = useState<string>(INITIAL_SPACES[0].id);
  const [transform, setTransform] = useState<CanvasTransform>(DEFAULT_TRANSFORM);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPanLocked, setIsPanLocked] = useState(false);
  const [maxZIndex, setMaxZIndex] = useState(20);

  // Load spaces from localStorage on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vitudy_spaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSpaces(parsed);
          setActiveSpaceId(parsed[0].id);
        }
      }
    } catch {
      // fallback
    }
  }, []);

  // Save spaces to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vitudy_spaces', JSON.stringify(spaces));
    } catch {
      // ignore
    }
  }, [spaces]);

  const activeSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];

  const switchSpace = (spaceId: string) => {
    if (spaces.some(s => s.id === spaceId)) {
      setActiveSpaceId(spaceId);
      setSelectedItemId(null);
      resetView();
    }
  };

  const createSpace = (name: string, subject: string) => {
    const newSpace: StudySpace = {
      id: `space-${Date.now()}`,
      name,
      subject,
      description: `Không gian học tập bộ môn ${subject}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: []
    };
    setSpaces(prev => [...prev, newSpace]);
    setActiveSpaceId(newSpace.id);
  };

  const panBy = (dx: number, dy: number) => {
    if (isPanLocked) return;
    setTransform(prev => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy
    }));
  };

  const zoomBy = (factor: number, originX?: number, originY?: number) => {
    setTransform(prev => {
      const newScale = Math.min(Math.max(prev.scale * factor, 0.4), 2.2);
      if (originX === undefined || originY === undefined) {
        return { ...prev, scale: newScale };
      }
      // Zoom centered on pointer
      const scaleChange = newScale / prev.scale;
      const newX = originX - (originX - prev.x) * scaleChange;
      const newY = originY - (originY - prev.y) * scaleChange;
      return { x: newX, y: newY, scale: newScale };
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
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item => (item.id === id ? { ...item, x, y } : item))
        };
      })
    );
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

  const turnBookPage = (id: string, direction: 'prev' | 'next') => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return {
          ...s,
          items: s.items.map(item => {
            if (item.id !== id) return item;
            // For a book spread, turn 2 pages at a time (0, 2, 4, ...)
            const step = item.type === 'book' ? 2 : 1;
            const newIndex = direction === 'next' 
              ? Math.min(item.currentPageIndex + step, Math.max(0, item.pageCount - 1))
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
  const combineIntoBinder = (targetId: string, draggedId: string): boolean => {
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
      rotation: Math.floor(Math.random() * 8) - 4,
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
                type: nextCount < 5 ? ('paper' as const) : ('book' as const),
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

  const addStickyNote = (text = 'Ghi chú học tập mới...', x = 400, y = 300, color = '#fef08a'): string => {
    const noteId = `sticky-${Date.now()}`;
    const newNote: DeskItem = {
      id: noteId,
      type: 'sticky_note',
      title: 'Ghi chú',
      x,
      y,
      rotation: Math.floor(Math.random() * 12) - 6,
      scale: 1,
      zIndex: maxZIndex + 1,
      pageCount: 1,
      currentPageIndex: 0,
      stickyColor: color,
      stickyText: text,
      pages: []
    };

    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return { ...s, items: [...s.items, newNote] };
      })
    );
    return noteId;
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
    const stickyText = `📌 [INTELINE TRÍ TUỆ TỪNG DÒNG]\n"${params.selectedText.slice(0, 90)}..."\n\n💡 Trả lời:\n${params.answer}`;

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

  const addUploadedDocument = (title: string, rawPages: { title?: string; text: string }[]) => {
    const pageCount = rawPages.length;
    const type: 'paper' | 'book' = pageCount < 5 ? 'paper' : 'book';

    const pages: PageContent[] = rawPages.map((p, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      pageNumber: idx + 1,
      title: p.title || `Trang ${idx + 1}`,
      text: p.text
    }));

    const newItem: DeskItem = {
      id: `doc-${Date.now()}`,
      type,
      title,
      x: 320 + Math.random() * 80,
      y: 200 + Math.random() * 60,
      rotation: Math.floor(Math.random() * 6) - 3,
      scale: 1,
      zIndex: maxZIndex + 1,
      pageCount,
      currentPageIndex: 0,
      pages,
      colorTheme: type === 'book' ? '#1e3a8a' : '#047857'
    };

    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return { ...s, items: [...s.items, newItem] };
      })
    );
  };

  const removeDeskItem = (id: string) => {
    setSpaces(sList =>
      sList.map(s => {
        if (s.id !== activeSpaceId) return s;
        return { ...s, items: s.items.filter(item => item.id !== id) };
      })
    );
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
        switchSpace,
        createSpace,
        setTransform,
        panBy,
        zoomBy,
        resetView,
        selectItem,
        updateItemPosition,
        updateItemRotation,
        bringToFront,
        turnBookPage,
        setBookPage,
        combineIntoBinder,
        detachPageFromBinder,
        addStickyNote,
        addUploadedDocument,
        removeDeskItem,
        setSearchQuery,
        togglePanLock,
        threads: activeSpace.threads || [],
        addIntelineThread
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
