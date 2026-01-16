export const BASE_URL = 'https://norma.education-services.ru/api';

export const checkResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Ошибка API');
  }
  return data;
};

export const request = async (endpoint, options = {}) => {
  const { headers = {}, ...restOptions } = options;
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...restOptions,
  });
  return checkResponse(response);
};

export const authApi = {
  login: (data) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: (data) =>
    request('/auth/logout', { method: 'POST', body: JSON.stringify(data) }),
  refreshToken: (data) =>
    request('/auth/token', { method: 'POST', body: JSON.stringify(data) }),
  getUser: (token) =>
    request('/auth/user', {
      method: 'GET',
      headers: token ? { Authorization: token } : {},
    }),
  updateUser: (data, token) =>
    request('/auth/user', {
      method: 'PATCH',
      headers: token ? { Authorization: token } : {},
      body: JSON.stringify(data),
    }),
};
