import { api } from './client';
import {
  ReadChapterResponse,
  TocEntry,
  ContinuePosition,
  ReadingProgress,
  Bookmark,
} from '../types';

export const readerApi = {
  // ── Chapter ────────────────────────────────────────────────────────────

  async readChapter(chapterId: string): Promise<ReadChapterResponse> {
    const res = await api.get<ReadChapterResponse>(`/reader/chapters/${chapterId}`);
    return res.data;
  },

  // ── Table of contents ─────────────────────────────────────────────────

  async getTableOfContents(novelId: string): Promise<TocEntry[]> {
    const res = await api.get<TocEntry[]>(`/novels/${novelId}/reader/toc`);
    return res.data;
  },

  // ── Continue position ─────────────────────────────────────────────────

  async getContinuePosition(novelId: string): Promise<ContinuePosition> {
    const res = await api.get<ContinuePosition>(`/novels/${novelId}/reader/continue`);
    return res.data;
  },

  // ── Progress ──────────────────────────────────────────────────────────

  async saveProgress(dto: {
    novelId: string;
    chapterId: string;
    scrollPosition?: number;
  }): Promise<ReadingProgress> {
    const res = await api.post<ReadingProgress>('/reader/progress', dto);
    return res.data;
  },

  async getProgress(novelId: string): Promise<ReadingProgress | null> {
    const res = await api.get<ReadingProgress | null>(`/novels/${novelId}/reader/progress`);
    return res.data;
  },

  // ── Bookmarks ─────────────────────────────────────────────────────────

  async getBookmarks(novelId?: string): Promise<Bookmark[]> {
    const res = await api.get<Bookmark[]>('/reader/bookmarks', {
      params: novelId ? { novelId } : undefined,
    });
    return res.data;
  },

  async createBookmark(dto: {
    novelId: string;
    chapterId: string;
    scrollPosition?: number;
    note?: string;
  }): Promise<Bookmark> {
    const res = await api.post<Bookmark>('/reader/bookmarks', dto);
    return res.data;
  },

  async deleteBookmark(bookmarkId: string): Promise<{ deleted: boolean }> {
    const res = await api.delete<{ deleted: boolean }>(`/reader/bookmarks/${bookmarkId}`);
    return res.data;
  },
};
