'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { chaptersApi } from '@/lib/api/chapters';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import RichTextEditor from '@/components/content/RichTextEditor';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  chapterNumber: z.number().int().positive('Số chương phải lớn hơn 0'),
  title:   z.string().max(500).optional(),
  content: z.string().min(1, 'Nội dung không được để trống'),
});

type FormData = z.infer<typeof schema>;

export default function NewChapterPage() {
  const params  = useParams();
  const router  = useRouter();
  const novelId = params.id as string;

  const [error,           setError]           = useState('');
  const [isLoading,       setIsLoading]       = useState(false);
  const [suggestedNumber, setSuggestedNumber] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { chapterNumber: 1, content: '' },
  });

  const contentValue = watch('content', '');

  // Auto-suggest next chapter number
  useEffect(() => {
    chaptersApi.findAll(novelId)
      .then((chapters) => {
        const next = chapters.length > 0
          ? Math.max(...chapters.map((c) => c.chapterNumber)) + 1
          : 1;
        setSuggestedNumber(next);
        setValue('chapterNumber', next);
      })
      .catch(() => { /* keep default 1 */ });
  }, [novelId, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError('');
      await chaptersApi.create(novelId, data);
      router.push(`/novels/${novelId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tạo chương');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedLayout noPadding>

      {/* ── Sticky action bar ── dính ngay khi chạm top ─────────────────── */}
      <div className="sticky top-0 z-30
                      bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm
                      border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8
                        flex items-center justify-between h-14 gap-3">

          {/* Left: back + label */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href={`/novels/${novelId}`}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800
                         hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400
                         dark:hover:text-gray-200 transition-colors shrink-0"
              title="Quay lại truyện"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              Tạo chương mới
            </span>
          </div>

          {/* Right: cancel + create */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/novels/${novelId}`}
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
              disabled={isLoading}
              className="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-medium text-white
                         bg-primary-600 hover:bg-primary-700 active:bg-primary-800
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {isLoading ? 'Đang tạo…' : 'Tạo chương'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Page body ──────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16">

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                          p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 space-y-5">

          {/* ── Số chương + Tiêu đề ───────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Số chương <span className="text-red-500">*</span>
              </label>
              <input
                {...register('chapterNumber', { valueAsNumber: true })}
                type="number"
                min="1"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                           rounded-lg shadow-sm focus:outline-none
                           focus:ring-primary-500 focus:border-primary-500
                           dark:bg-gray-700 dark:text-white text-sm"
              />
              <p className="mt-1 text-xs text-gray-400">
                Gợi ý: Chương {suggestedNumber}
              </p>
              {errors.chapterNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.chapterNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tiêu đề{' '}
                <span className="font-normal text-gray-400">(tùy chọn)</span>
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
            </div>
          </div>

          {/* ── Content (rich text) ─────────────────────────────────────── */}
          <RichTextEditor
            value={contentValue}
            onChange={(md) => setValue('content', md, { shouldValidate: true })}
            minHeight={520}
            error={errors.content?.message}
          />

          {/* ── Bottom create (secondary) ────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="w-full sm:w-auto justify-center inline-flex items-center px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium text-white
                         bg-primary-600 hover:bg-primary-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isLoading ? 'Đang tạo…' : 'Tạo chương'}
            </button>
          </div>
        </div>
      </div>

    </ProtectedLayout>
  );
}
