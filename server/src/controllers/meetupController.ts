import { Request, Response } from 'express';
import * as meetupRepo from '../repositories/meetupRepository';

function handleError(error: unknown, res: Response): void {
  console.error(error);
  res.status(500).json({ message: '서버 오류가 발생했습니다' });
}

export async function listMeetups(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query.status as string | undefined;
    const meetups = await meetupRepo.findAll(status || 'open');
    res.json({ meetups });
  } catch (error) { handleError(error, res); }
}

export async function getMeetup(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const meetup = await meetupRepo.findById(req.params.id as string, userId);
    if (!meetup) { res.status(404).json({ message: '벙개를 찾을 수 없습니다' }); return; }
    const rsvps = await meetupRepo.getRsvps(req.params.id as string);
    res.json({ ...meetup, rsvps });
  } catch (error) { handleError(error, res); }
}

export async function createMeetup(req: Request, res: Response): Promise<void> {
  try {
    const { title, description, meet_date, location_name, latitude, longitude, max_participants, age_category } = req.body;
    if (!title?.trim() || !description?.trim() || !meet_date) {
      res.status(400).json({ message: '제목, 설명, 날짜를 모두 입력해주세요' }); return;
    }
    const meetup = await meetupRepo.create(
      req.user!.userId, title.trim(), description.trim(), meet_date,
      location_name, latitude, longitude, max_participants, age_category
    );
    res.status(201).json(meetup);
  } catch (error) { handleError(error, res); }
}

export async function toggleRsvp(req: Request, res: Response): Promise<void> {
  try {
    const result = await meetupRepo.toggleRsvp(req.params.id as string, req.user!.userId);
    res.json(result);
  } catch (error) { handleError(error, res); }
}

export async function deleteMeetup(req: Request, res: Response): Promise<void> {
  try {
    const authorId = await meetupRepo.findAuthorId(req.params.id as string);
    if (authorId !== req.user!.userId) { res.status(403).json({ message: '본인의 벙개만 삭제할 수 있습니다' }); return; }
    await meetupRepo.remove(req.params.id as string);
    res.json({ message: '벙개가 삭제되었습니다' });
  } catch (error) { handleError(error, res); }
}
