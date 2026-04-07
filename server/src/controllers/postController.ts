import { Request, Response } from 'express';
import * as postService from '../services/postService';
import { PostError } from '../services/postService';

function handleError(error: unknown, res: Response): void {
  if (error instanceof PostError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ message: '서버 오류가 발생했습니다' });
}

export async function listPosts(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const search = req.query.search as string | undefined;
    const result = await postService.listPosts(page, search);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
}

export async function getPost(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const postId = req.params.id as string;
    const post = await postService.getPost(postId, userId);
    res.json(post);
  } catch (error) {
    handleError(error, res);
  }
}

export async function createPost(req: Request, res: Response): Promise<void> {
  try {
    const { title, content, is_tip_event } = req.body;
    const authorId = req.user!.userId;
    const post = await postService.createPost(
      authorId,
      title,
      content,
      is_tip_event ?? false
    );
    res.status(201).json(post);
  } catch (error) {
    handleError(error, res);
  }
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  try {
    const { title, content, is_tip_event } = req.body;
    const postId = req.params.id as string;
    const post = await postService.updatePost(
      postId,
      title,
      content,
      is_tip_event ?? false
    );
    res.json(post);
  } catch (error) {
    handleError(error, res);
  }
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  try {
    const postId = req.params.id as string;
    await postService.deletePost(postId);
    res.json({ message: '게시글이 삭제되었습니다' });
  } catch (error) {
    handleError(error, res);
  }
}

export async function toggleLike(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const postId = req.params.id as string;
    const result = await postService.toggleLike(postId, userId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
}
