import React, { useState, useCallback, useEffect } from "react";
import {
  TOKEN_LOCAL_STORAGE_KEY,
  API_PROTOCOL,
  API_DOMAIN,
  LOGIN_URL,
  REFRESH_URL
} from "const";
import {
  AuthContext,
  User,
  unauthenticatedUser,
  userFromToken
} from "./AuthContext";

// to be added to every request
const baseHeaders: HeadersInit = {
  "Content-Type": "application/json",
  Accept: "application/json"
};

// before rendering, parse any existing user information
// from token in local storage
const existingToken = localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY);
const exisitingUser = userFromToken(existingToken);

const AuthContextProvider: React.FC = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(exisitingUser);
  const { token, authenticated, tokenExp, refreshExp } = currentUser;

  // refresh a token and set current user based on the new token
  const refreshToken = useCallback(async () => {
    try {
      const res = await fetch(REFRESH_URL, {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({
          token
        })
      });
      if (!res.ok) {
        setCurrentUser(unauthenticatedUser);
      } else {
        const { token: newToken } = await res.json();
        setCurrentUser(userFromToken(newToken));
      }
    } catch (e) {
      setCurrentUser(unauthenticatedUser);
      throw new Error("token refresh failed");
    }
  }, [token]);

  // return a promise that checks if the token is required to be
  // refreshed, and does the refresh prior to resolving. If the
  // current user is not authenticated, resolve immediately. This
  // should typically only apply on the first api call for a returning
  // user, otherwise tokens are automatically refreshed on an interval.
  const requireRefresh = useCallback(async () => {
    if (tokenExp && refreshExp) {
      // expired but refreshable
      if (Date.now() > tokenExp && Date.now() < refreshExp) {
        await refreshToken();
      }
    }
  }, [tokenExp, refreshExp, refreshToken]);

  // any time the token changes, set-up automatic token refreshing
  // every 4 minutes.
  useEffect(() => {
    if (authenticated && token) {
      const interval = setInterval(refreshToken, 1000 * 60); // 4 minutes
      return () => clearInterval(interval);
    }
  }, [token, authenticated, refreshToken]);

  // any time the tokens change in state, update local storage
  useEffect(() => {
    if (authenticated && token) {
      localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_LOCAL_STORAGE_KEY);
    }
  }, [authenticated, token]);

  // add base headers and authentication header to api requests
  const makeOptions = useCallback(
    (options: Partial<RequestInit>): Partial<RequestInit> => {
      const authHeader = currentUser.authenticated && {
        Authorization: `Bearer ${currentUser.token}`
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
    [currentUser.token, currentUser.authenticated]
  );

  // this function is passed to components via context. it wraps the fetch api
  // to call the correct domain and add the correct headers. Additionally, if a
  // request has a status code that indicates an error (e.g. 400, 401, 500, ...)
  // return a rejected promise
  const apiCall = useCallback(
    async <T,>(url: string, options: Partial<RequestInit> = {}): Promise<T> => {
      await requireRefresh();
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
    [makeOptions, setCurrentUser, requireRefresh]
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
    const res = await fetch(LOGIN_URL, {
      headers: apiLoginHeaders(),
      method: "POST",
      body: "{}",
      cache: "no-store"
    });
    if (!res.ok) {
      setCurrentUser(unauthenticatedUser);
      return Promise.reject(res);
    }
    const { token } = await res.json();
    setCurrentUser(userFromToken(token));
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
