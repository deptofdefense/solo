import React, { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import UserContext from "./UserContext";
import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from '../constants';
import * as api from "../api";


const UserContextProvider: React.FC = ({ children }) => {
  const [username, setUsername] = useState<string | null>();
  const [userId, setUserId] = useState<number | null>();

  const onAccessTokenUpdated = (token: string | null) => {
    if (token === null) {
      setUsername(null);
      setUserId(null);
    } else {
      const { username, user_id: userId } = jwtDecode(token);
      setUsername(username);
      setUserId(userId);
    }
  };

  useEffect(() => {
    window.addEventListener("storage", ev => {
      if (ev.key === ACCESS_TOKEN_LOCAL_STORAGE_KEY) {
        onAccessTokenUpdated(ev.newValue);
      }
    });
  }, []);

  const ctxValue = {
    authenticated: Boolean(userId),
    username,
    userId
  };

  return (
    <UserContext.Provider value={ctxValue}>{children}</UserContext.Provider>
  );
};

export default UserContextProvider;
