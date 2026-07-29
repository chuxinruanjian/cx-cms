const ADMIN_TOKEN_KEY = 'cx_admin_access_token';

export const getAdminToken = () =>
  sessionStorage.getItem(ADMIN_TOKEN_KEY) ??
  localStorage.getItem(ADMIN_TOKEN_KEY);

export const saveAdminToken = (token: string, remember: boolean) => {
  clearAdminToken();
  (remember ? localStorage : sessionStorage).setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = () => {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};
