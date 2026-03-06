// src/utils/api.ts
export const BASE_URL = 'https://norma.education-services.ru/api';

type User = {
  name: string;
  email: string;
};

type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  [key: string]: unknown;
};

type RequestOptions = {
  headers?: Record<string, string>;
} & RequestInit;

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  name: string;
};

type LogoutData = {
  token: string;
};

type RefreshTokenData = {
  token: string;
};

type UserData = {
  name: string;
  email: string;
  password?: string;
};

export const checkResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  const data: T = await response.json();
  const typedData = data as ApiResponse<T>;
  if (!typedData.success) {
    throw new Error(typedData.message || 'Ошибка API');
  }
  return typedData;
};

export const request = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { headers = {}, ...restOptions } = options;
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...restOptions,
  });
  return checkResponse<T>(response);
};

export const authApi = {
  login: (data: LoginData) =>
    request<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),
  register: (data: RegisterData) =>
    request<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),
  logout: (LogoutData) =>
    request<ApiResponse>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  refreshToken: (RefreshTokenData) =>
    request<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/token', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getUser: (token?: string) =>
    request<ApiResponse<{ user: User }>>('/auth/user', {
      method: 'GET',
      headers: token ? { Authorization: token } : {},
    }),
  updateUser: (data: UserData, token?: string) =>
    request<ApiResponse<{ user: User }>>('/auth/user', {
      method: 'PATCH',
      headers: token ? { Authorization: token } : {},
      body: JSON.stringify(data),
    }),
};
