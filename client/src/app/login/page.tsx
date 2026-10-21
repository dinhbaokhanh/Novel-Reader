'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth';
import { BookOpen } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await authApi.login(data);
      setUser(response.user);
      router.push('/novels');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="surface-grid flex min-h-screen items-center justify-center bg-[#f8fafb] px-4 py-8 dark:bg-[#111b2e]">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(17,27,46,0.10)] dark:border-slate-700 dark:bg-slate-900 sm:p-9 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/20">
            <BookOpen className="h-7 w-7" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700 dark:text-primary-300">
            Không gian đọc
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Đăng nhập
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">Tiếp tục nơi bạn đã dừng lại trong câu chuyện.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 shadow-sm placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mật khẩu
              </label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 shadow-sm placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <div className="text-center text-sm">
            <span className="text-slate-600 dark:text-slate-400">Chưa có tài khoản? </span>
            <Link href="/register" className="font-semibold text-primary-700 hover:text-primary-600 dark:text-primary-300">
              Đăng ký ngay
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
