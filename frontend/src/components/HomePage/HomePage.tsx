import React, { useState, useCallback } from "react";
import LoginButton from "../LoginButton";
import * as api from "../../api";
import classes from "./HomePage.module.css";

const HomePage: React.FC = props => {
  const [data, setData] = useState("");

  const login = useCallback(async () => {
    setData("");
    try {
      const { refresh, access } = await api.auth.login();
      setData(`refresh: ${refresh} / access: ${access}`);
    } catch (e) {
      setData(e.toString());
    }
  }, [setData]);

  return (
    <div className={classes.root}>
      <h1 className={classes.title}>SOLO Home Page</h1>
      <LoginButton onClick={login} />
      <div>{data}</div>
    </div>
  );
};

export default HomePage;
