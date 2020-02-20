import React, { useState } from "react";
import LoginButton from "./LoginButton";
import useAuthContext from "../../context/AuthContext";
import classes from "./LoginPage.module.css";

const LoginPage: React.FC = props => {
  const [loginError, setLoginError] = useState("");
  const { apiLogin } = useAuthContext();

  const login = async () => {
    try {
      await apiLogin();
    } catch (e) {
      setLoginError(e.toString());
    }
  };

  return (
    <div className={classes.root}>
      <h1 className={classes.title}>
        Welcome to the System for Operational Logistics Ordering (SOLO)
      </h1>
      <div>
        <LoginButton onClick={login} />
        {loginError && <span className="error-dark">{loginError}</span>}
      </div>
    </div>
  );
};

export default LoginPage;
