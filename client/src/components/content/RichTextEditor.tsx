'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect } from 'react';
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  Undo, Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Toolbar ─────────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolBtn({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent editor losing focus
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded text-sm transition-colors',
        active
          ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1 self-center" />;
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-t-lg">

      {/* Undo / Redo */}
      <ToolBtn
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Hoàn tác (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Làm lại (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      {/* Headings */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Tiêu đề 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Tiêu đề 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Tiêu đề 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      {/* Inline formatting */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="In đậm (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="In nghiêng (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Gạch chân (Ctrl+U)"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Gạch ngang"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      {/* Lists */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Danh sách không thứ tự"
      >
        <List className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Danh sách có thứ tự"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      {/* Block */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Trích dẫn"
      >
        <Quote className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Ngắt cảnh (---)"
      >
        <Minus className="h-4 w-4" />
      </ToolBtn>

    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert Tiptap HTML output to Markdown-compatible plain text.
 * We store markdown in the DB; Tiptap outputs HTML so we convert on save.
 */
export function htmlToMarkdown(html: string): string {
  return html
    // Headings
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    // Bold / italic / underline / strike
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<u>(.*?)<\/u>/gi, '<u>$1</u>') // keep underline as HTML (no MD equivalent)
    .replace(/<s>(.*?)<\/s>/gi, '~~$1~~')
    // Blockquote
    .replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, (_, inner) =>
      inner.trim().split('\n').map((l: string) => `> ${l.trim()}`).join('\n') + '\n\n'
    )
    // Lists
    .replace(/<ul>([\s\S]*?)<\/ul>/gi, (_, inner) =>
      inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1').trim() + '\n\n'
    )
    .replace(/<ol>([\s\S]*?)<\/ol>/gi, (_, inner) => {
      let i = 1;
      return inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, c: string) => `${i++}. ${c}`) + '\n\n';
    })
    // Horizontal rule
    .replace(/<hr\s*\/?>/gi, '\n---\n\n')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Strip remaining tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Collapse excessive blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Convert simple Markdown back to HTML for Tiptap initialContent.
 * This is a lightweight one-way converter; full fidelity is not needed
 * because MarkdownRenderer handles display — we only need editable HTML.
 */
export function markdownToHtml(md: string): string {
  if (!md.trim()) return '<p></p>';
  return md
    // Horizontal rule (before headings to avoid conflict)
    .replace(/^---$/gm, '<hr/>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold + italic combined
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    // Ordered list items — wrap in <ol> after
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // Paragraphs: wrap non-tag lines
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<(h[1-6]|hr|blockquote|ul|ol|li)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');
}

// ─── Main component ───────────────────────────────────────────────────────────

interface RichTextEditorProps {
  /** Current markdown content */
  value: string;
  /** Called with markdown string on every change */
  onChange: (markdown: string) => void;
  placeholder?: string;
  minHeight?: number; // px
  error?: string;
  label?: string;
  required?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung chương...',
  minHeight = 480,
  error,
  label = 'Nội dung',
  required = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: markdownToHtml(value),
    editorProps: {
      attributes: {
        class: [
          'outline-none min-h-[inherit] px-5 py-4',
          'prose prose-base dark:prose-invert max-w-none',
          // Sans-serif for writing
          'font-sans',
          // Tiptap placeholder
          '[&_.is-empty::before]:content-[attr(data-placeholder)]',
          '[&_.is-empty::before]:text-gray-400',
          '[&_.is-empty::before]:float-left',
          '[&_.is-empty::before]:pointer-events-none',
          '[&_.is-empty::before]:h-0',
        ].join(' '),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const md = htmlToMarkdown(html);
      onChange(md);
    },
  });

  // Sync external value changes (e.g. loading chapter) into editor
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const incomingHtml = markdownToHtml(value);
    // Only reset if the content is meaningfully different to avoid cursor jump
    if (currentHtml !== incomingHtml && !editor.isFocused) {
      editor.commands.setContent(incomingHtml);
    }
  }, [editor, value]);

  // Word count from Tiptap
  const wordCount = editor
    ? editor.storage.characterCount?.words?.() ?? 0
    : 0;

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <span className="text-xs text-gray-400">
            {wordCount.toLocaleString('vi-VN')} từ
          </span>
        </div>
      )}

      <div
        className={cn(
          'border rounded-lg overflow-hidden bg-white dark:bg-gray-900 transition-colors',
          'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500',
          error
            ? 'border-red-400 dark:border-red-500'
            : 'border-gray-300 dark:border-gray-600',
        )}
        style={{ minHeight }}
      >
        {editor && <Toolbar editor={editor} />}
        <EditorContent
          editor={editor}
          style={{ minHeight: minHeight - 48 }}
          className="font-sans text-base text-gray-900 dark:text-gray-100"
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
        Phím tắt: <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">Ctrl+B</kbd> in đậm,{' '}
        <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">Ctrl+I</kbd> in nghiêng,{' '}
        <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">Ctrl+Z</kbd> hoàn tác
      </p>
    </div>
  );
}
