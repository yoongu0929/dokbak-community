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
    const notice = await noticeRepository.findById(req.params.id);
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
