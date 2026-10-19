'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { novelsApi } from '@/lib/api/novels';
import { readerApi } from '@/lib/api/reader';
import { Novel } from '@/lib/types';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import {
  BookOpen, Clock, FileText, BookMarked, ArrowRight,
} from 'lucide-react';
import { formatDate, formatNumber, getNovelStatusText } from '@/lib/utils';

interface NovelWithProgress extends Novel {
  continueChapterId?: string | null;
}

export default function ReaderHomePage() {
  const router = useRouter();
  const [novels,    setNovels]    = useState<NovelWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await novelsApi.findAll();

        // For each novel, fetch continue position in parallel (best-effort)
        const withProgress: NovelWithProgress[] = await Promise.all(
          data.map(async (novel) => {
            try {
              const pos = await readerApi.getContinuePosition(novel.id);
              return { ...novel, continueChapterId: pos.chapterId };
            } catch {
              return { ...novel, continueChapterId: null };
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

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Thư viện
          </h1>
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

  const handleRead = () => {
    if (novel.continueChapterId) {
      router.push(`/read/${novel.id}/${novel.continueChapterId}`);
    }
  };

  const canRead = !!novel.continueChapterId && novel.chapterCount > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg
                    transition-shadow overflow-hidden flex flex-col">
      {/* Colour strip by status */}
      <div
        className={`h-1.5 w-full ${
          novel.status === 'completed'
            ? 'bg-green-400'
            : novel.status === 'active'
              ? 'bg-primary-400'
              : novel.status === 'archived'
                ? 'bg-gray-300'
                : 'bg-amber-300'
        }`}
      />

      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Title + status */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
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
              <BookOpen className="h-3.5 w-3.5" />
              {novel.genre}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {formatNumber(novel.chapterCount)} chương
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(novel.updatedAt)}
          </span>
        </div>

        {/* Action */}
        <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700
                        flex items-center justify-between gap-2">
          {/* TOC link */}
          <Link
            href={`/read/${novel.id}/toc`}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600
                       dark:hover:text-primary-400 transition-colors"
          >
            Xem mục lục
          </Link>

          {/* Continue / Start reading */}
          <button
            onClick={handleRead}
            disabled={!canRead}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                        transition-colors
                        ${canRead
                          ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
          >
            <BookMarked className="h-4 w-4" />
            {novel.continueChapterId ? 'Tiếp tục đọc' : 'Chưa có chương'}
            {canRead && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
