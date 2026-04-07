import { Request, Response } from 'express';
import * as rewardRepository from '../repositories/rewardRepository';

export async function getMyRewards(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const rows = await rewardRepository.findByUserId(userId);
    const rewards = rows.map((r) => ({
      id: r.id,
      yearMonth: r.year_month,
      rank: r.rank,
      rewardType: r.reward_type,
      description: r.description,
      createdAt: r.created_at,
    }));
    res.json({ rewards });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}
