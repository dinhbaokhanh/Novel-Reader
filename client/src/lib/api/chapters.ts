import { api } from './client';
import {
  Chapter,
  ChapterVersion,
  CreateChapterDto,
  UpdateChapterContentDto,
  ImportChaptersDto,
} from '../types';

export const chaptersApi = {
  // Novel-scoped operations
  async create(novelId: string, data: CreateChapterDto): Promise<Chapter> {
    const response = await api.post<Chapter>(`/novels/${novelId}/chapters`, data);
    return response.data;
  },

  async findAll(novelId: string): Promise<Chapter[]> {
    const response = await api.get<Chapter[]>(`/novels/${novelId}/chapters`);
    return response.data;
  },

  async importFromFile(
    novelId: string,
    file: File,
    startChapterNumber?: number
  ): Promise<{ imported: number; chapters: Chapter[] }> {
    const formData = new FormData();
    formData.append('file', file);
    if (startChapterNumber !== undefined) {
      formData.append('startChapterNumber', startChapterNumber.toString());
    }

    const response = await api.post(`/novels/${novelId}/chapters/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Chapter-scoped operations
  async findOne(id: string): Promise<Chapter> {
    const response = await api.get<Chapter>(`/chapters/${id}`);
    return response.data;
  },

  async updateContent(id: string, data: UpdateChapterContentDto): Promise<Chapter> {
    const response = await api.put<Chapter>(`/chapters/${id}/content`, data);
    return response.data;
  },

  async remove(id: string): Promise<{ deleted: boolean }> {
    const response = await api.delete<{ deleted: boolean }>(`/chapters/${id}`);
    return response.data;
  },

  async lock(id: string): Promise<Chapter> {
    const response = await api.patch<Chapter>(`/chapters/${id}/lock`);
    return response.data;
  },

  async unlock(id: string): Promise<Chapter> {
    const response = await api.patch<Chapter>(`/chapters/${id}/unlock`);
    return response.data;
  },

  // Version operations
  async getVersions(id: string): Promise<ChapterVersion[]> {
    const response = await api.get<ChapterVersion[]>(`/chapters/${id}/versions`);
    return response.data;
  },

  async getVersionContent(id: string, versionId: string): Promise<ChapterVersion> {
    const response = await api.get<ChapterVersion>(`/chapters/${id}/versions/${versionId}`);
    return response.data;
  },

  async restoreVersion(id: string, versionId: string): Promise<Chapter> {
    const response = await api.post<Chapter>(`/chapters/${id}/versions/${versionId}/restore`);
    return response.data;
  },
};
