// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export enum NovelStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum ChapterStatus {
  GENERATING = 'generating',
  COMPLETED_LOCKED = 'completed_locked',
  COMPLETED_EDITABLE = 'completed_editable',
  FAILED = 'failed',
}

export enum ChapterSource {
  MANUAL = 'manual',
  AI_GENERATED = 'ai_generated',
}

export enum VersionSource {
  MANUAL_EDIT = 'manual_edit',
  AI_GENERATED = 'ai_generated',
  RESTORED = 'restored',
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export interface RegisterDto {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// NOVELS
// ─────────────────────────────────────────────

export interface Novel {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  genre?: string;
  language: string;
  writingStyle?: string;
  status: NovelStatus;
  isPrivate: boolean;
  chapterCount: number;
  writingNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNovelDto {
  title: string;
  description?: string;
  genre?: string;
  language?: string;
  writingStyle?: string;
  isPrivate?: boolean;
  writingNotes?: string;
}

export interface UpdateNovelDto {
  title?: string;
  description?: string;
  genre?: string;
  writingStyle?: string;
  status?: NovelStatus;
  isPrivate?: boolean;
  writingNotes?: string;
}

// ─────────────────────────────────────────────
// CHAPTERS
// ─────────────────────────────────────────────

export interface Chapter {
  id: string;
  novelId: string;
  chapterNumber: number;
  title?: string;
  content: string;
  wordCount: number;
  status: ChapterStatus;
  source: ChapterSource;
  aiJobId?: string;
  isCanonDirty: boolean;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChapterDto {
  chapterNumber: number;
  title?: string;
  content: string;
}

export interface UpdateChapterContentDto {
  content: string;
  title?: string;
  changeSummary?: string;
  summary?: string;
}

export interface ImportChaptersDto {
  startChapterNumber?: number;
}

// ─────────────────────────────────────────────
// CHAPTER VERSIONS
// ─────────────────────────────────────────────

export interface ChapterVersion {
  id: string;
  chapterId: string;
  versionNumber: number;
  content: string;
  wordCount: number;
  changeSummary?: string;
  createdById: string;
  source: VersionSource;
  createdAt: string;
}

// ─────────────────────────────────────────────
// BOOKMARKS & READING PROGRESS
// ─────────────────────────────────────────────

export interface Bookmark {
  id: string;
  userId: string;
  novelId: string;
  chapterId: string;
  scrollPosition?: number;
  note?: string;
  createdAt: string;
  // joined fields from server
  chapter?: { chapterNumber: number; title?: string };
  novel?: { title: string };
}

export interface ReadingProgress {
  id: string;
  userId: string;
  novelId: string;
  lastChapterId: string;
  lastScrollPosition?: number;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// READER
// ─────────────────────────────────────────────

export interface ChapterNav {
  id: string;
  chapterNumber: number;
  title?: string;
}

export interface ReadChapterResponse {
  chapter: Chapter;
  prev: ChapterNav | null;
  next: ChapterNav | null;
}

export interface TocEntry {
  id: string;
  chapterNumber: number;
  title?: string;
  wordCount: number;
  status: ChapterStatus;
  summary?: string;
}

export interface ContinuePosition {
  chapterId: string | null;
  scrollPosition: number;
}

// ─────────────────────────────────────────────
// READING SETTINGS
// ─────────────────────────────────────────────

export type ReadingTheme = 'light' | 'dark' | 'sepia';

export interface ReadingSettings {
  theme:       ReadingTheme;
  fontSize:    number;   // px, range 14–28
  lineHeight:  number;   // multiplier, range 1.4–2.2
  maxWidth:    number;   // px column width, range 560–900
}
