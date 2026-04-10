import { Request, Response } from 'express';
import * as userRepository from '../repositories/userRepository';

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = await userRepository.findById(req.user!.userId);
    if (!user) { res.status(404).json({ message: '사용자를 찾을 수 없습니다' }); return; }
    res.json({
      id: user.id, email: user.email, nickname: user.nickname,
      kakaoId: (user as any).kakao_id || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}

export async function updateKakaoId(req: Request, res: Response): Promise<void> {
  try {
    const { kakaoId } = req.body;
    const user = await userRepository.updateKakaoId(req.user!.userId, kakaoId?.trim() || null);
    res.json({ message: '카카오 ID가 저장되었습니다', kakaoId: (user as any).kakao_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}
