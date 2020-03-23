import React, { useContext } from "react";
import JwtDecode from "jwt-decode";

export interface User {
  username: string;
  userId: string | null;
  authenticated: boolean;
  tokenExp: number | null;
  refreshExp: number | null;
  token: string | null;
}

export const unauthenticatedUser: User = {
  username: "",
  userId: null,
  authenticated: false,
  tokenExp: null,
  refreshExp: null,
  token: null
};

// pull user information out of token
export const userFromToken = (token: string | null): User => {
  try {
    if (!token) {
      return unauthenticatedUser;
    }
    const {
      username,
      user_id: userId,
      exp,
      refresh_exp: refreshExp
    } = JwtDecode(token);
    return {
      username: username,
      userId: userId,
      authenticated: true,
      tokenExp: exp * 1000, // convert seconds to miliseconds
      refreshExp: refreshExp * 1000, // convert seconds to miliseconds
      token
    };
  } catch (e) {
    return unauthenticatedUser;
  }
};

export interface AuthContextType extends User {
  token: string | null;
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
