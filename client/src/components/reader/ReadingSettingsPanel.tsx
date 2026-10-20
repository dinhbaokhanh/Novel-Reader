'use client';

import { useReadingSettings } from '@/lib/store/reading-settings';
import { ReadingTheme } from '@/lib/types';
import { Minus, Plus, RotateCcw, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

// Each theme carries its own bg + text colors so preview and buttons are always readable
const THEMES: {
  value: ReadingTheme;
  label: string;
  bg: string;      // Tailwind bg class for the swatch
  text: string;    // Tailwind text class for the swatch label
  border: string;  // inactive border
  activeBorder: string;
}[] = [
  {
    value: 'light',
    label: 'Sáng',
    bg: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-300',
    activeBorder: 'border-primary-500',
  },
  {
    value: 'sepia',
    label: 'Sepia',
    bg: 'bg-amber-50',
    text: 'text-stone-800',
    border: 'border-amber-300',
    activeBorder: 'border-amber-500',
  },
  {
    value: 'dark',
    label: 'Tối',
    bg: 'bg-gray-900',
    text: 'text-gray-100',
    border: 'border-gray-600',
    activeBorder: 'border-primary-400',
  },
];

// Inline styles for the live preview box — must match THEME_CLASSES in read page
const PREVIEW_STYLE: Record<ReadingTheme, React.CSSProperties> = {
  light: { background: '#ffffff', color: '#111827' },
  sepia: { background: '#fffbeb', color: '#292524' },
  dark:  { background: '#030712', color: '#f3f4f6' },
};

export default function ReadingSettingsPanel({ onClose }: Props) {
  const { settings, update, reset } = useReadingSettings();
  const theme = settings.theme;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — always light regardless of reading theme */}
      <div className="relative w-full sm:w-96 sm:rounded-2xl rounded-t-2xl shadow-2xl z-10
                      bg-white text-gray-900 max-h-[85vh] overflow-y-auto overscroll-contain pb-safe sm:pb-0">

        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2.5">
          <span className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="font-semibold text-base">Cài đặt đọc</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              title="Đặt lại mặc định"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="p-2 -mr-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-6">

          {/* ── Màu nền ── */}
          <section>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Màu nền
            </label>
            <div className="flex gap-3">
              {THEMES.map((t) => {
                const active = theme === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => update({ theme: t.value })}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all
                      ${t.bg} ${t.text}
                      ${active
                        ? `${t.activeBorder} ring-2 ring-offset-1 ring-primary-400/40`
                        : `${t.border} hover:opacity-80`}
                    `}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Cỡ chữ ── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Cỡ chữ
              </label>
              <span className="text-sm font-mono font-medium text-primary-600">
                {settings.fontSize}px
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => update({ fontSize: Math.max(14, settings.fontSize - 1) })}
                disabled={settings.fontSize <= 14}
                className="p-2.5 sm:p-2 rounded-lg border border-gray-200 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="range" min={14} max={28} step={1}
                value={settings.fontSize}
                onChange={(e) => update({ fontSize: Number(e.target.value) })}
                className="flex-1 accent-primary-600"
              />
              <button
                onClick={() => update({ fontSize: Math.min(28, settings.fontSize + 1) })}
                disabled={settings.fontSize >= 28}
                className="p-2.5 sm:p-2 rounded-lg border border-gray-200 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* ── Khoảng cách dòng ── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Khoảng cách dòng
              </label>
              <span className="text-sm font-mono font-medium text-primary-600">
                {settings.lineHeight.toFixed(1)}
              </span>
            </div>
            <input
              type="range" min={1.4} max={2.2} step={0.1}
              value={settings.lineHeight}
              onChange={(e) => update({ lineHeight: Number(e.target.value) })}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Chặt</span>
              <span>Thoáng</span>
            </div>
          </section>

          {/* ── Độ rộng cột (ẩn trên mobile vì màn hình hẹp hơn mức tối thiểu) ── */}
          <section className="hidden sm:block">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Độ rộng cột
              </label>
              <span className="text-sm font-mono font-medium text-primary-600">
                {settings.maxWidth}px
              </span>
            </div>
            <input
              type="range" min={560} max={900} step={20}
              value={settings.maxWidth}
              onChange={(e) => update({ maxWidth: Number(e.target.value) })}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Hẹp</span>
              <span>Rộng</span>
            </div>
          </section>

          {/* ── Xem trước ── */}
          <section>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Xem trước
            </label>
            <div
              className="rounded-xl p-4 border border-gray-200 transition-colors duration-300 font-sans"
              style={{
                ...PREVIEW_STYLE[theme],
                fontSize: settings.fontSize,
                lineHeight: settings.lineHeight,
              }}
            >
              Trời đất lặng lẽ như tờ, ánh trăng vằng vặc chiếu xuống mặt hồ phẳng lặng, lung linh in bóng những tán liễu rủ bên bờ...
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
