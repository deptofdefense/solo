import React, { useState } from "react";
import useAuthContext from "context/AuthContext";
import { Button } from "solo-uswds";
import classes from "./LoginPage.module.scss";

const LoginPage: React.FC = props => {
  const [loginError, setLoginError] = useState("");
  const { apiLogin } = useAuthContext();

  const login = async () => {
    try {
      await apiLogin();
    } catch (e) {
      setLoginError(
        "Hey Marine. Having trouble logging in? Try closing your browser window."
      );
    }
  };

  return (
    <div className={classes.root}>
      <h1 className={classes.title}>
        Welcome to the System for Operational Logistics Ordering (SOLO)
      </h1>
      <div>
        <Button big onClick={login}>
          CAC Login
        </Button>
      </div>
      {loginError && (
        <div>
          <span className={classes.errorMsg}>{loginError}</span>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
