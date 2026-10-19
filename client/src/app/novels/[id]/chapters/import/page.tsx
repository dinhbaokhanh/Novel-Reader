'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { chaptersApi } from '@/lib/api/chapters';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import Link from 'next/link';

interface ImportFormData {
  startChapterNumber: number;
  file: FileList;
}

export default function ImportChaptersPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = params.id as string;

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [suggestedStart, setSuggestedStart] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ImportFormData>({
    defaultValues: {
      startChapterNumber: 1,
    },
  });

  // Auto-suggest next chapter number based on existing chapters
  useEffect(() => {
    const fetchNextChapterNumber = async () => {
      try {
        const chapters = await chaptersApi.findAll(novelId);
        if (chapters.length > 0) {
          const maxNumber = Math.max(...chapters.map((c) => c.chapterNumber));
          const next = maxNumber + 1;
          setSuggestedStart(next);
          setValue('startChapterNumber', next);
        } else {
          setSuggestedStart(1);
          setValue('startChapterNumber', 1);
        }
      } catch (err) {
        console.error('Failed to fetch chapters:', err);
      }
    };

    fetchNextChapterNumber();
  }, [novelId, setValue]);

  const onSubmit = async (data: ImportFormData) => {
    if (!selectedFile) {
      setError('Vui lòng chọn file');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const result = await chaptersApi.importFromFile(
        novelId,
        selectedFile,
        data.startChapterNumber
      );
      router.push(`/novels/${novelId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể import chapters');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/novels/${novelId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại truyện
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Import chương từ file
          </h1>

          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Hướng dẫn:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>File phải có định dạng .txt, .md hoặc .pdf</li>
              <li>Mỗi chương bắt đầu bằng heading <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded"># Chương X</code> hoặc <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">## Chapter X</code></li>
              <li>Nội dung của chương nằm sau tiêu đề</li>
              <li>File .md sẽ giữ nguyên Markdown (bold, italic, headings, lists...)</li>
              <li>File .pdf sẽ tự động trích xuất text</li>
              <li>Kích thước file tối đa: 10MB</li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bắt đầu từ số chương
              </label>
              <input
                {...register('startChapterNumber', { valueAsNumber: true })}
                type="number"
                min="1"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Gợi ý: Bắt đầu từ chương {suggestedStart} (tự động đề xuất)
              </p>
              {errors.startChapterNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.startChapterNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chọn file <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                <div className="space-y-1 text-center">
                  {selectedFile ? (
                    <FileText className="mx-auto h-12 w-12 text-primary-600" />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedFile ? (
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                    ) : (
                      <>
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                        >
                          <span>Chọn file</span>
                          <input
                            id="file-upload"
                            type="file"
                            accept=".txt,.md,.pdf"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setSelectedFile(file);
                            }}
                          />
                        </label>
                        <p className="pl-1">hoặc kéo thả vào đây</p>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    TXT, MD, PDF tối đa 10MB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href={`/novels/${novelId}`}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang import...' : 'Import'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedLayout>
  );
}
