import React from "react";
import useAuthContext from "../../context/AuthContext";
import classes from "./HomePage.module.css";

const HomePage: React.FC = () => {
  const { username, apiLogout } = useAuthContext();

  return (
    <div className={classes.root}>
      <div>Protected Route</div>
      <div>username: {username}</div>
      <button onClick={() => apiLogout()} className="usa-button">
        Logout
      </button>
    </div>
  );
};

export default HomePage;
