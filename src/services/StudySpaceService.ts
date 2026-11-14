import { getSupabase } from '@/lib/supabase';
import { StudySpace, DeskItem, DrawingStroke, IntelineThread, PageContent } from '@/types/studyspace';
import { Database, Json } from '@/types/database.types';
import { sanitizeDocumentText } from './OfficeParserService';

type DeskDocumentRow = Database['public']['Tables']['desk_documents']['Row'];
type DeskDocumentInsert = Database['public']['Tables']['desk_documents']['Insert'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ensureUUID(id: string): string {
  if (UUID_REGEX.test(id)) return id;
  if (!id) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return '00000000-0000-4000-8000-000000000000';
  }
  // Deterministic 128-bit hash so legacy IDs (e.g. sticker-..., stroke-...) always map to the same UUID
  const h = [0x811c9dc5, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35];
  for (let i = 0; i < id.length; i++) {
    const c = id.charCodeAt(i);
    h[i & 3] = Math.imul(h[i & 3] ^ c, 0x01000193) >>> 0;
    h[(i + 1) & 3] = (h[(i + 1) & 3] + ((h[i & 3] << 5) | (h[i & 3] >>> 27))) >>> 0;
  }
  const hex = h.map(v => v.toString(16).padStart(8, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function deskItemToRow(item: DeskItem, spaceId: string): DeskDocumentInsert {
  const safeItemId = ensureUUID(item.id);
  const safeSpaceId = ensureUUID(spaceId);

  let sourceDocsJson: Json | null = (item.sourceDocuments as unknown as Json) || null;
  if (item.type === 'mind_map' && item.mindMapParentId) {
    sourceDocsJson = { parentId: item.mindMapParentId } as unknown as Json;
  }

  let extraDataJson: Json | null = (item.examData as unknown as Json) || null;
  if (item.type === 'sticker' && item.stickerData) {
    extraDataJson = item.stickerData as unknown as Json;
  } else if (item.type === 'artboard' && item.artboardData) {
    extraDataJson = item.artboardData as unknown as Json;
  } else if (item.type === 'board_game' && item.boardGameData) {
    extraDataJson = item.boardGameData as unknown as Json;
  }

  return {
    id: safeItemId,
    space_id: safeSpaceId,
    title: item.title,
    item_type: item.type as DeskDocumentRow['item_type'],
    x: item.x,
    y: item.y,
    rotation: item.rotation,
    scale: item.scale,
    z_index: item.zIndex,
    page_count: item.pageCount,
    current_page_index: item.currentPageIndex,
    is_binder: item.isBinder ?? false,
    color_theme: item.codeLanguage || item.colorTheme || null,
    cover_color: item.coverColor || null,
    sticky_text: item.codeSnippet || item.stickyText || null,
    sticky_color: item.mindMapColor || item.stickyColor || null,
    text_align: item.textAlign || null,
    is_bold: item.isBold ?? false,
    is_exam_sheet: item.isExamSheet ?? false,
    exam_data: extraDataJson,
    source_documents: sourceDocsJson,
    width: item.width || null,
    height: item.height || null,
  };
}

export function rowToDeskItem(row: DeskDocumentRow, pages: PageContent[] = []): DeskItem {
  const safePages = (pages || []).map(p => ({
    ...p,
    title: p.title ? sanitizeDocumentText(p.title) : p.title,
    text: sanitizeDocumentText(p.text || ''),
  }));
  return {
    id: row.id,
    type: row.item_type,
    title: sanitizeDocumentText(row.title || ''),
    x: row.x,
    y: row.y,
    rotation: row.rotation,
    scale: row.scale,
    zIndex: row.z_index,
    pageCount: row.page_count,
    currentPageIndex: row.current_page_index,
    pages: safePages,
    colorTheme: row.color_theme || undefined,
    coverColor: row.cover_color || undefined,
    isBinder: row.is_binder,
    stickyText: row.sticky_text || undefined,
    stickyColor: row.sticky_color || undefined,
    textAlign: row.text_align || undefined,
    isBold: row.is_bold,
    isExamSheet: row.is_exam_sheet,
    examData: (row.is_exam_sheet || row.item_type === 'exam_sheet' || row.item_type === 'paper') && row.exam_data ? (row.exam_data as any) : undefined,
    sourceDocuments: row.item_type !== 'mind_map' && row.source_documents ? (row.source_documents as any) : undefined,
    width: row.width || undefined,
    height: row.height || undefined,
    codeSnippet: row.item_type === 'code_block' ? (row.sticky_text || undefined) : undefined,
    codeLanguage: row.item_type === 'code_block' ? (row.color_theme || 'javascript') : undefined,
    mindMapColor: row.item_type === 'mind_map' ? (row.sticky_color || undefined) : undefined,
    mindMapShape: row.item_type === 'mind_map' ? (row.color_theme as any) : undefined,
    mindMapParentId: row.item_type === 'mind_map' && row.source_documents ? (row.source_documents as any)?.parentId : undefined,
    stickerData: row.item_type === 'sticker' && row.exam_data ? (row.exam_data as any) : undefined,
    artboardData: (row.item_type as string) === 'artboard' && row.exam_data ? (row.exam_data as any) : undefined,
    boardGameData: (row.item_type as string) === 'board_game' && row.exam_data ? (row.exam_data as any) : undefined,
  };
}

export class StudySpaceService {
  static async loadSpaces(userId: string): Promise<StudySpace[]> {
    const supabase = getSupabase();
    if (!supabase || !userId) return [];

    try {
      // 1. Load all study spaces for user
      const { data: spacesData, error: spacesError } = await supabase
        .from('study_spaces')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: true });

      if (spacesError || !spacesData || spacesData.length === 0) return [];

      const spaceIds = spacesData.map(s => s.id);

      // 2. Batch-load all documents & threads across all spaces in parallel (eliminates N+1 round-trips)
      const [{ data: allDocsData }, { data: allThreadsData }] = await Promise.all([
        supabase
          .from('desk_documents')
          .select('*')
          .in('space_id', spaceIds)
          .order('z_index', { ascending: true }),
        supabase
          .from('inteline_threads')
          .select('*')
          .in('space_id', spaceIds),
      ]);

      // 3. Batch-load all document pages in one query
      const allDocIds = (allDocsData || []).map(d => d.id);
      const pagesByDocId: Record<string, PageContent[]> = {};

      if (allDocIds.length > 0) {
        const { data: pagesData } = await supabase
          .from('document_pages')
          .select('*')
          .in('document_id', allDocIds)
          .order('page_number', { ascending: true });

        if (pagesData) {
          for (const p of pagesData) {
            if (!pagesByDocId[p.document_id]) {
              pagesByDocId[p.document_id] = [];
            }
            pagesByDocId[p.document_id].push({
              id: p.id,
              pageNumber: p.page_number,
              title: p.title || undefined,
              text: p.content,
            });
          }
        }
      }

      const docsBySpaceId: Record<string, DeskItem[]> = {};
      for (const row of allDocsData || []) {
        if (!docsBySpaceId[row.space_id]) docsBySpaceId[row.space_id] = [];
        docsBySpaceId[row.space_id].push(
          rowToDeskItem(row as DeskDocumentRow, pagesByDocId[row.id] || [])
        );
      }

      const threadsBySpaceId: Record<string, IntelineThread[]> = {};
      for (const t of allThreadsData || []) {
        if (!threadsBySpaceId[t.space_id]) threadsBySpaceId[t.space_id] = [];
        threadsBySpaceId[t.space_id].push({
          id: t.id,
          sourceItemId: t.source_item_id,
          sourcePageNumber: t.source_page_number,
          selectedText: t.selected_text,
          sourceOffset: t.source_offset ? (t.source_offset as any) : undefined,
          targetStickyId: t.target_sticky_id,
          question: t.question,
          answer: t.answer,
          createdAt: t.created_at,
        });
      }

      return spacesData.map(spaceRow => ({
        id: spaceRow.id,
        name: spaceRow.name,
        subject: spaceRow.subject,
        description: '',
        createdAt: spaceRow.created_at,
        updatedAt: spaceRow.updated_at,
        items: docsBySpaceId[spaceRow.id] || [],
        threads: threadsBySpaceId[spaceRow.id] || [],
      }));
    } catch (err) {
      console.warn('Lỗi loadSpaces từ Supabase Cloud:', err);
      return [];
    }
  }

  static async saveSpace(space: StudySpace, userId: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase || !userId) return;

    try {
      const safeSpaceId = ensureUUID(space.id);
      await supabase.from('study_spaces').upsert({
        id: safeSpaceId,
        owner_id: userId,
        name: space.name,
        subject: space.subject,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Lỗi saveSpace:', err);
    }
  }

  static async deleteSpace(spaceId: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase || !spaceId) return;

    try {
      const safeSpaceId = ensureUUID(spaceId);
      // Xóa dữ liệu con trước để tránh lỗi FK nếu bảng chưa cấu hình ON DELETE CASCADE
      await Promise.allSettled([
        supabase.from('desk_strokes').delete().eq('space_id', safeSpaceId),
        supabase.from('desk_documents').delete().eq('space_id', safeSpaceId),
        supabase.from('study_threads').delete().eq('space_id', safeSpaceId),
        supabase.from('study_space_members').delete().eq('space_id', safeSpaceId),
      ]);
      const { error } = await supabase.from('study_spaces').delete().eq('id', safeSpaceId);
      if (error && safeSpaceId !== spaceId) {
        await supabase.from('study_spaces').delete().eq('id', spaceId);
      } else if (error) {
        console.warn('Lỗi deleteSpace Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Lỗi deleteSpace:', err);
    }
  }

  static async upsertItems(spaceId: string, items: DeskItem[]): Promise<void> {
    const supabase = getSupabase();
    if (!supabase || !spaceId || items.length === 0) return;

    try {
      const safeSpaceId = ensureUUID(spaceId);
      const rows = items.map(item => deskItemToRow(item, safeSpaceId));
      const { error: upsertErr } = await supabase.from('desk_documents').upsert(rows);
      if (upsertErr) {
        console.warn('Lỗi upsert desk_documents:', upsertErr.message, upsertErr.details);
      }

      // Upsert document pages if provided
      for (const item of items) {
        if (item.pages && item.pages.length > 0) {
          const safeItemId = ensureUUID(item.id);
          const pageRows = item.pages.map(p => ({
            id: p.id.includes('-') && p.id.length === 36 ? p.id : undefined,
            document_id: safeItemId,
            page_number: p.pageNumber,
            title: p.title ? sanitizeDocumentText(p.title) : null,
            content: sanitizeDocumentText(p.text || ''),
          }));
          await supabase.from('document_pages').upsert(pageRows, { onConflict: 'document_id,page_number' });
        }
      }
    } catch (err) {
      console.warn('Lỗi upsertItems:', err);
    }
  }

  static async deleteItem(itemId: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase || !itemId) return;

    try {
      const safeItemId = ensureUUID(itemId);
      await Promise.all([
        supabase.from('desk_documents').delete().eq('id', safeItemId),
        supabase.from('document_pages').delete().eq('document_id', safeItemId),
        supabase.from('inteline_threads').delete().or(`source_item_id.eq.${safeItemId},target_sticky_id.eq.${safeItemId}`),
        supabase.from('desk_drawings').delete().eq('attached_to_item_id', safeItemId),
      ]);
    } catch (err) {
      console.warn('Lỗi deleteItem:', err);
    }
  }

  static async loadStrokes(spaceId: string): Promise<DrawingStroke[]> {
    const supabase = getSupabase();
    if (!supabase || !spaceId) return [];

    try {
      const safeSpaceId = ensureUUID(spaceId);
      const { data, error } = await supabase
        .from('desk_drawings')
        .select('*')
        .eq('space_id', safeSpaceId);

      if (error || !data) return [];

      return data.map(row => ({
        id: row.id,
        color: row.color,
        width: row.width,
        isHighlighter: row.is_highlighter,
        points: (row.points as any) || [],
        attachedToItemId: row.attached_to_item_id || undefined,
      }));
    } catch (err) {
      console.warn('Lỗi loadStrokes:', err);
      return [];
    }
  }

  static async clearStrokes(spaceId: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase || !spaceId) return;
    try {
      const safeSpaceId = ensureUUID(spaceId);
      await supabase.from('desk_drawings').delete().eq('space_id', safeSpaceId);
    } catch (err) {
      console.warn('Lỗi clearStrokes:', err);
    }
  }

  static async saveStrokes(spaceId: string, strokes: DrawingStroke[], authorId?: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase || !spaceId) return;

    try {
      const safeSpaceId = ensureUUID(spaceId);
      if (strokes.length === 0) {
        await supabase.from('desk_drawings').delete().eq('space_id', safeSpaceId);
        return;
      }

      const rows = strokes.map(s => ({
        id: ensureUUID(s.id),
        space_id: safeSpaceId,
        author_id: authorId || null,
        color: s.color,
        width: s.width,
        is_highlighter: s.isHighlighter ?? false,
        points: s.points as unknown as Json,
        attached_to_item_id: s.attachedToItemId ? ensureUUID(s.attachedToItemId) : null,
      }));
      // Xóa các nét vẽ cũ không còn trong danh sách hiện tại rồi upsert lại
      const currentIds = rows.map(r => r.id);
      if (currentIds.length > 0) {
        await supabase
          .from('desk_drawings')
          .delete()
          .eq('space_id', safeSpaceId)
          .not('id', 'in', `(${currentIds.join(',')})`);
      }
      const { error: strokeErr } = await supabase.from('desk_drawings').upsert(rows);
      if (strokeErr) {
        console.warn('Lỗi upsert desk_drawings:', strokeErr.message, strokeErr.details);
      }
    } catch (err) {
      console.warn('Lỗi saveStrokes:', err);
    }
  }

  static async saveThreads(spaceId: string, threads: IntelineThread[]): Promise<void> {
    const supabase = getSupabase();
    if (!supabase || !spaceId) return;

    try {
      const safeSpaceId = ensureUUID(spaceId);
      const rows = threads.map(t => ({
        id: ensureUUID(t.id),
        space_id: safeSpaceId,
        source_item_id: ensureUUID(t.sourceItemId),
        source_page_number: t.sourcePageNumber,
        selected_text: t.selectedText,
        source_offset: (t.sourceOffset as unknown as Json) || null,
        target_sticky_id: t.targetStickyId ? ensureUUID(t.targetStickyId) : null,
        question: t.question,
        answer: t.answer,
      }));
      await supabase.from('inteline_threads').upsert(rows);
    } catch (err) {
      console.warn('Lỗi saveThreads:', err);
    }
  }

  static async joinSpace(spaceId: string, userId: string, role: 'viewer' | 'editor' = 'viewer'): Promise<void> {
    const supabase = getSupabase();
    if (!supabase || !spaceId || !userId) return;

    try {
      await supabase.from('space_members').upsert({
        space_id: spaceId,
        user_id: userId,
        role: role,
      }, { onConflict: 'space_id,user_id' });
    } catch (err) {
      console.warn('Lỗi joinSpace:', err);
    }
  }
}
