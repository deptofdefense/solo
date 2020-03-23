import React, { useContext } from "react";
import JwtDecode from "jwt-decode";

export interface User {
  username: string;
  userId: string | null;
  authenticated: boolean;
  tokenExp: number | null;
  refreshExp: number | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export const unauthenticatedUser: User = {
  username: "",
  userId: null,
  authenticated: false,
  tokenExp: null,
  refreshExp: null,
  accessToken: null,
  refreshToken: null
};

// pull user information out of token
export const userFromTokens = (
  accessToken: string | null,
  refreshToken: string | null
): User => {
  try {
    if (!accessToken || !refreshToken) {
      return unauthenticatedUser;
    }
    const { username, user_id: userId, exp } = JwtDecode(accessToken);
    const { exp: refreshExp } = JwtDecode(refreshToken);
    return {
      username: username,
      userId: userId,
      authenticated: true,
      tokenExp: exp * 1000, // convert seconds to miliseconds
      refreshExp: refreshExp * 1000, // convert seconds to miliseconds
      accessToken,
      refreshToken
    };
  } catch (e) {
    return unauthenticatedUser;
  }
};

export interface AuthContextType extends User {
  apiCall: <T>(url: string, options: Partial<RequestInit>) => Promise<T>;
  apiLogin: () => Promise<void>;
  apiLogout: () => Promise<void>;
}

/* istanbul ignore next */
export const defaultAuthContext = {
  ...unauthenticatedUser,
  apiCall: async <T,>() => ({} as T),
  apiLogin: async () => {},
  apiLogout: async () => {}
};

export const AuthContext = React.createContext<AuthContextType>(
  defaultAuthContext
);

const useAuthContext = (): AuthContextType => {
  return useContext(AuthContext);
};

export default useAuthContext;
