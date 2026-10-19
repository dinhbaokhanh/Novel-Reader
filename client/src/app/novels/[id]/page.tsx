'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { novelsApi } from '@/lib/api/novels';
import { chaptersApi } from '@/lib/api/chapters';
import { Novel, Chapter } from '@/lib/types';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import {
  ArrowLeft,
  Edit,
  Plus,
  FileText,
  Lock,
  Unlock,
  Upload,
  BookOpen,
  Clock,
  BookMarked,
} from 'lucide-react';
import { formatDate, formatDateTime, getChapterStatusText, formatNumber } from '@/lib/utils';

export default function NovelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = params.id as string;

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (novelId) {
      loadNovelAndChapters();
    }
  }, [novelId]);

  const loadNovelAndChapters = async () => {
    try {
      setIsLoading(true);
      const [novelData, chaptersData] = await Promise.all([
        novelsApi.findOne(novelId),
        chaptersApi.findAll(novelId),
      ]);
      setNovel(novelData);
      setChapters(chaptersData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông tin truyện');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
        <div className="mb-6">
          <Link
            href="/novels"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </div>

        {/* Novel Header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {novel.title}
              </h1>
              {novel.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {novel.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                {novel.genre && (
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {novel.genre}
                  </div>
                )}
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {formatNumber(novel.chapterCount)} chương
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(novel.updatedAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {chapters.length > 0 && (
                <Link
                  href={`/read/${novelId}/${chapters[0].id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <BookMarked className="h-4 w-4 mr-2" />
                  Đọc ngay
                </Link>
              )}
              <Link
                href={`/novels/${novelId}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Link>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Danh sách chương
            </h2>
            <div className="flex space-x-3">
              <Link
                href={`/novels/${novelId}/chapters/import`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import từ file
              </Link>
              <Link
                href={`/novels/${novelId}/chapters/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo chương mới
              </Link>
            </div>          </div>

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
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Link
                    href={`/novels/${novelId}/chapters/${chapter.id}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Chương {chapter.chapterNumber}
                      </span>
                      {chapter.title && (
                        <span className="text-base font-medium text-gray-900 dark:text-white truncate">
                          {chapter.title}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{formatNumber(chapter.wordCount)} từ</span>
                      <span>•</span>
                      <span>{getChapterStatusText(chapter.status)}</span>
                      <span>•</span>
                      <span>{formatDateTime(chapter.updatedAt)}</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <Link
                      href={`/read/${novelId}/${chapter.id}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 dark:text-primary-400 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 transition-colors"
                    >
                      <BookOpen className="h-3.5 w-3.5 mr-1" />
                      Đọc
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
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
