'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { novelsApi } from '@/lib/api/novels';
import { readerApi } from '@/lib/api/reader';
import { Novel, TocEntry } from '@/lib/types';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { ArrowLeft, BookMarked } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function TocPage() {
  const params  = useParams();
  const router  = useRouter();
  const novelId = params.novelId as string;

  const [novel,      setNovel]      = useState<Novel | null>(null);
  const [toc,        setToc]        = useState<TocEntry[]>([]);
  const [continueId, setContinueId] = useState<string | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [novelData, tocData, pos] = await Promise.all([
          novelsApi.findOne(novelId),
          readerApi.getTableOfContents(novelId),
          readerApi.getContinuePosition(novelId),
        ]);
        setNovel(novelData);
        setToc(tocData);
        setContinueId(pos.chapterId);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải mục lục');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [novelId]);

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
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
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <Link
          href="/read"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700
                     dark:text-gray-400 dark:hover:text-gray-300 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Thư viện
        </Link>

        {/* Novel header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 sm:p-6 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold break-words text-gray-900 dark:text-white">
            {novel.title}
          </h1>
          {novel.description && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {novel.description}
            </p>
          )}

          {continueId && (
            <Link
              href={`/read/${novelId}/${continueId}`}
              className="mt-4 w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl text-sm
                         font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <BookMarked className="h-4 w-4" />
              Tiếp tục đọc
            </Link>
          )}
        </div>

        {/* Chapter list */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {formatNumber(toc.length)} chương
            </p>
          </div>

          {toc.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">
              Chưa có chương nào
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {toc.map((entry) => {
                const isCurrent = entry.id === continueId;
                return (
                  <li key={entry.id}>
                    <Link
                      href={`/read/${novelId}/${entry.id}`}
                      className={`flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 transition-colors
                                  ${isCurrent
                                    ? 'bg-primary-50 dark:bg-primary-900/20'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {isCurrent && (
                            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500" />
                          )}
                          <span className="text-xs text-gray-400 shrink-0">
                            Chương {entry.chapterNumber}
                          </span>
                        </div>
                        {entry.title && (
                          <p className={`mt-0.5 text-sm font-medium truncate
                                         ${isCurrent
                                           ? 'text-primary-700 dark:text-primary-300'
                                           : 'text-gray-900 dark:text-gray-100'}`}>
                            {entry.title}
                          </p>
                        )}
                      </div>
                      <span className="ml-4 shrink-0 text-xs text-gray-400">
                        {formatNumber(entry.wordCount)} từ
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </ProtectedLayout>
  );
}
