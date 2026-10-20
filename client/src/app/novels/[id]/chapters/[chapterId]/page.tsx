'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { chaptersApi } from '@/lib/api/chapters';
import { Chapter, ChapterVersion } from '@/lib/types';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import {
  ArrowLeft,
  Lock,
  Unlock,
  History,
  Edit,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDateTime, getChapterStatusText, formatNumber } from '@/lib/utils';

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = params.id as string;
  const chapterId = params.chapterId as string;

  const systemTheme = useSystemTheme();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [versions, setVersions] = useState<ChapterVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (chapterId) {
      loadChapter();
    }
  }, [chapterId]);

  const loadChapter = async () => {
    try {
      setIsLoading(true);
      const data = await chaptersApi.findOne(chapterId);
      setChapter(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải nội dung chương');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      const data = await chaptersApi.getVersions(chapterId);
      setVersions(data);
      setShowVersions(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử phiên bản');
    }
  };

  const handleLock = async () => {
    if (!chapter) return;
    try {
      setIsActionLoading(true);
      const updated = await chaptersApi.lock(chapterId);
      setChapter(updated);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể khóa chương');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!chapter) return;
    try {
      setIsActionLoading(true);
      const updated = await chaptersApi.unlock(chapterId);
      setChapter(updated);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể mở khóa chương');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm('Bạn có chắc muốn khôi phục phiên bản này?')) return;

    try {
      setIsActionLoading(true);
      const updated = await chaptersApi.restoreVersion(chapterId, versionId);
      setChapter(updated);
      setShowVersions(false);
      await loadVersions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể khôi phục phiên bản');
    } finally {
      setIsActionLoading(false);
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

  if (error && !chapter) {
    return (
      <ProtectedLayout>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      </ProtectedLayout>
    );
  }

  if (!chapter) return null;

  const canEdit = chapter.status === 'completed_editable';

  return (
    <ProtectedLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link
            href={`/novels/${novelId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại truyện
          </Link>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Chapter Header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Chương {chapter.chapterNumber}
                </h1>
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {getChapterStatusText(chapter.status)}
                </span>
              </div>
              {chapter.title && (
                <h2 className="mt-2 text-lg sm:text-xl text-gray-700 dark:text-gray-300 break-words">
                  {chapter.title}
                </h2>
              )}
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {formatNumber(chapter.wordCount)} từ • {formatDateTime(chapter.updatedAt)}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0 [&>*]:flex-1 [&>*]:justify-center md:[&>*]:flex-none">
              <button
                onClick={() => loadVersions()}
                className="inline-flex items-center px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <History className="h-4 w-4 mr-2" />
                Lịch sử
              </button>

              {canEdit && (
                <>
                  <Link
                    href={`/novels/${novelId}/chapters/${chapterId}/edit`}
                    className="inline-flex items-center px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Link>
                  <button
                    onClick={handleLock}
                    disabled={isActionLoading}
                    className="inline-flex items-center px-4 py-2.5 md:py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Khóa
                  </button>
                </>
              )}

              {chapter.status === 'completed_locked' && (
                <button
                  onClick={handleUnlock}
                  disabled={isActionLoading}
                  className="inline-flex items-center px-4 py-2.5 md:py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Mở khóa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Versions Sidebar */}
        {showVersions && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Lịch sử phiên bản
            </h3>
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Phiên bản {version.versionNumber}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(version.createdAt)} • {formatNumber(version.wordCount)} từ
                    </div>
                    {version.changeSummary && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {version.changeSummary}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRestoreVersion(version.id)}
                    disabled={isActionLoading || !canEdit}
                    className="shrink-0 px-2 py-1.5 -mr-1 rounded-lg text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Khôi phục
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chapter Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-8">
          {chapter.title && (
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl sm:text-3xl font-sans font-bold text-gray-900 dark:text-white break-words">
                {chapter.title}
              </h1>
            </div>
          )}
          <MarkdownRenderer content={chapter.content} theme={systemTheme} />
        </div>
      </div>
    </ProtectedLayout>
  );
}
