import * as postRepository from '../repositories/postRepository';

export class PostError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'PostError';
    this.statusCode = statusCode;
  }
}

export async function listPosts(page: number, search?: string, ageCategory?: string) {
  const validPage = Math.max(1, page || 1);
  const result = await postRepository.findAll(validPage, search, ageCategory);
  const totalPages = Math.ceil(result.total / 10);
  return {
    posts: result.posts,
    pagination: {
      page: validPage,
      totalPages,
      totalCount: result.total,
    },
  };
}

export async function getPost(postId: string, userId?: string) {
  const post = await postRepository.findById(postId, userId);
  if (!post) {
    throw new PostError('게시글을 찾을 수 없습니다', 404);
  }
  return post;
}

export async function createPost(
  authorId: string, title: string, content: string, isTipEvent: boolean = false,
  locationName?: string | null, latitude?: number | null, longitude?: number | null,
  imageUrl?: string | null, ageCategory?: string | null,
  facilities?: { hasNursingRoom?: boolean; hasDiaperStation?: boolean; hasStrollerAccess?: boolean; hasKidsMenu?: boolean; hasPlayground?: boolean; cleanlinessRating?: number | null }
) {
  if (!title || !content || !title.trim() || !content.trim()) {
    throw new PostError('제목과 본문을 모두 입력해주세요', 400);
  }
  return postRepository.create(authorId, title.trim(), content.trim(), isTipEvent, locationName, latitude, longitude, imageUrl, ageCategory, facilities);
}

export async function updatePost(
  postId: string, title: string, content: string, isTipEvent: boolean = false,
  locationName?: string | null, latitude?: number | null, longitude?: number | null,
  imageUrl?: string | null, ageCategory?: string | null,
  facilities?: { hasNursingRoom?: boolean; hasDiaperStation?: boolean; hasStrollerAccess?: boolean; hasKidsMenu?: boolean; hasPlayground?: boolean; cleanlinessRating?: number | null }
) {
  if (!title || !content || !title.trim() || !content.trim()) {
    throw new PostError('제목과 본문을 모두 입력해주세요', 400);
  }
  return postRepository.update(postId, title.trim(), content.trim(), isTipEvent, locationName, latitude, longitude, imageUrl, ageCategory, facilities);
}

export async function deletePost(postId: string) {
  return postRepository.remove(postId);
}

export async function toggleLike(postId: string, userId: string) {
  // Verify post exists
  const post = await postRepository.findById(postId);
  if (!post) {
    throw new PostError('게시글을 찾을 수 없습니다', 404);
  }
  return postRepository.toggleLike(postId, userId);
}
