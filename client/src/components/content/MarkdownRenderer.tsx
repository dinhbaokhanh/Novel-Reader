'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ReadingTheme } from '@/lib/types';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  theme?: ReadingTheme;
}

// ─── Color palettes ───────────────────────────────────────────────────────────

const PALETTE = {
  light: {
    text:            '#1f2937', // gray-800
    textMuted:       '#374151', // gray-700
    heading:         '#111827', // gray-900
    strong:          '#111827',
    em:              '#1f2937',
    link:            '#2563eb', // blue-600
    blockquoteBg:    '#f9fafb', // gray-50
    blockquoteBorder:'#6366f1',
    blockquoteText:  '#374151',
    codeBg:          '#f3f4f6',
    codeText:        '#4f46e5',
    hrColor:         '#e5e7eb', // gray-200
    sceneBreak:      '#9ca3af', // gray-400
    listMarker:      '#6b7280', // gray-500
  },
  sepia: {
    text:            '#1c1917',
    textMuted:       '#292524',
    heading:         '#0c0a09',
    strong:          '#0c0a09',
    em:              '#1c1917',
    link:            '#92400e',
    blockquoteBg:    '#fef3c7',
    blockquoteBorder:'#d97706',
    blockquoteText:  '#44403c',
    codeBg:          '#fde68a',
    codeText:        '#92400e',
    hrColor:         '#d6c7a1',
    sceneBreak:      '#a8916a',
    listMarker:      '#78716c',
  },
  dark: {
    text:            '#e5e7eb', // gray-200
    textMuted:       '#d1d5db', // gray-300
    heading:         '#f9fafb', // gray-50
    strong:          '#f9fafb',
    em:              '#e5e7eb',
    link:            '#818cf8', // indigo-400
    blockquoteBg:    '#1f2937',
    blockquoteBorder:'#818cf8',
    blockquoteText:  '#d1d5db',
    codeBg:          '#1f2937',
    codeText:        '#a5b4fc',
    hrColor:         '#374151',
    sceneBreak:      '#4b5563',
    listMarker:      '#6b7280',
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function MarkdownRenderer({
  content,
  className = '',
  theme = 'light',
}: MarkdownRendererProps) {
  const p = PALETTE[theme];

  // Base text style applied to the wrapper — all children inherit
  const baseStyle: React.CSSProperties = {
    color:      p.text,
    fontSize:   'inherit',
    lineHeight: 'inherit',
    fontFamily: 'inherit',
  };

  return (
    <div className={`max-w-none leading-relaxed break-words ${className}`} style={baseStyle}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // ── Headings ───────────────────────────────────────────────
          h1: ({ children }) => (
            <h1 style={{ color: p.heading, fontSize: '1.875rem', fontWeight: 700,
                         marginTop: '2rem', marginBottom: '1rem', lineHeight: 1.3 }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ color: p.heading, fontSize: '1.5rem', fontWeight: 700,
                         marginTop: '1.75rem', marginBottom: '0.75rem', lineHeight: 1.35 }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ color: p.heading, fontSize: '1.25rem', fontWeight: 600,
                         marginTop: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>
              {children}
            </h3>
          ),

          // ── Paragraph ─────────────────────────────────────────────
          p: ({ children }) => (
            <p style={{ color: p.text, marginTop: '1rem', marginBottom: '1rem' }}>
              {children}
            </p>
          ),

          // ── Inline ────────────────────────────────────────────────
          strong: ({ children }) => (
            <strong style={{ color: p.strong, fontWeight: 700 }}>{children}</strong>
          ),
          em: ({ children }) => (
            <em style={{ color: p.em, fontStyle: 'italic' }}>{children}</em>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer"
               style={{ color: p.link, textDecoration: 'underline' }}>
              {children}
            </a>
          ),

          // ── Blockquote ────────────────────────────────────────────
          blockquote: ({ children }) => (
            <blockquote style={{
              color:           p.blockquoteText,
              background:      p.blockquoteBg,
              borderLeft:      `4px solid ${p.blockquoteBorder}`,
              paddingLeft:     '1rem',
              paddingTop:      '0.5rem',
              paddingBottom:   '0.5rem',
              margin:          '1.25rem 0',
              borderRadius:    '0 6px 6px 0',
              fontStyle:       'normal',
            }}>
              {children}
            </blockquote>
          ),

          // ── Code ──────────────────────────────────────────────────
          code: ({ children, className: cls }) => {
            const isBlock = cls?.startsWith('language-');
            return isBlock ? (
              <code style={{ color: p.codeText, background: p.codeBg,
                             display: 'block', padding: '0.75rem 1rem',
                             borderRadius: '6px', fontSize: '0.875em',
                             overflowX: 'auto' }}>
                {children}
              </code>
            ) : (
              <code style={{ color: p.codeText, background: p.codeBg,
                             padding: '0.125rem 0.375rem', borderRadius: '4px',
                             fontSize: '0.875em' }}>
                {children}
              </code>
            );
          },

          // ── Lists ─────────────────────────────────────────────────
          ul: ({ children }) => (
            <ul style={{ color: p.text, paddingLeft: '1.5rem',
                         margin: '1rem 0', listStyleType: 'disc' }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol style={{ color: p.text, paddingLeft: '1.5rem',
                         margin: '1rem 0', listStyleType: 'decimal' }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li style={{ color: p.text, marginBottom: '0.25rem' }}>{children}</li>
          ),

          // ── Scene break ───────────────────────────────────────────
          hr: () => (
            <div style={{ display: 'flex', alignItems: 'center',
                          justifyContent: 'center', margin: '2.5rem 0' }}
                 aria-hidden="true">
              <span style={{ color: p.sceneBreak, letterSpacing: '0.5em',
                             fontSize: '0.875rem' }}>
                • • •
              </span>
            </div>
          ),

          // ── Table ─────────────────────────────────────────────────
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: '1.25rem 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse',
                              color: p.text, fontSize: '0.9em' }}>
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th style={{ color: p.heading, borderBottom: `2px solid ${p.hrColor}`,
                         padding: '0.5rem 0.75rem', textAlign: 'left',
                         fontWeight: 600 }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td style={{ color: p.text, borderBottom: `1px solid ${p.hrColor}`,
                         padding: '0.5rem 0.75rem' }}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
