'use client';

import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

/**
 * MathRenderer parses content containing LaTeX math ($...$ or $$...$$)
 * or common mathematical expressions and renders them via KaTeX with fallback.
 */
export function MathRenderer({ content, className = '' }: MathRendererProps) {
  if (!content) return null;

  // Split content by inline $...$ or block $$...$$ math delimiters
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
  const parts = content.split(mathRegex);

  return (
    <span className={`inline-math-container ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('$$') && part.endsWith('$$')) {
          const rawMath = part.slice(2, -2).trim();
          try {
            const html = katex.renderToString(rawMath, { displayMode: true, throwOnError: false });
            return (
              <span 
                key={index} 
                className="block my-2.5 overflow-x-auto no-scrollbar py-1"
                dangerouslySetInnerHTML={{ __html: html }} 
              />
            );
          } catch {
            return <code key={index} className="block my-2 font-mono text-xs">{rawMath}</code>;
          }
        }

        if (part.startsWith('$') && part.endsWith('$')) {
          const rawMath = part.slice(1, -1).trim();
          try {
            const html = katex.renderToString(rawMath, { displayMode: false, throwOnError: false });
            return (
              <span 
                key={index} 
                className="inline-block px-0.5"
                dangerouslySetInnerHTML={{ __html: html }} 
              />
            );
          } catch {
            return <code key={index} className="font-mono text-xs">{rawMath}</code>;
          }
        }

        // Normal text: handle line breaks and bold markers
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
