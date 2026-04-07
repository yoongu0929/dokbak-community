import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock the userRepository module
vi.mock('../repositories/userRepository', () => ({
  findByEmail: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
}));

import * as userRepository from '../repositories/userRepository';
import * as authService from './authService';
import { AuthError } from './authService';

const mockFindByEmail = vi.mocked(userRepository.findByEmail);
const mockCreate = vi.mocked(userRepository.create);

const testUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  password_hash: '',
  nickname: '테스트유저',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.getRefreshTokenStore().clear();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      mockFindByEmail.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ ...testUser, password_hash: 'hashed' });

      const result = await authService.register('test@example.com', 'password123', '테스트유저');

      expect(result).toEqual({
        id: testUser.id,
        email: 'test@example.com',
        nickname: '테스트유저',
      });
      expect(mockCreate).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String),
        '테스트유저'
      );
      // Verify the password was hashed (not stored as plain text)
      const calledHash = mockCreate.mock.calls[0][1];
      expect(calledHash).not.toBe('password123');
    });

    it('should throw 409 for duplicate email', async () => {
      mockFindByEmail.mockResolvedValue(testUser);

      await expect(
        authService.register('test@example.com', 'password123', '테스트유저')
      ).rejects.toThrow('이미 등록된 이메일입니다');

      try {
        await authService.register('test@example.com', 'password123', '테스트유저');
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).statusCode).toBe(409);
      }
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockFindByEmail.mockResolvedValue({ ...testUser, password_hash: hashedPassword });

      const result = await authService.login('test@example.com', 'password123');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toEqual({
        id: testUser.id,
        email: 'test@example.com',
        nickname: '테스트유저',
      });
      // Refresh token should be stored
      expect(authService.getRefreshTokenStore().has(result.refreshToken)).toBe(true);
    });

    it('should throw 401 for non-existent email', async () => {
      mockFindByEmail.mockResolvedValue(null);

      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('이메일 또는 비밀번호가 올바르지 않습니다');
    });

    it('should throw 401 for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockFindByEmail.mockResolvedValue({ ...testUser, password_hash: hashedPassword });

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('이메일 또는 비밀번호가 올바르지 않습니다');
    });
  });

  describe('logout', () => {
    it('should remove refresh token from store', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockFindByEmail.mockResolvedValue({ ...testUser, password_hash: hashedPassword });

      const { refreshToken } = await authService.login('test@example.com', 'password123');
      expect(authService.getRefreshTokenStore().has(refreshToken)).toBe(true);

      authService.logout(refreshToken);
      expect(authService.getRefreshTokenStore().has(refreshToken)).toBe(false);
    });
  });

  describe('refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockFindByEmail.mockResolvedValue({ ...testUser, password_hash: hashedPassword });

      const { refreshToken } = await authService.login('test@example.com', 'password123');
      const result = authService.refresh(refreshToken);

      expect(result.accessToken).toBeDefined();
      // Verify the new access token is valid
      const decoded = authService.verifyAccessToken(result.accessToken);
      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.email).toBe('test@example.com');
    });

    it('should throw 401 for invalid refresh token', () => {
      expect(() => authService.refresh('invalid-token')).toThrow(
        '세션이 만료되었습니다. 다시 로그인해주세요'
      );
    });

    it('should throw 401 for logged-out refresh token', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockFindByEmail.mockResolvedValue({ ...testUser, password_hash: hashedPassword });

      const { refreshToken } = await authService.login('test@example.com', 'password123');
      authService.logout(refreshToken);

      expect(() => authService.refresh(refreshToken)).toThrow(
        '세션이 만료되었습니다. 다시 로그인해주세요'
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should decode a valid access token', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockFindByEmail.mockResolvedValue({ ...testUser, password_hash: hashedPassword });

      const { accessToken } = await authService.login('test@example.com', 'password123');
      const decoded = authService.verifyAccessToken(accessToken);

      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.email).toBe('test@example.com');
    });

    it('should throw for an invalid token', () => {
      expect(() => authService.verifyAccessToken('invalid')).toThrow();
    });
  });
});
