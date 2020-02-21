import React, { useCallback } from "react";
import { useHistory } from "react-router-dom";
import useAuthContext from "../../context/AuthContext";
import classes from "./HomePage.module.css";

const HomePage: React.FC = () => {
  const history = useHistory();
  const { username, apiLogout } = useAuthContext();

  const logoutUser = useCallback(async () => {
    await apiLogout();
    history.push("/postlogout");
  }, [apiLogout, history]);

  return (
    <div className={classes.root}>
      <h2>Protected Route</h2>
      <div>username: {username}</div>
      <button onClick={logoutUser} className="usa-button">
        Logout
      </button>
    </div>
  );
};

export default HomePage;
