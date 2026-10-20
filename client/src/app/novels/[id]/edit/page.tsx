'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { novelsApi } from '@/lib/api/novels';
import { Novel } from '@/lib/types';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

const updateNovelSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(300, 'Tiêu đề quá dài'),
  description: z.string().optional(),
  genre: z.string().optional(),
  writingStyle: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived'] as const).optional(),
  isPrivate: z.boolean().optional(),
  writingNotes: z.string().optional(),
});

import { NovelStatus } from '@/lib/types';

type UpdateNovelFormData = z.infer<typeof updateNovelSchema>;

export default function EditNovelPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = params.id as string;

  const [novel, setNovel] = useState<Novel | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateNovelFormData>({
    resolver: zodResolver(updateNovelSchema),
  });

  useEffect(() => {
    if (novelId) {
      loadNovel();
    }
  }, [novelId]);

  const loadNovel = async () => {
    try {
      setIsLoading(true);
      const data = await novelsApi.findOne(novelId);
      setNovel(data);
      setValue('title', data.title);
      setValue('description', data.description || '');
      setValue('genre', data.genre || '');
      setValue('writingStyle', data.writingStyle || '');
      setValue('status', data.status);
      setValue('isPrivate', data.isPrivate);
      setValue('writingNotes', data.writingNotes || '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông tin truyện');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UpdateNovelFormData) => {
    try {
      setIsSaving(true);
      setError('');
      await novelsApi.update(novelId, data as import('@/lib/types').UpdateNovelDto);
      router.push(`/novels/${novelId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật truyện');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('Bạn có chắc muốn lưu trữ (xóa) truyện này?')) return;

    try {
      await novelsApi.archive(novelId);
      router.push('/novels');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lưu trữ truyện');
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

  if (error && !novel) {
    return (
      <ProtectedLayout>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      </ProtectedLayout>
    );
  }

  if (!novel) return null;

  return (
    <ProtectedLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/novels/${novelId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại truyện
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Chỉnh sửa truyện
          </h1>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mô tả
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Thể loại
                </label>
                <input
                  {...register('genre')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trạng thái
                </label>
                <select
                  {...register('status')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="draft">Nháp</option>
                  <option value="active">Đang viết</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phong cách viết
              </label>
              <textarea
                {...register('writingStyle')}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ghi chú sáng tác
              </label>
              <textarea
                {...register('writingNotes')}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <label className="flex items-center py-1 cursor-pointer select-none">
              <input
                {...register('isPrivate')}
                type="checkbox"
                className="h-5 w-5 sm:h-4 sm:w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Chế độ riêng tư
              </span>
            </label>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleArchive}
                className="justify-center inline-flex items-center px-4 py-2.5 sm:py-2 border border-red-300 dark:border-red-600 rounded-lg shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Lưu trữ truyện
              </button>

              <div className="flex gap-3 [&>*]:flex-1 sm:[&>*]:flex-none [&>*]:justify-center [&>*]:text-center [&>*]:py-2.5 sm:[&>*]:py-2">
                <Link
                  href={`/novels/${novelId}`}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Hủy
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedLayout>
  );
}
