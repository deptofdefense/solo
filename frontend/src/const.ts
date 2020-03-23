export const ACCESS_TOKEN_LOCAL_STORAGE_KEY = "solo.accessToken";

export const REFRESH_TOKEN_LOCAL_STORAGE_KEY = "solo.refreshToken";

export const API_PROTOCOL = process.env.REACT_APP_API_PROTOCOL || "https";

export const API_DOMAIN = process.env.REACT_APP_API_DOMAIN;

export const AUTH_DOMAIN = process.env.REACT_APP_AUTH_DOMAIN;

export const BASE_URL = `${API_PROTOCOL}://${API_DOMAIN}`;

export const LOGIN_URL = `${API_PROTOCOL}://${AUTH_DOMAIN}/login/`;

export const REFRESH_URL = `${API_PROTOCOL}://${AUTH_DOMAIN}/login/refresh/`;
