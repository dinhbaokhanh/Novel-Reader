import { BadRequestException } from '@nestjs/common';
import { ChapterStatus } from '@prisma/client';

/**
 * BR-01: Valid chapter state transitions.
 *
 *   generating ──► completed_locked
 *   generating ──► failed
 *   completed_locked ──► completed_editable   (unlock)
 *   completed_editable ──► completed_locked   (lock)
 *   failed ──► generating                     (retry)
 */
const VALID_TRANSITIONS: Partial<Record<ChapterStatus, ChapterStatus[]>> = {
  [ChapterStatus.generating]: [
    ChapterStatus.completed_locked,
    ChapterStatus.failed,
  ],
  [ChapterStatus.completed_locked]: [ChapterStatus.completed_editable],
  [ChapterStatus.completed_editable]: [ChapterStatus.completed_locked],
  [ChapterStatus.failed]: [ChapterStatus.generating],
};

/** Pure function — no DB, no side effects. Easy to unit test. */
export function assertValidTransition(
  from: ChapterStatus,
  to: ChapterStatus,
): void {
  const allowed = VALID_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Cannot transition chapter from "${from}" to "${to}". ` +
        `Allowed: [${allowed.join(', ') || 'none'}]`,
    );
  }
}

/** Returns true if the chapter can be read in the reader. */
export function isReadable(status: ChapterStatus): boolean {
  return (
    status === ChapterStatus.completed_locked ||
    status === ChapterStatus.completed_editable
  );
}

/** Returns true if the chapter content can be edited. */
export function isEditable(status: ChapterStatus): boolean {
  return status === ChapterStatus.completed_editable;
}
