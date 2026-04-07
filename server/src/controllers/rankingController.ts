import { Request, Response } from 'express';
import * as rankingService from '../services/rankingService';
import { RankingError } from '../services/rankingService';

function handleError(error: unknown, res: Response): void {
  if (error instanceof RankingError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ message: '서버 오류가 발생했습니다' });
}

export async function getCurrentRanking(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const result = await rankingService.getCurrentRanking();
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
}

export async function getArchivedRanking(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const yearMonth = req.params.yearMonth as string;
    const result = await rankingService.getArchivedRanking(yearMonth);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
}

export async function getMyRanking(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await rankingService.getMyRanking(userId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
}
