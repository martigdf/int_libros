export interface User {
    id: string;
    name: string;
    username: string;
    last_name: string;
    email: string;
    role: 'admin' | 'user';
}

export interface UserPost {
    name: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    role: string;
}

export interface PutUser {
  name?: string;
  last_name?: string;
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