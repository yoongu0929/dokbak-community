import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { AuthError } from '../services/authService';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, nickname } = req.body;

    if (!email || !password || !nickname) {
      res.status(400).json({ message: '이메일, 비밀번호, 닉네임을 모두 입력해주세요' });
      return;
    }

    const user = await authService.register(email, password, nickname);
    res.status(201).json({ message: '회원가입이 완료되었습니다', user });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요' });
      return;
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh Token이 필요합니다' });
      return;
    }

    authService.logout(refreshToken);
    res.json({ message: '로그아웃되었습니다' });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh Token이 필요합니다' });
      return;
    }

    const result = authService.refresh(refreshToken);
    res.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}

export async function oauthLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, nickname, provider, oauthId } = req.body;

    if (!email || !nickname || !provider || !oauthId) {
      res.status(400).json({ message: 'OAuth 정보가 부족합니다' });
      return;
    }

    const result = await authService.oauthLogin(email, nickname, provider, oauthId);
    res.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('OAuth login error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
}
