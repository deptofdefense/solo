import React, { useContext } from "react";
import JwtDecode from "jwt-decode";

export interface User {
  username: string;
  userId: string | null;
  authenticated: boolean;
  tokenExp: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export const unauthenticatedUser: User = {
  username: "",
  userId: null,
  authenticated: false,
  tokenExp: null,
  accessToken: null,
  refreshToken: null
};

// pull user information out of a JWT access token
export const userFromTokens = (
  accessToken: string | null,
  refreshToken: string | null
): User => {
  try {
    if (!accessToken) {
      return unauthenticatedUser;
    }
    const { username, user_id: userId, exp } = JwtDecode(accessToken);
    return {
      username: username,
      userId: userId,
      authenticated: true,
      tokenExp: exp,
      accessToken,
      refreshToken
    };
  } catch (e) {
    return unauthenticatedUser;
  }
};

export interface AuthContextType extends User {
  accessToken: string | null;
  refreshToken: string | null;
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
