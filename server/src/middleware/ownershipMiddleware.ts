import { Request, Response, NextFunction } from 'express';
import * as postRepository from '../repositories/postRepository';

export async function ownershipMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.userId;
  const postId = req.params.id as string;

  if (!userId) {
    res.status(401).json({ message: '인증이 필요합니다' });
    return;
  }

  const authorId = await postRepository.findAuthorId(postId);

  if (!authorId) {
    res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    return;
  }

  if (authorId !== userId) {
    res.status(403).json({ message: '본인의 게시글만 수정/삭제할 수 있습니다' });
    return;
  }

  next();
}
