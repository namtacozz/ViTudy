'use client';

import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

// Global cache for compiled KaTeX HTML to guarantee 0ms overhead on re-renders
const katexHtmlCache = new Map<string, string>();

function renderKatexWithCache(math: string, displayMode: boolean): string {
  const cacheKey = `${displayMode ? 'D:' : 'I:'}${math}`;
  const hit = katexHtmlCache.get(cacheKey);
  if (hit !== undefined) return hit;

  try {
    const html = katex.renderToString(math, { displayMode, throwOnError: false });
    katexHtmlCache.set(cacheKey, html);
    return html;
  } catch {
    return '';
  }
}

/**
 * Render inline elements (KaTeX math and Markdown bold) within a text span
 */
function renderInlineContent(text: string): React.ReactNode {
  if (!text) return null;

  // Split by inline math ($...$ or \(...\))
  const mathRegex = /(\\\([\s\S]+?\\\)|\$[^\$\n]+?\$)/g;
  const parts = text.split(mathRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline Math: \(...\)
    if (part.startsWith('\\(') && part.endsWith('\\)')) {
      const rawMath = part.slice(2, -2).trim();
      const html = renderKatexWithCache(rawMath, false);
      if (html) {
        return (
          <span 
            key={index} 
            className="inline-block px-0.5 align-baseline"
            dangerouslySetInnerHTML={{ __html: html }} 
          />
        );
      }
      return <code key={index} className="font-mono text-xs">{rawMath}</code>;
    }

    // Inline Math: $...$
    if (part.startsWith('$') && part.endsWith('$')) {
      const rawMath = part.slice(1, -1).trim();
      const html = renderKatexWithCache(rawMath, false);
      if (html) {
        return (
          <span 
            key={index} 
            className="inline-block px-0.5 align-baseline"
            dangerouslySetInnerHTML={{ __html: html }} 
          />
        );
      }
      return <code key={index} className="font-mono text-xs">{rawMath}</code>;
    }

    // Bold text: **...**
    const boldRegex = /(\*\*[^*]+?\*\*)/g;
    const textSegments = part.split(boldRegex);

    return (
      <span key={index}>
        {textSegments.map((seg, sIdx) => {
          if (seg.startsWith('**') && seg.endsWith('**')) {
            return (
              <strong key={sIdx} className="font-bold">
                {seg.slice(2, -2)}
              </strong>
            );
          }
          return seg;
        })}
      </span>
    );
  });
}

/**
 * MathRenderer parses content containing Markdown headings (##), lists (• / -),
 * and LaTeX math ($...$, $$...$$, \(...\), \[...\]).
 * Memoized with global compile cache to eliminate render lag.
 */
export const MathRenderer = React.memo(function MathRenderer({ content, className = '' }: MathRendererProps) {
  if (!content) return null;

  // Guard against raw binary/corrupted text (e.g. from legacy dropped .docx) or huge strings freezing KaTeX
  if (content.includes('\u0000') || (content.startsWith('PK\x03\x04') && content.length > 500)) {
    return (
      <div className={`text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 ${className}`}>
        Tài liệu này chứa dữ liệu nhị phân bị lỗi khi tải lên trước đây. Vui lòng xóa và tải lại tệp đúng định dạng (.docx, .pdf, .pptx, .txt).
      </div>
    );
  }
  if (content.length > 80000) {
    return (
      <div className={`whitespace-pre-wrap text-sm leading-relaxed ${className}`}>
        {content.slice(0, 80000)}
      </div>
    );
  }

  // 1. First split by Block Math ($$...$$ or \[...\])
  const blockMathRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\])/g;
  const rawBlocks = content.split(blockMathRegex);

  return (
    <div className={`math-rendered-document leading-[1.6] text-justify ${className} [&_.katex]:text-inherit`}>
      {rawBlocks.map((block, bIdx) => {
        if (!block) return null;

        // Block Display Math ($$...$$ or \[...\]) with ergonomic vertical margins
        if ((block.startsWith('$$') && block.endsWith('$$')) || (block.startsWith('\\[') && block.endsWith('\\]'))) {
          const rawMath = block.slice(2, -2).trim();
          const html = renderKatexWithCache(rawMath, true);
          if (html) {
            return (
              <div 
                key={bIdx} 
                className="my-2.5 py-1 overflow-x-auto no-scrollbar text-center"
                dangerouslySetInnerHTML={{ __html: html }} 
              />
            );
          }
          return <code key={bIdx} className="block my-2.5 font-mono text-xs text-center">{rawMath}</code>;
        }

        // 2. Parse lines for Headings, Lists, and Paragraphs
        const lines = block.split('\n');
        const elements: React.ReactNode[] = [];
        let currentListItems: string[] = [];

        const flushList = () => {
          if (currentListItems.length > 0) {
            const listKey = `list-${elements.length}`;
            elements.push(
              <ul key={listKey} className="space-y-1.5 my-2.5 pl-1 not-italic">
                {currentListItems.map((itemText, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2 text-slate-800">
                    <span className="text-[#E0562D] font-bold leading-none mt-1 select-none shrink-0">•</span>
                    <span className="flex-1 leading-[1.6]">{renderInlineContent(itemText)}</span>
                  </li>
                ))}
              </ul>
            );
            currentListItems = [];
          }
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) {
            flushList();
            continue;
          }

          // Heading 2: ## Title
          if (line.startsWith('## ')) {
            flushList();
            const headingText = line.replace(/^##\s+/, '');
            elements.push(
              <div 
                key={`h2-${i}`} 
                className="text-base md:text-lg font-bold my-3.5 block border-b border-slate-200/70 pb-1"
              >
                {renderInlineContent(headingText)}
              </div>
            );
            continue;
          }

          // Heading 3: ### Title
          if (line.startsWith('### ')) {
            flushList();
            const headingText = line.replace(/^###\s+/, '');
            elements.push(
              <div 
                key={`h3-${i}`} 
                className="text-sm md:text-base font-bold my-2.5 block"
              >
                {renderInlineContent(headingText)}
              </div>
            );
            continue;
          }

          // Bullet list items starting with • or - or *
          if (/^[•\-*]\s+/.test(line)) {
            const itemText = line.replace(/^[•\-*]\s+/, '');
            currentListItems.push(itemText);
            continue;
          }

          // If a line contains inline bullets like "Trong đó: • a ... • b ..."
          if (line.includes('•')) {
            const parts = line.split(/•\s*/);
            const prefix = parts[0]?.trim();
            if (prefix) {
              flushList();
              elements.push(
                <p key={`p-${i}`} className="my-1.5 leading-[1.6]">
                  {renderInlineContent(prefix)}
                </p>
              );
            }
            for (let pIdx = 1; pIdx < parts.length; pIdx++) {
              const bulletText = parts[pIdx].trim();
              if (bulletText) {
                currentListItems.push(bulletText);
              }
            }
            continue;
          }

          // Normal Paragraph
          flushList();
          elements.push(
            <p key={`p-${i}`} className="my-2 leading-[1.6]">
              {renderInlineContent(line)}
            </p>
          );
        }

        flushList();

        return <div key={bIdx}>{elements}</div>;
      })}
    </div>
  );
});
