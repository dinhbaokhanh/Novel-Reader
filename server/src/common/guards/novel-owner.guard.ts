import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

/**
 * Verifies the authenticated user owns the novel referenced by :novelId in the route params.
 * Attaches `request.novel` so downstream handlers/services don't need to re-fetch.
 *
 * Usage (controller-level or route-level):
 *   @UseGuards(JwtAuthGuard, NovelOwnerGuard)
 */
@Injectable()
export class NovelOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const novelId =
      request.params?.novelId ?? request.params?.id ?? request.body?.novelId;

    if (!novelId) {
      throw new ForbiddenException('Novel ID is required');
    }

    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
      select: { id: true, ownerId: true, status: true },
    });

    if (!novel) throw new NotFoundException('Novel not found');
    if (novel.ownerId !== user.id) throw new ForbiddenException('Access denied');

    // Attach novel to request for reuse
    request.novel = novel;
    return true;
  }
}
