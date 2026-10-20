'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { novelsApi } from '@/lib/api/novels';
import { Novel } from '@/lib/types';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Plus, BookOpen, Clock, FileText } from 'lucide-react';
import { formatDate, getNovelStatusText, formatNumber } from '@/lib/utils';

// ── Status badge — màu riêng cho từng trạng thái ──────────────────────────────
function NovelStatusBadge({ status }: { status: Novel['status'] }) {
  const styles: Record<Novel['status'], string> = {
    draft:     'bg-gray-100    text-gray-600    dark:bg-gray-700  dark:text-gray-300',
    active:    'bg-green-100   text-green-700   dark:bg-green-900/40 dark:text-green-400',
    completed: 'bg-blue-100    text-blue-700    dark:bg-blue-900/40  dark:text-blue-400',
    archived:  'bg-amber-100   text-amber-700   dark:bg-amber-900/40 dark:text-amber-400',
  };
  return (
    <span className={`ml-2 shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>
      {getNovelStatusText(status)}
    </span>
  );
}

export default function NovelsPage() {
  const router = useRouter();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    try {
      setIsLoading(true);
      const data = await novelsApi.findAll();
      setNovels(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách truyện');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Truyện của tôi
          </h1>
          <Link
            href="/novels/new"
            className="shrink-0 inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-5 w-5 mr-1.5 sm:mr-2" />
            <span className="sm:hidden">Tạo mới</span>
            <span className="hidden sm:inline">Tạo truyện mới</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : novels.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Chưa có truyện nào
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bắt đầu bằng cách tạo truyện đầu tiên của bạn
            </p>
            <div className="mt-6">
              <Link
                href="/novels/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Tạo truyện mới
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {novels.map((novel) => (
              <Link
                key={novel.id}
                href={`/novels/${novel.id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg active:scale-[0.99] transition overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {novel.title}
                    </h3>
                    <NovelStatusBadge status={novel.status} />
                  </div>

                  {novel.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {novel.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 md:block md:space-y-2">
                    {novel.genre && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {novel.genre}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FileText className="h-4 w-4 mr-2" />
                      {formatNumber(novel.chapterCount)} chương
                    </div>

                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatDate(novel.updatedAt)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
