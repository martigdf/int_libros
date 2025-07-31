export interface JWTPayload {
  user_id: string;
  user: string;
  role: 'admin' | 'user';
  exp?: number;
  iat?: number;
}