import { api } from './client';
import { Novel, CreateNovelDto, UpdateNovelDto } from '../types';

export const novelsApi = {
  async create(data: CreateNovelDto): Promise<Novel> {
    const response = await api.post<Novel>('/novels', data);
    return response.data;
  },

  async findAll(): Promise<Novel[]> {
    const response = await api.get<Novel[]>('/novels');
    return response.data;
  },

  async findOne(id: string): Promise<Novel> {
    const response = await api.get<Novel>(`/novels/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdateNovelDto): Promise<Novel> {
    const response = await api.patch<Novel>(`/novels/${id}`, data);
    return response.data;
  },

  async archive(id: string): Promise<void> {
    await api.delete(`/novels/${id}`);
  },
};
