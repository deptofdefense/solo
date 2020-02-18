import React from "react";

interface UserContext {
  authenticated: boolean;
  username: string | null;
  userId: number | null;
}

const UserContext = React.createContext<UserContext>({
  authenticated: false,
  username: null,
  userId: null
});

export default UserContext;
