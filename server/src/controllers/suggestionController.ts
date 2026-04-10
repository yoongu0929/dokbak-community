import { Request, Response } from 'express';
import * as suggestionRepo from '../repositories/suggestionRepository';

export async function createSuggestion(req: Request, res: Response): Promise<void> {
  try {
    const { title, content } = req.body;
    if (!title?.trim() || !content?.trim()) {
      res.status(400).json({ message: '제목과 내용을 입력해주세요' }); return;
    }
    const suggestion = await suggestionRepo.create(req.user!.userId, title.trim(), content.trim());
    res.status(201).json(suggestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}

export async function getMySuggestions(req: Request, res: Response): Promise<void> {
  try {
    const suggestions = await suggestionRepo.findByUserId(req.user!.userId);
    res.json({ suggestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}

export async function getAllSuggestions(_req: Request, res: Response): Promise<void> {
  try {
    const suggestions = await suggestionRepo.findAll();
    res.json({ suggestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.body;
    await suggestionRepo.updateStatus(req.params.id as string, status);
    res.json({ message: '상태가 변경되었습니다' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}
