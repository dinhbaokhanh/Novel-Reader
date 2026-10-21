'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { readerApi } from '@/lib/api/reader';
import { ReadChapterResponse, TocEntry, Bookmark } from '@/lib/types';
import { useReadingSettings } from '@/lib/store/reading-settings';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useSwipe } from '@/hooks/useSwipe';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import ReadingSettingsPanel from '@/components/reader/ReadingSettingsPanel';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import {
  ArrowLeft, Settings, Bookmark as BookmarkIcon,
  BookOpen, ChevronLeft, ChevronRight,
  List, X, Check,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

// ─── Per-theme design tokens ─────────────────────────────────────────────────
// These must be concrete Tailwind class strings (no dynamic construction)
// so Tailwind can detect them at build time.

const THEME_PAGE = {
  light: { wrap: 'bg-white text-gray-900',           spinner: 'border-gray-200' },
  sepia: { wrap: 'bg-amber-50 text-stone-900',        spinner: 'border-amber-200' },
  dark:  { wrap: 'bg-gray-950 text-gray-100',         spinner: 'border-gray-800' },
} as const;

const THEME_HEADER = {
  light: 'bg-white/90 border-gray-200 text-gray-800',
  sepia: 'bg-amber-50/90 border-amber-200 text-stone-800',
  dark:  'bg-gray-950/90 border-gray-800 text-gray-200',
} as const;

const THEME_BTN_GHOST = {
  light: 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
  sepia: 'text-stone-500 hover:text-stone-900 hover:bg-amber-100',
  dark:  'text-gray-400 hover:text-gray-100 hover:bg-gray-800',
} as const;

const THEME_BTN_NAV = {
  light: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
  sepia: 'bg-amber-100 hover:bg-amber-200 text-stone-800',
  dark:  'bg-gray-800 hover:bg-gray-700 text-gray-200',
} as const;

const THEME_DIVIDER = {
  light: 'border-gray-200',
  sepia: 'border-amber-200',
  dark:  'border-gray-800',
} as const;

const THEME_DRAWER = {
  light: 'bg-white text-gray-900',
  sepia: 'bg-amber-50 text-stone-900',
  dark:  'bg-gray-900 text-gray-100',
} as const;

const THEME_TOC_ACTIVE = {
  light: 'bg-primary-50 text-primary-700',
  sepia: 'bg-amber-100 text-amber-800',
  dark:  'bg-primary-900/30 text-primary-300',
} as const;

const THEME_TOC_HOVER = {
  light: 'hover:bg-gray-50',
  sepia: 'hover:bg-amber-100/50',
  dark:  'hover:bg-gray-800',
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReadPage() {
  const params    = useParams();
  const router    = useRouter();
  const novelId   = params.novelId   as string;
  const chapterId = params.chapterId as string;

  const [data,          setData]          = useState<ReadChapterResponse | null>(null);
  const [toc,           setToc]           = useState<TocEntry[]>([]);
  const [bookmarks,     setBookmarks]     = useState<Bookmark[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState('');
  const [showSettings,  setShowSettings]  = useState(false);
  const [showToc,       setShowToc]       = useState(false);
  const [bookmarkDone,  setBookmarkDone]  = useState(false);
  const [bookmarkError, setBookmarkError] = useState('');
  const [headerVisible, setHeaderVisible] = useState(true);

  const { settings, load: loadSettings } = useReadingSettings();
  const lastScrollY = useRef(0);
  const theme = settings.theme;

  // Load persisted settings once
  useEffect(() => { loadSettings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch chapter + TOC + bookmarks
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [chapterData, tocData, bookmarkData] = await Promise.all([
          readerApi.readChapter(chapterId),
          readerApi.getTableOfContents(novelId),
          readerApi.getBookmarks(novelId),
        ]);
        if (cancelled) return;
        setData(chapterData);
        setToc(tocData);
        setBookmarks(bookmarkData);
      } catch (e: any) {
        if (!cancelled) setError(e.response?.data?.message || 'Không thể tải chương');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [chapterId, novelId]);

  // Restore saved scroll position
  useEffect(() => {
    if (!data) return;
    readerApi.getProgress(novelId).then((progress) => {
      if (progress?.lastChapterId === chapterId && progress.lastScrollPosition) {
        setTimeout(() => window.scrollTo({ top: progress.lastScrollPosition!, behavior: 'smooth' }), 300);
      }
    }).catch(() => {});
  }, [data, novelId, chapterId]);

  // Auto-hide header on scroll down, show on scroll up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHeaderVisible(y < 80 || y < lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Progress auto-save (hook)
  useReadingProgress(novelId, chapterId, !isLoading);

  // Navigation
  const goToPrev = useCallback(() => {
    if (data?.prev) router.push(`/read/${novelId}/${data.prev.id}`);
  }, [data, router, novelId]);

  const goToNext = useCallback(() => {
    if (data?.next) router.push(`/read/${novelId}/${data.next.id}`);
  }, [data, router, novelId]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft')  goToPrev();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape')     { setShowSettings(false); setShowToc(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goToPrev, goToNext]);

  // Swipe gesture
  useSwipe(
    { onSwipeLeft: goToNext, onSwipeRight: goToPrev },
    !isLoading && !showSettings && !showToc,
  );

  // Bookmark current scroll position
  const handleBookmark = async () => {
    try {
      await readerApi.createBookmark({ novelId, chapterId, scrollPosition: Math.round(window.scrollY) });
      setBookmarkError('');
      setBookmarkDone(true);
      setTimeout(() => setBookmarkDone(false), 2000);
      readerApi.getBookmarks(novelId).then(setBookmarks).catch(() => {});
    } catch {
      setBookmarkError('Không thể lưu dấu trang. Vui lòng thử lại.');
      setTimeout(() => setBookmarkError(''), 3500);
    }
  };

  // ── Content inline style (font is always sans-serif) ──────────────────────
  const contentStyle: React.CSSProperties = {
    fontSize:   settings.fontSize,
    lineHeight: settings.lineHeight,
    maxWidth:   settings.maxWidth,
    fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
  };

  // ── Loading / error guards ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={cn('min-h-screen flex flex-col items-center justify-center', THEME_PAGE[theme].wrap)}>
        <div className={cn('animate-spin rounded-full h-10 w-10 border-b-2 mb-3', THEME_PAGE[theme].spinner)} />
        <p className="text-sm opacity-50">Đang tải chương...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <ProtectedLayout>
        <div className="max-w-lg mx-auto mt-20 p-6 bg-red-50 text-red-700 rounded-xl text-center">
          <p className="font-medium mb-4">{error || 'Không tìm thấy chương'}</p>
          <Link href={`/novels/${novelId}`} className="text-sm underline">Quay lại truyện</Link>
        </div>
      </ProtectedLayout>
    );
  }

  const { chapter, prev, next } = data;

  return (
    <div className={cn('min-h-screen transition-colors duration-300 font-sans', THEME_PAGE[theme].wrap)}>

      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-md transition-transform duration-300 pt-safe',
          THEME_HEADER[theme],
          headerVisible ? 'translate-y-0' : '-translate-y-full',
        )}
      >
        <div className="flex items-center h-12 px-2 sm:px-4 gap-1 sm:gap-2">
          <Link
            href={`/novels/${novelId}`}
            className={cn('p-2 rounded-lg transition-colors shrink-0', THEME_BTN_GHOST[theme])}
            title="Quay lại truyện"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex-1 min-w-0 text-center">
            <p className="text-xs font-medium truncate opacity-70">
              Chương {chapter.chapterNumber}{chapter.title ? ` – ${chapter.title}` : ''}
            </p>
          </div>

          <button
            onClick={() => setShowToc(true)}
            aria-label="Mở mục lục"
            className={cn('p-2 rounded-lg transition-colors shrink-0', THEME_BTN_GHOST[theme])}
            title="Mục lục"
          >
            <List className="h-4 w-4" />
          </button>

          <button
            onClick={handleBookmark}
            aria-label="Đánh dấu vị trí này"
            className={cn('p-2 rounded-lg transition-colors shrink-0', THEME_BTN_GHOST[theme])}
            title="Đánh dấu vị trí này"
          >
            {bookmarkDone
              ? <Check className="h-4 w-4 text-green-500" />
              : <BookmarkIcon className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setShowSettings(true)}
            aria-label="Mở cài đặt đọc"
            className={cn('p-2 rounded-lg transition-colors shrink-0', THEME_BTN_GHOST[theme])}
            title="Cài đặt đọc"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {bookmarkError && (
        <div role="alert" className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-lg bg-red-700 px-4 py-2 text-sm text-white shadow-lg">
          {bookmarkError}
        </div>
      )}

      {/* ── Reading area ────────────────────────────────────────────────── */}
      <main className="px-5 pb-32 pt-12 sm:px-6">
        <article className="mx-auto" style={contentStyle}>

          {/* Chapter heading */}
          <header className="pt-8 sm:pt-10 pb-6 sm:pb-8 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] opacity-50">
              Chương {chapter.chapterNumber}
            </p>
            {chapter.title && (
              <h1 className="break-words font-serif text-2xl font-bold leading-tight text-balance sm:text-3xl">
                {chapter.title}
              </h1>
            )}
            <div className={cn('mt-6 border-t w-16 mx-auto', THEME_DIVIDER[theme])} />
          </header>

          {/* Content */}
          <MarkdownRenderer content={chapter.content} theme={theme} />

          {/* Word count */}
          <p className="text-center text-xs opacity-30 mt-12">
            {formatNumber(chapter.wordCount)} từ
          </p>
        </article>
      </main>

      {/* ── Bottom navigation ───────────────────────────────────────────── */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md px-3 sm:px-4 pt-3 pb-safe',
          THEME_HEADER[theme],
        )}
      >
        <div className="flex items-center justify-between max-w-xl mx-auto gap-2 sm:gap-3">
          <button
            onClick={goToPrev}
            disabled={!prev}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-1 justify-center',
              prev ? THEME_BTN_NAV[theme] : 'opacity-30 cursor-not-allowed',
            )}
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="truncate">{prev ? `Ch. ${prev.chapterNumber}` : 'Đầu truyện'}</span>
          </button>

          <button
            onClick={() => setShowToc(true)}
            title="Mục lục"
            className={cn('px-3.5 py-2.5 rounded-xl transition-colors', THEME_BTN_NAV[theme])}
          >
            <BookOpen className="h-4 w-4" />
          </button>

          <button
            onClick={goToNext}
            disabled={!next}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-1 justify-center',
              next ? THEME_BTN_NAV[theme] : 'opacity-30 cursor-not-allowed',
            )}
          >
            <span className="truncate">{next ? `Ch. ${next.chapterNumber}` : 'Hết truyện'}</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </nav>

      {/* ── TOC Drawer ──────────────────────────────────────────────────── */}
      {showToc && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowToc(false)} />
          <aside className={cn(
            'relative z-10 w-[85vw] max-w-xs sm:w-80 sm:max-w-none h-full flex flex-col shadow-2xl pt-safe pb-safe',
            THEME_DRAWER[theme],
          )}>
            {/* Drawer header */}
            <div className={cn('flex items-center justify-between px-5 py-4 border-b shrink-0', THEME_DIVIDER[theme])}>
              <h2 className="font-semibold text-sm">Mục lục</h2>
              <button
                onClick={() => setShowToc(false)}
                aria-label="Đóng mục lục"
                className={cn('p-2 -mr-1 rounded-lg', THEME_BTN_GHOST[theme])}
              >
                <X className="h-5 w-5 sm:h-4 sm:w-4" />
              </button>
            </div>

            {/* Chapter list */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {toc.length === 0 ? (
                <p className="p-5 text-sm opacity-50">Chưa có chương nào</p>
              ) : (
                <ul>
                  {toc.map((entry) => {
                    const isActive = entry.id === chapterId;
                    return (
                      <li key={entry.id}>
                        <Link
                          href={`/read/${novelId}/${entry.id}`}
                          onClick={() => setShowToc(false)}
                          className={cn(
                            'flex items-start gap-3 px-5 py-3.5 text-sm transition-colors border-b',
                            THEME_DIVIDER[theme],
                            isActive
                              ? `${THEME_TOC_ACTIVE[theme]} font-medium`
                              : THEME_TOC_HOVER[theme],
                          )}
                        >
                          <span className={cn(
                            'w-1 rounded-full mt-0.5 shrink-0 self-stretch',
                            isActive ? 'bg-primary-500' : 'bg-transparent',
                          )} />
                          <div className="min-w-0">
                            <p className="opacity-40 text-xs mb-0.5">Chương {entry.chapterNumber}</p>
                            <p className="truncate">{entry.title || `Chương ${entry.chapterNumber}`}</p>
                          </div>
                          <span className="ml-auto text-xs opacity-40 shrink-0 pt-0.5">
                            {formatNumber(entry.wordCount)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Bookmarks */}
            {bookmarks.length > 0 && (
              <>
                <div className={cn(
                  'px-5 py-2.5 border-t text-xs font-semibold uppercase tracking-wider opacity-50 shrink-0',
                  THEME_DIVIDER[theme],
                )}>
                  Đánh dấu
                </div>
                <div className="overflow-y-auto max-h-40 shrink-0">
                  {bookmarks.map((bm) => (
                    <Link
                      key={bm.id}
                      href={`/read/${novelId}/${bm.chapterId}`}
                      onClick={() => setShowToc(false)}
                      className={cn(
                        'flex items-center gap-3 px-5 py-3 text-sm transition-colors',
                        THEME_TOC_HOVER[theme],
                      )}
                    >
                      <BookmarkIcon className="h-3.5 w-3.5 shrink-0 text-primary-500" />
                      <span className="truncate">
                        Ch. {bm.chapter?.chapterNumber}
                        {bm.chapter?.title ? ` – ${bm.chapter.title}` : ''}
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* ── Settings Panel ──────────────────────────────────────────────── */}
      {showSettings && (
        <ReadingSettingsPanel onClose={() => setShowSettings(false)} />
      )}

    </div>
  );
}
