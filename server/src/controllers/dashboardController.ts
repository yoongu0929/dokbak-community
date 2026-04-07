import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';
import { DashboardError } from '../services/dashboardService';

function handleError(error: unknown, res: Response): void {
  if (error instanceof DashboardError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ message: '서버 오류가 발생했습니다' });
}

export async function getDashboard(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await dashboardService.getDashboard(userId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
}
