import { DeskItem } from '@/types/studyspace';

/**
 * Format desk item counts by distinct content type (only showing types with count > 0).
 */
export function formatDeskItemsSummary(items?: DeskItem[]): string {
  if (!items || items.length === 0) return 'Chưa có tài liệu';

  const books = items.filter(i => i.type === 'book').length;
  const exams = items.filter(i => i.type === 'exam_sheet' || (i.type === 'paper' && i.isExamSheet)).length;
  const papers = items.filter(i => i.type === 'paper' && !i.isExamSheet).length;
  const notes = items.filter(i => i.type === 'sticky_note').length;
  const codeBlocks = items.filter(i => i.type === 'code_block').length;
  const mindMaps = items.filter(i => i.type === 'mind_map').length;
  const stickers = items.filter(i => i.type === 'sticker').length;

  const parts: string[] = [];
  if (books > 0) parts.push(`${books} sách`);
  if (papers > 0) parts.push(`${papers} tài liệu`);
  if (exams > 0) parts.push(`${exams} đề thi`);
  if (notes > 0) parts.push(`${notes} ghi chú`);
  if (codeBlocks > 0) parts.push(`${codeBlocks} khối mã`);
  if (mindMaps > 0) parts.push(`${mindMaps} sơ đồ`);
  if (stickers > 0) parts.push(`${stickers} hình dán`);

  return parts.length > 0 ? parts.join(' · ') : `${items.length} mục`;
}
