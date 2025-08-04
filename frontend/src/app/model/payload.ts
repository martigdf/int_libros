export interface JWTPayload {
  id: string;
  name: string;
  lastname: string;
  email: string;
  user: string;
  role: 'admin' | 'user';
  exp?: number;
  iat?: number;
}