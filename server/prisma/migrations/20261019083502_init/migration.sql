-- CreateEnum
CREATE TYPE "NovelStatus" AS ENUM ('draft', 'active', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "ChapterStatus" AS ENUM ('generating', 'completed_locked', 'completed_editable', 'failed');

-- CreateEnum
CREATE TYPE "ChapterSource" AS ENUM ('manual', 'ai_generated');

-- CreateEnum
CREATE TYPE "VersionSource" AS ENUM ('manual_edit', 'ai_generated', 'restored');

-- CreateEnum
CREATE TYPE "CharacterRole" AS ENUM ('protagonist', 'antagonist', 'supporting', 'minor');

-- CreateEnum
CREATE TYPE "CanonCategory" AS ENUM ('world_rule', 'event', 'character_state', 'relationship', 'location', 'lore', 'other');

-- CreateEnum
CREATE TYPE "CanonLinkType" AS ENUM ('introduces', 'references', 'modifies', 'resolves');

-- CreateEnum
CREATE TYPE "PlotThreadStatus" AS ENUM ('open', 'resolved', 'abandoned');

-- CreateEnum
CREATE TYPE "AiJobType" AS ENUM ('generate_chapter', 'propose_canon', 'summarize_chapter');

-- CreateEnum
CREATE TYPE "AiJobStatus" AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "mcp_token_hash" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novels" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "genre" VARCHAR(100),
    "language" VARCHAR(20) NOT NULL DEFAULT 'vi',
    "writing_style" TEXT,
    "status" "NovelStatus" NOT NULL DEFAULT 'draft',
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "chapter_count" INTEGER NOT NULL DEFAULT 0,
    "writing_notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "novels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "novel_id" TEXT NOT NULL,
    "chapter_number" INTEGER NOT NULL,
    "title" VARCHAR(500),
    "content" TEXT NOT NULL,
    "word_count" INTEGER NOT NULL DEFAULT 0,
    "status" "ChapterStatus" NOT NULL DEFAULT 'completed_locked',
    "source" "ChapterSource" NOT NULL DEFAULT 'manual',
    "ai_job_id" TEXT,
    "is_canon_dirty" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapter_versions" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "word_count" INTEGER NOT NULL,
    "change_summary" VARCHAR(500),
    "created_by" TEXT NOT NULL,
    "source" "VersionSource" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapter_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "novel_id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "aliases" TEXT[],
    "role" "CharacterRole" NOT NULL DEFAULT 'supporting',
    "description" TEXT,
    "backstory" TEXT,
    "current_status" VARCHAR(200),
    "metadata" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_facts" (
    "id" TEXT NOT NULL,
    "novel_id" TEXT NOT NULL,
    "category" "CanonCategory" NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "content" TEXT NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT true,
    "is_dirty" BOOLEAN NOT NULL DEFAULT false,
    "confirmed_at" TIMESTAMPTZ,
    "source_chapter_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "canon_facts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plot_threads" (
    "id" TEXT NOT NULL,
    "novel_id" TEXT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "status" "PlotThreadStatus" NOT NULL DEFAULT 'open',
    "opened_at_chapter" INTEGER,
    "closed_at_chapter" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "plot_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapter_canon_links" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "canon_fact_id" TEXT NOT NULL,
    "linkType" "CanonLinkType" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapter_canon_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "novel_id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "scroll_position" INTEGER,
    "note" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "novel_id" TEXT NOT NULL,
    "last_chapter_id" TEXT NOT NULL,
    "last_scroll_position" INTEGER,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reading_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_jobs" (
    "id" TEXT NOT NULL,
    "novel_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_type" "AiJobType" NOT NULL,
    "status" "AiJobStatus" NOT NULL DEFAULT 'pending',
    "input_context" JSONB,
    "result_chapter_id" TEXT,
    "result_canon_proposal" JSONB,
    "error_message" TEXT,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" TEXT NOT NULL,
    "payload" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "novels_owner_id_idx" ON "novels"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_ai_job_id_key" ON "chapters"("ai_job_id");

-- CreateIndex
CREATE INDEX "chapters_novel_id_chapter_number_idx" ON "chapters"("novel_id", "chapter_number");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_novel_id_chapter_number_key" ON "chapters"("novel_id", "chapter_number");

-- CreateIndex
CREATE INDEX "chapter_versions_chapter_id_idx" ON "chapter_versions"("chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "chapter_versions_chapter_id_version_number_key" ON "chapter_versions"("chapter_id", "version_number");

-- CreateIndex
CREATE INDEX "characters_novel_id_idx" ON "characters"("novel_id");

-- CreateIndex
CREATE INDEX "canon_facts_novel_id_is_confirmed_is_dirty_idx" ON "canon_facts"("novel_id", "is_confirmed", "is_dirty");

-- CreateIndex
CREATE INDEX "plot_threads_novel_id_status_idx" ON "plot_threads"("novel_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "chapter_canon_links_chapter_id_canon_fact_id_key" ON "chapter_canon_links"("chapter_id", "canon_fact_id");

-- CreateIndex
CREATE INDEX "bookmarks_user_id_novel_id_idx" ON "bookmarks"("user_id", "novel_id");

-- CreateIndex
CREATE INDEX "reading_progress_user_id_idx" ON "reading_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "reading_progress_user_id_novel_id_key" ON "reading_progress"("user_id", "novel_id");

-- CreateIndex
CREATE INDEX "ai_jobs_novel_id_status_idx" ON "ai_jobs"("novel_id", "status");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- AddForeignKey
ALTER TABLE "novels" ADD CONSTRAINT "novels_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_ai_job_id_fkey" FOREIGN KEY ("ai_job_id") REFERENCES "ai_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_versions" ADD CONSTRAINT "chapter_versions_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_versions" ADD CONSTRAINT "chapter_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_facts" ADD CONSTRAINT "canon_facts_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_facts" ADD CONSTRAINT "canon_facts_source_chapter_id_fkey" FOREIGN KEY ("source_chapter_id") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plot_threads" ADD CONSTRAINT "plot_threads_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_canon_links" ADD CONSTRAINT "chapter_canon_links_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_canon_links" ADD CONSTRAINT "chapter_canon_links_canon_fact_id_fkey" FOREIGN KEY ("canon_fact_id") REFERENCES "canon_facts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_last_chapter_id_fkey" FOREIGN KEY ("last_chapter_id") REFERENCES "chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
