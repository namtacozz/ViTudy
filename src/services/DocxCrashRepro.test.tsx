import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import fs from 'fs';
import { MathRenderer } from '@/components/common/MathRenderer';
import { paginateDocument } from '@/utils/pagination';
import { parseDocxFile, parseUploadedDocumentFile, sanitizeDocumentText } from './OfficeParserService';
import { rowToDeskItem } from './StudySpaceService';

describe('Docx crash & freeze regression', () => {
  it('guards MathRenderer against raw binary docx utf8 text without freezing', () => {
    const docxPath = 'C:/Users/Vit/.gemini/antigravity/brain/199d6011-b9cb-4cd7-8bb7-2785647ebfda/.user_uploaded/media_1794492876316_05450c83.docx';
    if (!fs.existsSync(docxPath)) return;
    const rawUtf8 = fs.readFileSync(docxPath, 'utf8');
    const t0 = performance.now();
    const { container } = render(<MathRenderer content={rawUtf8} />);
    const elapsed = performance.now() - t0;
    expect(elapsed).toBeLessThan(500);
    expect(container.textContent).toContain('Tài liệu này chứa dữ liệu nhị phân');
  });

  it('parses real .docx via parseUploadedDocumentFile without falling back to raw binary text', async () => {
    const docxPath = 'C:/Users/Vit/.gemini/antigravity/brain/199d6011-b9cb-4cd7-8bb7-2785647ebfda/.user_uploaded/media_1794492876316_05450c83.docx';
    if (!fs.existsSync(docxPath)) return;
    const buf = fs.readFileSync(docxPath);
    const file = new File([buf], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    if (!file.arrayBuffer) {
      (file as any).arrayBuffer = async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
    const pages = await parseUploadedDocumentFile(file, 'test');
    expect(pages.length).toBeGreaterThan(0);
    expect(pages[0].text).not.toContain('\u0000');
    expect(pages[0].text.startsWith('PK')).toBe(false);
    const leaves = paginateDocument(pages);
    expect(leaves.length).toBeGreaterThan(0);
  });

  it('sanitizes corrupted binary pages in sanitizeDocumentText and rowToDeskItem', () => {
    const corrupted = 'PK\x03\x04\u0000\u0000' + 'x'.repeat(600);
    expect(sanitizeDocumentText(corrupted)).toContain('Tài liệu này chứa dữ liệu nhị phân');
    const restored = rowToDeskItem(
      {
        id: '00000000-0000-4000-8000-000000000001',
        space_id: '00000000-0000-4000-8000-000000000002',
        item_type: 'paper',
        title: 'bad.docx',
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        z_index: 1,
        page_count: 1,
        current_page_index: 0,
        color_theme: null,
        cover_color: null,
        is_binder: false,
        sticky_text: null,
        sticky_color: null,
        text_align: null,
        is_bold: false,
        is_exam_sheet: false,
        exam_data: null,
        source_documents: null,
        width: null,
        height: null,
        storage_file_path: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      [{ id: 'p1', pageNumber: 1, title: 'bad', text: corrupted }]
    );
    expect(restored.pages[0].text).toContain('Tài liệu này chứa dữ liệu nhị phân');
  });

  it('handles empty or nullish pages in paginateDocument without crashing', () => {
    expect(() => paginateDocument([])).not.toThrow();
    expect(() => paginateDocument([{ id: '1', title: undefined, text: undefined as any }])).not.toThrow();
  });
});
