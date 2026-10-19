'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { novelsApi } from '@/lib/api/novels';
import { readerApi } from '@/lib/api/reader';
import { Novel, TocEntry } from '@/lib/types';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import {
  BookOpen, Clock, FileText, BookMarked,
  PlayCircle, ChevronRight, ChevronDown, ChevronUp,
  Search, X,
} from 'lucide-react';
import { formatDate, formatNumber, getNovelStatusText } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NovelWithProgress extends Novel {
  toc:               TocEntry[];
  firstChapterId:    string | null;
  continueChapterId: string | null;
  continueChapterNo: number | null;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ReaderHomePage() {
  const [novels,    setNovels]    = useState<NovelWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await novelsApi.findAll();

        const withProgress: NovelWithProgress[] = await Promise.all(
          data.map(async (novel) => {
            try {
              const [pos, toc] = await Promise.all([
                readerApi.getContinuePosition(novel.id),
                readerApi.getTableOfContents(novel.id),
              ]);
              const firstChapterId    = toc[0]?.id ?? null;
              const continueEntry     = toc.find((t) => t.id === pos.chapterId);
              return {
                ...novel,
                toc,
                firstChapterId,
                continueChapterId: pos.chapterId,
                continueChapterNo: continueEntry?.chapterNumber ?? null,
              };
            } catch {
              return { ...novel, toc: [], firstChapterId: null, continueChapterId: null, continueChapterNo: null };
            }
          }),
        );

        setNovels(withProgress);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải thư viện');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ProtectedLayout>
      <div className="space-y-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thư viện</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Chọn truyện bạn muốn đọc hôm nay
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        ) : novels.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow">
            <BookOpen className="mx-auto h-14 w-14 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-base font-semibold text-gray-700 dark:text-gray-300">
              Chưa có truyện nào
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Chuyển sang chế độ Tác giả để thêm truyện mới.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {novels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}

// ─── Novel card ──────────────────────────────────────────────────────────────

function NovelCard({ novel }: { novel: NovelWithProgress }) {
  const router = useRouter();

  const [tocOpen,  setTocOpen]  = useState(false);
  const [tocQuery, setTocQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const hasChapters = novel.chapterCount > 0 && !!novel.firstChapterId;
  const hasContinue = !!novel.continueChapterId
                      && novel.continueChapterId !== novel.firstChapterId;

  const filteredToc = novel.toc.filter((entry) => {
    const q = tocQuery.trim().toLowerCase();
    if (!q) return true;
    return String(entry.chapterNumber).includes(q)
        || (entry.title?.toLowerCase().includes(q) ?? false);
  });

  const toggleToc = () => {
    setTocOpen((v) => {
      if (!v) setTimeout(() => searchRef.current?.focus(), 100);
      return !v;
    });
    if (tocOpen) setTocQuery('');
  };

  const statusColor: Record<Novel['status'], string> = {
    draft:     'bg-amber-300',
    active:    'bg-primary-400',
    completed: 'bg-green-400',
    archived:  'bg-gray-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg
                    transition-shadow overflow-hidden flex flex-col">
      {/* Status strip */}
      <div className={`h-1.5 w-full ${statusColor[novel.status]}`} />

      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* Title + status */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white
                           leading-snug line-clamp-2">
              {novel.title}
            </h3>
            <span className="shrink-0 text-xs px-2 py-0.5 rounded-full
                             bg-gray-100 dark:bg-gray-700
                             text-gray-600 dark:text-gray-400">
              {getNovelStatusText(novel.status)}
            </span>
          </div>
          {novel.description && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {novel.description}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-400">
          {novel.genre && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />{novel.genre}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />{formatNumber(novel.chapterCount)} chương
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />{formatDate(novel.updatedAt)}
          </span>
        </div>

        {/* ── Inline TOC panel ──────────────────────────────────────────── */}
        {tocOpen && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700
                          overflow-hidden">
            {/* Search inside TOC */}
            <div className="flex items-center gap-2 px-3 py-2
                            border-b border-gray-200 dark:border-gray-700
                            bg-gray-50 dark:bg-gray-700/50">
              <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={tocQuery}
                onChange={(e) => setTocQuery(e.target.value)}
                placeholder="Tìm chương…"
                className="flex-1 text-xs bg-transparent outline-none
                           text-gray-700 dark:text-gray-300
                           placeholder-gray-400 dark:placeholder-gray-500"
              />
              {tocQuery && (
                <button onClick={() => setTocQuery('')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Chapter list — scrollable, max 10 rows visible */}
            <ul className="overflow-y-auto max-h-60 divide-y divide-gray-100 dark:divide-gray-700">
              {filteredToc.length === 0 ? (
                <li className="px-4 py-3 text-xs text-gray-400 text-center">
                  Không tìm thấy chương nào
                </li>
              ) : filteredToc.map((entry) => {
                const isCurrent = entry.id === novel.continueChapterId;
                return (
                  <li key={entry.id}>
                    <button
                      onClick={() => router.push(`/read/${novel.id}/${entry.id}`)}
                      className={`w-full text-left flex items-center justify-between
                                  px-4 py-2.5 transition-colors
                                  ${isCurrent
                                    ? 'bg-primary-50 dark:bg-primary-900/20'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                          )}
                          <span className={`text-xs truncate
                            ${isCurrent
                              ? 'font-medium text-primary-700 dark:text-primary-300'
                              : 'text-gray-700 dark:text-gray-300'}`}>
                            <span className="text-gray-400 dark:text-gray-500 mr-1.5">
                              Ch.{entry.chapterNumber}
                            </span>
                            {entry.title || `Chương ${entry.chapterNumber}`}
                          </span>
                        </div>
                      </div>
                      <span className="ml-3 text-xs text-gray-400 shrink-0">
                        {formatNumber(entry.wordCount)} từ
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">

          {/* Tiếp tục đọc */}
          {hasContinue && (
            <button
              onClick={() => router.push(`/read/${novel.id}/${novel.continueChapterId}`)}
              className="w-full inline-flex items-center justify-between px-4 py-2.5
                         rounded-xl text-sm font-medium text-white
                         bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
            >
              <span className="flex items-center gap-2">
                <BookMarked className="h-4 w-4 shrink-0" />
                Tiếp tục — Ch.{novel.continueChapterNo}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </button>
          )}

          {/* Đọc từ đầu + toggle Mục lục */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                hasChapters && router.push(`/read/${novel.id}/${novel.firstChapterId}`)
              }
              disabled={!hasChapters}
              className={`flex-1 inline-flex items-center justify-center gap-2
                          px-3 py-2 rounded-xl text-sm font-medium transition-colors
                          ${hasChapters
                            ? hasContinue
                              ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                              : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
            >
              <PlayCircle className="h-4 w-4 shrink-0" />
              {hasChapters ? 'Đọc từ đầu' : 'Chưa có chương'}
            </button>

            {/* Mục lục toggle — mở inline ngay trong card */}
            <button
              onClick={toggleToc}
              disabled={!hasChapters}
              className={`inline-flex items-center justify-center gap-1.5
                          px-3 py-2 rounded-xl text-sm font-medium transition-colors
                          ${tocOpen
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                            : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}
                          disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {tocOpen
                ? <ChevronUp className="h-4 w-4" />
                : <ChevronDown className="h-4 w-4" />}
              <span className="hidden sm:inline">Mục lục</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
