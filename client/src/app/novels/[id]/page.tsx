'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { novelsApi } from '@/lib/api/novels';
import { chaptersApi } from '@/lib/api/chapters';
import { Novel, Chapter } from '@/lib/types';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import {
  ArrowLeft, Edit, Plus, FileText, Lock, Unlock,
  Upload, BookOpen, Clock, BookMarked, Search, X,
  ArrowUpDown,
} from 'lucide-react';
import { formatDate, formatDateTime, getChapterStatusText, formatNumber } from '@/lib/utils';

type StatusFilter = 'all' | 'completed_locked' | 'completed_editable' | 'generating';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 50;

export default function NovelDetailPage() {
  const params  = useParams();
  const novelId = params.id as string;

  const [novel,     setNovel]     = useState<Novel | null>(null);
  const [chapters,  setChapters]  = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState('');

  // ── Filter / search state ─────────────────────────────────────────────
  const [query,        setQuery]        = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortDir,      setSortDir]      = useState<SortDir>(() => {
    if (typeof window === 'undefined') return 'asc';
    const saved = localStorage.getItem('chapterSortDir');
    return saved === 'desc' ? 'desc' : 'asc';
  });
  const [page, setPage] = useState(1);

  // Persist sort preference
  const handleSortToggle = () => {
    setSortDir((d) => {
      const next: SortDir = d === 'asc' ? 'desc' : 'asc';
      localStorage.setItem('chapterSortDir', next);
      return next;
    });
  };

  useEffect(() => {
    if (!novelId) return;
    setIsLoading(true);
    Promise.all([novelsApi.findOne(novelId), chaptersApi.findAll(novelId)])
      .then(([n, c]) => { setNovel(n); setChapters(c); })
      .catch((err: any) => setError(err.response?.data?.message || 'Không thể tải thông tin truyện'))
      .finally(() => setIsLoading(false));
  }, [novelId]);

  // Reset page khi filter / sort thay đổi
  useEffect(() => { setPage(1); }, [query, statusFilter, sortDir]);

  // ── Derived list ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = chapters.filter((c) => {
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchQuery  = !q
        || String(c.chapterNumber).includes(q)
        || (c.title?.toLowerCase().includes(q) ?? false);
      return matchStatus && matchQuery;
    });

    return sortDir === 'asc'
      ? result
      : [...result].sort((a, b) => b.chapterNumber - a.chapterNumber);
  }, [chapters, query, statusFilter, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </ProtectedLayout>
    );
  }
  if (error || !novel) {
    return (
      <ProtectedLayout>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error || 'Không tìm thấy truyện'}
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">

        {/* Back */}
        <Link href="/novels"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700
                     dark:text-gray-400 dark:hover:text-gray-300">
          <ArrowLeft className="h-4 w-4 mr-2" />Quay lại danh sách
        </Link>

        {/* Novel header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">{novel.title}</h1>
              {novel.description && (
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 whitespace-pre-line">{novel.description}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                {novel.genre && (
                  <span className="flex items-center"><BookOpen className="h-4 w-4 mr-1" />{novel.genre}</span>
                )}
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />{formatNumber(novel.chapterCount)} chương
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />{formatDate(novel.updatedAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {chapters.length > 0 && (
                <Link href={`/read/${novelId}/${chapters[0].id}`}
                  className="flex-1 md:flex-none justify-center inline-flex items-center px-4 py-2.5 md:py-2 border border-transparent
                             rounded-lg shadow-sm text-sm font-medium text-white
                             bg-primary-600 hover:bg-primary-700">
                  <BookMarked className="h-4 w-4 mr-2" />Đọc ngay
                </Link>
              )}
              <Link href={`/novels/${novelId}/edit`}
                className="flex-1 md:flex-none justify-center inline-flex items-center px-4 py-2.5 md:py-2 border border-gray-300
                           dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium
                           text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700
                           hover:bg-gray-50 dark:hover:bg-gray-600">
                <Edit className="h-4 w-4 mr-2" />Chỉnh sửa
              </Link>
            </div>
          </div>
        </div>

        {/* Chapters section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">

          {/* Section header */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Danh sách chương
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({filtered.length}/{chapters.length})
              </span>
            </h2>
            <div className="flex gap-2 shrink-0">
              <Link href={`/novels/${novelId}/chapters/import`}
                className="inline-flex items-center px-3 py-2 border border-gray-300
                           dark:border-gray-600 rounded-lg text-sm font-medium
                           text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700
                           hover:bg-gray-50 dark:hover:bg-gray-600">
                <Upload className="h-4 w-4 mr-1.5" />Import
              </Link>
              <Link href={`/novels/${novelId}/chapters/new`}
                className="inline-flex items-center px-3 py-2 border border-transparent
                           rounded-lg text-sm font-medium text-white
                           bg-primary-600 hover:bg-primary-700">
                <Plus className="h-4 w-4 mr-1.5" />Tạo chương
              </Link>
            </div>
          </div>

          {/* Search + filter bar */}
          {chapters.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2
                                   h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm theo số chương hoặc tiêu đề…"
                  className="w-full pl-9 pr-9 py-2.5 sm:py-2 text-sm border border-gray-300
                             dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700
                             text-gray-900 dark:text-white placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {query && (
                  <button onClick={() => setQuery('')}
                    aria-label="Xóa tìm kiếm"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5
                               text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort + Status filter pills */}
              <div className="flex gap-1.5 items-center overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                {/* Sort direction toggle */}
                <button
                  onClick={handleSortToggle}
                  title={sortDir === 'asc' ? 'Đang: Cũ → Mới' : 'Đang: Mới → Cũ'}
                  className="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg
                             text-xs font-medium border transition-colors
                             border-gray-300 dark:border-gray-600
                             bg-white dark:bg-gray-700
                             text-gray-700 dark:text-gray-300
                             hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  {sortDir === 'asc' ? 'Ch. tăng dần' : 'Ch. giảm dần'}
                </button>

                {/* Status filter pills */}
                {(
                  [
                    { value: 'all',                label: 'Tất cả' },
                    { value: 'completed_locked',   label: 'Đã khóa' },
                    { value: 'completed_editable', label: 'Chỉnh sửa được' },
                  ] as { value: StatusFilter; label: string }[]
                ).map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`shrink-0 whitespace-nowrap px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${statusFilter === f.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chapter list */}
          {chapters.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Chưa có chương nào
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Bắt đầu bằng cách tạo chương đầu tiên hoặc import từ file
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
              Không tìm thấy chương nào phù hợp
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                {paginated.map((chapter) => (
                  <div key={chapter.id}
                    className="flex items-center px-3 sm:px-4 py-3 border border-gray-200
                               dark:border-gray-700 rounded-lg
                               hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <Link href={`/novels/${novelId}/chapters/${chapter.id}`}
                      className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 w-12 sm:w-16">
                          Ch.{chapter.chapterNumber}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {chapter.title || `Chương ${chapter.chapterNumber}`}
                        </span>
                      </div>
                      <div className="mt-0.5 ml-14 sm:ml-[4.5rem] flex items-center gap-3 text-xs
                                      text-gray-500 dark:text-gray-400">
                        <span>{formatNumber(chapter.wordCount)} từ</span>
                        <span>{getChapterStatusText(chapter.status)}</span>
                        <span className="hidden sm:inline">{formatDateTime(chapter.updatedAt)}</span>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 ml-2 sm:ml-3 shrink-0">
                      <Link href={`/read/${novelId}/${chapter.id}`}
                        title="Đọc chương"
                        className="inline-flex items-center px-2.5 py-2 sm:py-1.5 rounded-lg text-xs
                                   font-medium text-primary-600 bg-primary-50
                                   hover:bg-primary-100 dark:text-primary-400
                                   dark:bg-primary-900/30 dark:hover:bg-primary-900/50">
                        <BookOpen className="h-4 w-4 sm:h-3.5 sm:w-3.5 sm:mr-1" /><span className="hidden sm:inline">Đọc</span>
                      </Link>
                      {chapter.status === 'completed_locked'
                        ? <Lock className="h-4 w-4 text-gray-400" />
                        : chapter.status === 'completed_editable'
                          ? <Unlock className="h-4 w-4 text-gray-400" />
                          : null}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 mt-4 pt-4
                                border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Trang {page}/{totalPages} · {filtered.length} chương
                  </span>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 sm:py-1.5 text-xs rounded-lg border border-gray-300
                                 dark:border-gray-600 disabled:opacity-40
                                 hover:bg-gray-50 dark:hover:bg-gray-700
                                 text-gray-700 dark:text-gray-300">
                      ← Trước
                    </button>

                    {/* Page number buttons — show max 5 around current */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages
                        || Math.abs(p - page) <= 2)
                      .reduce<(number | '…')[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, i) =>
                        item === '…' ? (
                          <span key={`ellipsis-${i}`}
                            className="px-2 py-1.5 text-xs text-gray-400">…</span>
                        ) : (
                          <button key={item}
                            onClick={() => setPage(item as number)}
                            className={`min-w-[2.25rem] px-3 py-2 sm:py-1.5 text-xs rounded-lg border transition-colors
                              ${page === item
                                ? 'bg-primary-600 border-primary-600 text-white'
                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                            {item}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-2 sm:py-1.5 text-xs rounded-lg border border-gray-300
                                 dark:border-gray-600 disabled:opacity-40
                                 hover:bg-gray-50 dark:hover:bg-gray-700
                                 text-gray-700 dark:text-gray-300">
                      Sau →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
