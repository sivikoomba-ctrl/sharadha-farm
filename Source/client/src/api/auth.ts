import axiosClient from './axiosClient';

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest extends LoginRequest {
  full_name: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      full_name: string;
      role: string;
    };
  };
}

interface MeResponse {
  success: boolean;
  data: {
    id: string;
    username: string;
    full_name: string;
    role: string;
  };
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await axiosClient.post<AuthResponse>('/auth/login', data);
  return res.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await axiosClient.post<AuthResponse>('/auth/register', data);
  return res.data;
}

export async function getMe(): Promise<MeResponse> {
  const res = await axiosClient.get<MeResponse>('/auth/me');
  return res.data;
}
