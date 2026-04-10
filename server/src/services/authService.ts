import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_dev';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_dev';
const ACCESS_EXPIRES_IN = 900; // 15 minutes in seconds
const REFRESH_EXPIRES_IN = 604800; // 7 days in seconds

const SALT_ROUNDS = 10;

// In-memory refresh token store (can be upgraded to Redis later)
const refreshTokenStore = new Set<string>();

export function getRefreshTokenStore(): Set<string> {
  return refreshTokenStore;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}

export async function register(
  email: string,
  password: string,
  nickname: string
) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AuthError('이미 등록된 이메일입니다', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create(email, passwordHash, nickname);

  return { id: user.id, email: user.email, nickname: user.nickname };
}

export async function login(email: string, password: string) {
  const user = await userRepository.findByEmail(email);
  if (!user || !user.password_hash) {
    throw new AuthError('이메일 또는 비밀번호가 올바르지 않습니다', 401);
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new AuthError('이메일 또는 비밀번호가 올바르지 않습니다', 401);
  }

  const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  refreshTokenStore.add(refreshToken);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role },
  };
}

export function logout(refreshToken: string): void {
  refreshTokenStore.delete(refreshToken);
}

export function refresh(refreshToken: string) {
  if (!refreshTokenStore.has(refreshToken)) {
    throw new AuthError('세션이 만료되었습니다. 다시 로그인해주세요', 401);
  }

  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    refreshTokenStore.delete(refreshToken);
    throw new AuthError('세션이 만료되었습니다. 다시 로그인해주세요', 401);
  }

  const newAccessToken = generateAccessToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  });

  return { accessToken: newAccessToken };
}

export async function oauthLogin(email: string, nickname: string, provider: string, oauthId: string) {
  // Find or create user
  let user = await userRepository.findByOAuth(provider, oauthId);
  if (!user) {
    // Check if email already exists (link accounts)
    user = await userRepository.findByEmail(email);
    if (!user) {
      user = await userRepository.createOAuthUser(email, nickname, provider, oauthId);
    }
  }

  const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  refreshTokenStore.add(refreshToken);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role },
  };
}

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}
