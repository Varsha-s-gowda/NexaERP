export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export interface UserSelect {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
}
