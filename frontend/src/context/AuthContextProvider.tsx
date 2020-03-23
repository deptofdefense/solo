import React, { useState, useCallback, useEffect } from "react";
import {
  ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  REFRESH_TOKEN_LOCAL_STORAGE_KEY,
  BASE_URL,
  LOGIN_URL,
  REFRESH_URL
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
  const {
    accessToken,
    refreshToken,
    authenticated,
    tokenExp,
    refreshExp
  } = currentUser;

  // any time the tokens change in state, update local storage
  useEffect(() => {
    if (refreshToken && accessToken) {
      localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY, refreshToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
    }
  }, [refreshToken, accessToken]);

  // refresh a token and set current user based on the new token
  const refreshAuthToken = useCallback(async (refresh: string) => {
    try {
      const res = await fetch(REFRESH_URL, {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({
          refresh: refresh
        })
      });
      if (!res.ok) {
        return {};
      } else {
        return res.json();
      }
    } catch (e) {
      return {};
    }
  }, []);

  // return a promise that checks if the token is required to be
  // refreshed, and does the refresh prior to resolving. If the
  // current user is not authenticated, resolve immediately. This
  // should typically only apply on the first api call for a returning
  // user, otherwise tokens are automatically refreshed on an interval.
  const prepareToken = useCallback(async () => {
    if (tokenExp && refreshExp && refreshToken) {
      // expired but refreshable
      if (Date.now() > tokenExp && Date.now() < refreshExp) {
        const { access, refresh } = await refreshAuthToken(refreshToken);
        setCurrentUser(userFromTokens(access, refresh));
        return access;
      }
    }
    return accessToken;
  }, [tokenExp, refreshExp, refreshToken, accessToken, refreshAuthToken]);

  // any time the token changes, set-up automatic token refreshing
  // every 4 minutes.
  /* istanbul ignore next */
  useEffect(() => {
    if (authenticated && refreshToken) {
      const interval = setInterval(async () => {
        const { access, refresh } = await refreshAuthToken(refreshToken);
        setCurrentUser(userFromTokens(access, refresh));
      }, 1000 * 60 * 4); // 4 minutes
      return () => clearInterval(interval);
    }
  }, [authenticated, refreshToken, refreshAuthToken]);

  // add base headers and authentication header to api requests
  const makeOptions = useCallback(
    async (options: Partial<RequestInit>): Promise<Partial<RequestInit>> => {
      const token = await prepareToken();
      const authHeader = token && {
        Authorization: `Bearer ${token}`
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
    [prepareToken]
  );

  // this function is passed to components via context. it wraps the fetch api
  // to call the correct domain and add the correct headers. Additionally, if a
  // request has a status code that indicates an error (e.g. 400, 401, 500, ...)
  // return a rejected promise
  const apiCall = useCallback(
    async <T,>(url: string, options: Partial<RequestInit> = {}): Promise<T> => {
      const opts = await makeOptions(options);
      const res = await fetch(`${BASE_URL}${url}`, opts);
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
