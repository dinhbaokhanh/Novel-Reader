'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { chaptersApi } from '@/lib/api/chapters';
import { Chapter } from '@/lib/types';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import RichTextEditor from '@/components/content/RichTextEditor';
import { ArrowLeft, Save, Trash2, X } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  title:         z.string().max(500, 'Tiêu đề tối đa 500 ký tự').optional(),
  content:       z.string().min(1, 'Nội dung không được để trống'),
  changeSummary: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditChapterPage() {
  const params    = useParams();
  const router    = useRouter();
  const novelId   = params.id        as string;
  const chapterId = params.chapterId as string;

  const [chapter,           setChapter]           = useState<Chapter | null>(null);
  const [error,             setError]             = useState('');
  const [isLoading,         setIsLoading]         = useState(true);
  const [isSaving,          setIsSaving]          = useState(false);
  const [isDeleting,        setIsDeleting]        = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDirty,           setIsDirty]           = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const contentValue = watch('content', '');

  // ── Load ────────────────────────────────────────────────────────────────
  useEffect(() => {
    chaptersApi.findOne(chapterId)
      .then((data) => {
        setChapter(data);
        setValue('content', data.content);
        setValue('title', data.title ?? '');
      })
      .catch((err: any) =>
        setError(err.response?.data?.message || 'Không thể tải nội dung chương')
      )
      .finally(() => setIsLoading(false));
  }, [chapterId, setValue]);

  // Track any change to mark form dirty
  useEffect(() => {
    const sub = watch(() => setIsDirty(true));
    return () => sub.unsubscribe();
  }, [watch]);

  // ── Save ────────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);
      setError('');
      await chaptersApi.updateContent(chapterId, {
        content:       data.content,
        title:         data.title || undefined,
        changeSummary: data.changeSummary || undefined,
      });
      setIsDirty(false);
      router.push(`/novels/${novelId}/chapters/${chapterId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật nội dung');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await chaptersApi.remove(chapterId);
      router.push(`/novels/${novelId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể xóa chương');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Guards ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
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

  return (
    <ProtectedLayout noPadding>
      {/* ── Sticky action bar ── dính ngay khi chạm top ─────────────────── */}
      <div className="sticky top-0 z-30
                      bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm
                      border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8
                        flex items-center justify-between h-14 gap-3">

          {/* Left: back + chapter label */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/novels/${novelId}/chapters/${chapterId}`}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800
                         hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400
                         dark:hover:text-gray-200 transition-colors shrink-0"
              title="Quay lại chương"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              Chương {chapter.chapterNumber}
              {chapter.title ? ` — ${chapter.title}` : ''}
            </span>
            {isDirty && (
              <span className="shrink-0 text-xs text-amber-600 dark:text-amber-400
                               bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                Chưa lưu
              </span>
            )}
          </div>

          {/* Right: delete + cancel + save */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg text-red-500 hover:text-red-700
                         hover:bg-red-50 dark:hover:bg-red-900/20
                         dark:text-red-400 dark:hover:text-red-300 transition-colors"
              title="Xóa chương"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <Link
              href={`/novels/${novelId}/chapters/${chapterId}`}
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium
                         border border-gray-300 dark:border-gray-600
                         text-gray-700 dark:text-gray-300
                         bg-white dark:bg-gray-700
                         hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Hủy
            </Link>

            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-medium text-white
                         bg-primary-600 hover:bg-primary-700 active:bg-primary-800
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-sm transition-colors"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {isSaving ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Page body ──────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                          p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-5">

          {/* ── Title ───────────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tiêu đề chương
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Để trống nếu chương không có tiêu đề"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                         rounded-lg shadow-sm focus:outline-none
                         focus:ring-primary-500 focus:border-primary-500
                         dark:bg-gray-700 dark:text-white text-sm"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* ── Content (rich text) ─────────────────────────────────────── */}
          <RichTextEditor
            value={contentValue}
            onChange={(md) => setValue('content', md, { shouldValidate: true })}
            minHeight={520}
            error={errors.content?.message}
          />

          {/* ── Change summary ───────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ghi chú thay đổi{' '}
              <span className="font-normal text-gray-400">(tùy chọn)</span>
            </label>
            <input
              {...register('changeSummary')}
              type="text"
              placeholder="VD: Sửa đoạn mở đầu, thêm chi tiết nhân vật..."
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                         rounded-lg shadow-sm focus:outline-none
                         focus:ring-primary-500 focus:border-primary-500
                         dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          {/* ── Bottom save (secondary, for convenience) ─────────────────── */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white
                         bg-primary-600 hover:bg-primary-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Đang lưu…' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete confirmation modal ──────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full z-10">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Xóa chương {chapter.chapterNumber}?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Hành động này không thể hoàn tác. Toàn bộ nội dung và lịch sử phiên bản sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                           font-medium text-gray-700 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white
                           bg-red-600 hover:bg-red-700
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Đang xóa…' : 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
