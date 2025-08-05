export interface User {
    id: string;
    name: string;
    username: string;
    lastname: string;
    email: string;
    photo?: string;
    role: 'admin' | 'user';
}

export interface UserPost {
    name: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
}

export interface UserPatch {
  name?: string;
  lastname?: string;
  username?: string;
  email?: string;
  role?: 'admin' | 'user';
}

export interface Token {
    token: string
}

export interface Login {
    email : string,
    password : string,
}