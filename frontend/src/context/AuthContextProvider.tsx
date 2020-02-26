import React, { useState, useCallback, useEffect } from "react";
import {
  ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  REFRESH_TOKEN_LOCAL_STORAGE_KEY,
  API_PROTOCOL,
  API_DOMAIN,
  AUTH_DOMAIN
} from "const";
import {
  AuthContext,
  User,
  unauthenticatedUser,
  userFromTokens
} from "./AuthContext";

// to be added to every request
const baseHeaders: HeadersInit = {
  "Content-Type": "application/json",
  Accept: "application/json"
};

// before rendering, parse any existing user information
// from token in local storage
const existingAccessToken = localStorage.getItem(
  ACCESS_TOKEN_LOCAL_STORAGE_KEY
);
const existingRefreshToken = localStorage.getItem(
  REFRESH_TOKEN_LOCAL_STORAGE_KEY
);
const exisitingUser = userFromTokens(existingAccessToken, existingRefreshToken);

const AuthContextProvider: React.FC = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(exisitingUser);
  const { accessToken, refreshToken, authenticated } = currentUser;

  // any time the tokens change in state, update local storage
  useEffect(() => {
    if (authenticated && accessToken && refreshToken) {
      localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY, refreshToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
    }
  }, [authenticated, accessToken, refreshToken]);

  // add base headers and authentication header to api requests
  const makeOptions = useCallback(
    (options: Partial<RequestInit>): Partial<RequestInit> => {
      const authHeader = currentUser.authenticated && {
        Authorization: `Bearer ${currentUser.accessToken}`
      };
      return {
        ...options,
        headers: {
          ...baseHeaders,
          ...options.headers,
          ...authHeader
        }
      };
    },
    [currentUser.accessToken, currentUser.authenticated]
  );

  // this function is passed to components via context. it wraps the fetch api
  // to call the correct domain and add the correct headers. Additionally, if a
  // request has a status code that indicates an error (e.g. 400, 401, 500, ...)
  // return a rejected promise
  const apiCall = useCallback(
    async <T,>(url: string, options: Partial<RequestInit> = {}): Promise<T> => {
      const res = await fetch(
        `${API_PROTOCOL}://${API_DOMAIN}${url}`,
        makeOptions(options)
      );
      if (res.ok) {
        return (await res.json()) as T;
      } else if (res.status === 401) {
        setCurrentUser(unauthenticatedUser);
      }
      return Promise.reject(res);
    },
    [makeOptions, setCurrentUser]
  );

  // during development, prompt for a username to authenticate as
  const apiLoginHeaders = (): HeadersInit => {
    const headers = baseHeaders;
    if (process.env.NODE_ENV === "development") {
      const username = prompt("authenticate as");
      headers["Authorization"] = username || "";
    }
    return headers;
  };

  // request new tokens from the authentication domain. The authentication domain
  // will authenticate via client SSL certificates (CAC) that are automatically
  // included by the browser if available
  const apiLogin = async () => {
    const res = await fetch(`${API_PROTOCOL}://${AUTH_DOMAIN}/login/`, {
      headers: apiLoginHeaders(),
      method: "POST",
      body: "{}",
      cache: "no-store"
    });
    if (!res.ok) {
      setCurrentUser(unauthenticatedUser);
      return Promise.reject(res);
    }
    const { access, refresh } = await res.json();
    setCurrentUser(userFromTokens(access, refresh));
  };

  // clear access and refresh tokens
  const apiLogout = async () => {
    setCurrentUser(unauthenticatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ ...currentUser, apiCall, apiLogin, apiLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
