import { SafeUser } from './user';

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: SafeUser;
  access_token: string;
  emailDelivery?: {
    delivered: boolean;
    verificationLink: string;
    warning?: string;
  };
}
