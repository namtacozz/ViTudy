export type ItemType = 'paper' | 'book' | 'sticky_note' | 'roadmap';

export interface PageContent {
  id: string;
  pageNumber: number;
  title?: string;
  text: string;
  image?: string;
  notes?: string;
  highlights?: {
    id: string;
    text: string;
    color: string;
  }[];
}

export interface DeskItem {
  id: string;
  type: ItemType;
  title: string;
  x: number;
  y: number;
  rotation: number; // in degrees
  scale: number;
  zIndex: number;
  pageCount: number;
  currentPageIndex: number; // for book spread, points to left or current page
  pages: PageContent[];
  colorTheme?: string;
  isBinder?: boolean; // Combined notebook
  sourceDocuments?: { id: string; title: string; pageCount: number }[];
  stickyText?: string;
  stickyColor?: string;
  isExamSheet?: boolean;
}

export interface IntelineThread {
  id: string;
  sourceItemId: string;
  sourcePageNumber: number;
  selectedText: string;
  sourceOffset?: { x: number; y: number };
  targetStickyId: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface StudySpace {
  id: string;
  name: string;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  items: DeskItem[];
  threads?: IntelineThread[];
}

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}
