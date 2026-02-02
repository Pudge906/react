export const setToken = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=3600; secure; samesite=strict`;
  }
};

export const getToken = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = getCookie('refreshToken');
  return { accessToken, refreshToken };
};

export const removeToken = () => {
  localStorage.removeItem('accessToken');
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
};

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};
