import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

export function getChapterStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    generating: 'Đang tạo',
    completed_locked: 'Hoàn thành (Khóa)',
    completed_editable: 'Hoàn thành (Chỉnh sửa được)',
    failed: 'Thất bại',
  };
  return statusMap[status] || status;
}

export function getNovelStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Nháp',
    active: 'Đang viết',
    completed: 'Hoàn thành',
    archived: 'Đã lưu trữ',
  };
  return statusMap[status] || status;
}

export function getChapterSourceText(source: string): string {
  const sourceMap: Record<string, string> = {
    manual: 'Thủ công',
    ai_generated: 'AI tạo',
  };
  return sourceMap[source] || source;
}
