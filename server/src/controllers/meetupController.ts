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

export async function getComments(req: Request, res: Response): Promise<void> {
  try {
    const meetupId = req.params.id as string;
    const userId = req.user!.userId;

    const attending = await meetupRepo.isAttending(meetupId, userId);
    if (!attending) {
      res.status(403).json({ message: '참석자만 댓글을 볼 수 있습니다' });
      return;
    }

    const comments = await meetupRepo.findComments(meetupId);
    res.json({ comments });
  } catch (error) { handleError(error, res); }
}

export async function createComment(req: Request, res: Response): Promise<void> {
  try {
    const meetupId = req.params.id as string;
    const userId = req.user!.userId;
    const { content } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ message: '댓글 내용을 입력해주세요' });
      return;
    }

    const attending = await meetupRepo.isAttending(meetupId, userId);
    if (!attending) {
      res.status(403).json({ message: '참석자만 댓글을 작성할 수 있습니다' });
      return;
    }

    const comment = await meetupRepo.createComment(meetupId, userId, content.trim());
    res.status(201).json(comment);
  } catch (error) { handleError(error, res); }
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
  try {
    const commentId = req.params.commentId as string;
    const userId = req.user!.userId;

    const authorId = await meetupRepo.findCommentAuthor(commentId);
    if (authorId !== userId) {
      res.status(403).json({ message: '본인의 댓글만 삭제할 수 있습니다' });
      return;
    }

    await meetupRepo.deleteComment(commentId);
    res.json({ message: '댓글이 삭제되었습니다' });
  } catch (error) { handleError(error, res); }
}
