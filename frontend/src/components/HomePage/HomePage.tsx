import React, { useState, useCallback } from "react";
import LoginButton from "../LoginButton";
import * as api from "../../api";
import classes from "./HomePage.module.css";

const HomePage: React.FC = props => {
  const [data, setData] = useState("");

  const checkConnectivity = useCallback(async () => {
    setData("");
    try {
      await api.auth.apiConnectivityTest();
      setData("success");
    } catch (e) {
      setData(e.toString());
    }
  }, [setData]);

  return (
    <div className={classes.root}>
      <h1 className={classes.title}>SOLO Home Page</h1>
      <LoginButton onClick={checkConnectivity} />
      <div>{data}</div>
    </div>
  );
};

export default HomePage;
