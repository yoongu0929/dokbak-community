import { Request, Response } from 'express';
import * as noticeRepository from '../repositories/noticeRepository';

export async function listNotices(_req: Request, res: Response): Promise<void> {
  try {
    const notices = await noticeRepository.findAll();
    res.json({ notices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}

export async function getNotice(req: Request, res: Response): Promise<void> {
  try {
    const notice = await noticeRepository.findById(req.params.id as string);
    if (!notice) {
      res.status(404).json({ message: '공지사항을 찾을 수 없습니다' });
      return;
    }
    res.json(notice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}

export async function createNotice(req: Request, res: Response): Promise<void> {
  try {
    const { title, content, is_pinned } = req.body;
    if (!title?.trim() || !content?.trim()) {
      res.status(400).json({ message: '제목과 내용을 입력해주세요' }); return;
    }
    const notice = await noticeRepository.create(title.trim(), content.trim(), is_pinned ?? false);
    res.status(201).json(notice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}

export async function updateNotice(req: Request, res: Response): Promise<void> {
  try {
    const { title, content, is_pinned } = req.body;
    if (!title?.trim() || !content?.trim()) {
      res.status(400).json({ message: '제목과 내용을 입력해주세요' }); return;
    }
    const notice = await noticeRepository.update(req.params.id as string, title.trim(), content.trim(), is_pinned ?? false);
    if (!notice) { res.status(404).json({ message: '공지사항을 찾을 수 없습니다' }); return; }
    res.json(notice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}

export async function deleteNotice(req: Request, res: Response): Promise<void> {
  try {
    await noticeRepository.remove(req.params.id as string);
    res.json({ message: '공지사항이 삭제되었습니다' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}
