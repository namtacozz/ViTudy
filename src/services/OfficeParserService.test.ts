import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import {
  isBinaryOrCorrupted,
  parseDocxFile,
  parseUploadedDocumentResult,
} from './OfficeParserService';

async function buildMockDocxFile(documentXml: string, appXml?: string): Promise<File> {
  const zip = new JSZip();
  zip.file('word/document.xml', documentXml);
  if (appXml) {
    zip.file('docProps/app.xml', appXml);
  }
  const buffer = await zip.generateAsync({ type: 'arraybuffer' });
  const file = new File([buffer], 'multi-page.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  if (!file.arrayBuffer) {
    (file as any).arrayBuffer = async () => buffer;
  }
  return file;
}

describe('OfficeParserService', () => {
  it('detects binary corrupted files with old doc CFBF header', () => {
    const rawBuffer = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0x00, 0x00, 0x00, 0x00]).buffer;
    expect(isBinaryOrCorrupted(rawBuffer).isCorrupted).toBe(true);
  });

  it('detects text filled with replacement characters (\\uFFFD)', () => {
    const corruptText = 'abc \uFFFD \uFFFD \uFFFD \uFFFD \uFFFD \uFFFD \uFFFD \uFFFD \uFFFD \uFFFD \uFFFD \uFFFD \uFFFD \uFFFD \uFFFD \uFFFD';
    expect(isBinaryOrCorrupted(new ArrayBuffer(10), corruptText).isCorrupted).toBe(true);
  });

  it('accepts clean plain text or html', () => {
    const clean = 'Chương 1: Giới thiệu về Machine Learning và ứng dụng trong ViTudy.';
    expect(isBinaryOrCorrupted(new ArrayBuffer(10), clean).isCorrupted).toBe(false);
  });

  it('rejects empty or corrupt file buffer in parseDocxFile gracefully', async () => {
    const file = new File([new ArrayBuffer(0)], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    await expect(parseDocxFile(file)).rejects.toThrow('Tệp Word rỗng hoặc không đúng định dạng .docx.');
  });

  it('splits multi-page .docx into separate pages using Word XML page breaks', async () => {
    const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p><w:r><w:t>Trang 1: Giới thiệu</w:t></w:r></w:p>
          <w:p><w:r><w:br w:type="page"/><w:t>Trang 2: Chương 1</w:t></w:r></w:p>
          <w:p><w:r><w:lastRenderedPageBreak/><w:t>Trang 3: Chương 2</w:t></w:r></w:p>
          <w:p><w:pPr><w:pageBreakBefore/></w:pPr><w:r><w:t>Trang 4: Chương 3</w:t></w:r></w:p>
          <w:p><w:r><w:br w:type="page"/><w:t>Trang 5: Tổng kết</w:t></w:r></w:p>
        </w:body>
      </w:document>`;
    const file = await buildMockDocxFile(docXml);
    const pages = await parseDocxFile(file);
    expect(pages).toHaveLength(5);
    expect(pages[0].text).toContain('Trang 1: Giới thiệu');
    expect(pages[4].text).toContain('Trang 5: Tổng kết');
  });

  it('uses docProps/app.xml Pages metadata when .docx lacks XML page break tags', async () => {
    const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p><w:r><w:t>Dòng 1</w:t></w:r></w:p>
          <w:p><w:r><w:t>Dòng 2</w:t></w:r></w:p>
          <w:p><w:r><w:t>Dòng 3</w:t></w:r></w:p>
          <w:p><w:r><w:t>Dòng 4</w:t></w:r></w:p>
          <w:p><w:r><w:t>Dòng 5</w:t></w:r></w:p>
        </w:body>
      </w:document>`;
    const appXml = `<?xml version="1.0" encoding="UTF-8"?><Properties><Pages>5</Pages></Properties>`;
    const file = await buildMockDocxFile(docXml, appXml);
    const pages = await parseDocxFile(file);
    expect(pages).toHaveLength(5);
  });

  it('parses multi-sheet .xlsx into spreadsheet kind with all sheets preserved', async () => {
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet([
      ['Tên', 'Điểm'],
      ['An', '9.5'],
    ]);
    const ws2 = XLSX.utils.aoa_to_sheet([
      ['Môn', 'Tín chỉ'],
      ['Giải tích', '4'],
    ]);
    XLSX.utils.book_append_sheet(wb, ws1, 'Bảng điểm');
    XLSX.utils.book_append_sheet(wb, ws2, 'Môn học');
    const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
    const file = new File([out], 'grades.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    if (!file.arrayBuffer) {
      (file as any).arrayBuffer = async () => out;
    }

    const res = await parseUploadedDocumentResult(file, 'grades');
    expect(res.kind).toBe('spreadsheet');
    if (res.kind === 'spreadsheet') {
      expect(res.sheets).toHaveLength(2);
      expect(res.sheets[0].name).toBe('Bảng điểm');
      expect(res.sheets[1].name).toBe('Môn học');
      expect(res.sheets[0].rows[1]).toEqual(['An', '9.5']);
    }
  });

  it('parses .pptx into presentation kind with slides and speaker notes', async () => {
    const zip = new JSZip();
    zip.file(
      'ppt/slides/slide1.xml',
      `<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:cSld><p:spTree><p:sp><p:txBody>
          <a:p><a:r><a:t>Giới thiệu ViTudy</a:t></a:r></a:p>
          <a:p><a:r><a:t>Không gian học tập 2.5D</a:t></a:r></a:p>
        </p:txBody></p:sp></p:spTree></p:cSld>
      </p:sld>`
    );
    zip.file(
      'ppt/notesSlides/notesSlide1.xml',
      `<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Nhấn mạnh phần demo</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld>
      </p:notes>`
    );
    const buf = await zip.generateAsync({ type: 'arraybuffer' });
    const file = new File([buf], 'deck.pptx', {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    if (!file.arrayBuffer) {
      (file as any).arrayBuffer = async () => buf;
    }

    const res = await parseUploadedDocumentResult(file, 'deck');
    expect(res.kind).toBe('presentation');
    if (res.kind === 'presentation') {
      expect(res.slides).toHaveLength(1);
      expect(res.slides[0].title).toBe('Giới thiệu ViTudy');
      expect(res.slides[0].body).toContain('Không gian học tập 2.5D');
      expect(res.slides[0].notes).toBe('Nhấn mạnh phần demo');
    }
  });
});
