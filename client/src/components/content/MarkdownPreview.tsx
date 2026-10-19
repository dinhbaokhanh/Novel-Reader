'use client';

import { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { Eye, Pencil } from 'lucide-react';

interface MarkdownPreviewProps {
  content: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  error?: string;
}

/**
 * Editor có 2 chế độ: Write (raw markdown) và Preview (rendered).
 * Tab chuyển đổi nhanh, giữ lại state khi đổi tab.
 */
export default function MarkdownPreview({
  content,
  onChange,
  rows = 20,
  placeholder = 'Nhập nội dung chương (hỗ trợ Markdown)...',
  error,
}: MarkdownPreviewProps) {
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nội dung <span className="text-red-500">*</span>
        </label>

        {/* Mode toggle */}
        <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`inline-flex items-center px-3 py-1 text-sm font-medium transition-colors ${
              mode === 'write'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Viết
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`inline-flex items-center px-3 py-1 text-sm font-medium transition-colors ${
              mode === 'preview'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Eye className="h-3 w-3 mr-1" />
            Xem trước
          </button>
        </div>
      </div>

      {mode === 'write' ? (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
          placeholder={placeholder}
        />
      ) : (
        <div
          className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:text-white min-h-[300px] overflow-auto"
          style={{ minHeight: `${rows * 1.5}rem` }}
        >
          {content.trim() ? (
            <MarkdownRenderer content={content} />
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic">
              Chưa có nội dung để xem trước
            </p>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Hint */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Hỗ trợ Markdown: # Tiêu đề, **in đậm**, *in nghiêng*, [link](url), - danh sách, {'>'} trích dẫn, --- ngắt cảnh
      </p>
    </div>
  );
}
