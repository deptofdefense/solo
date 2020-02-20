import React from "react";
import classes from "./LoginPage.module.css";

interface LoginButtonProps {
  onClick: React.MouseEventHandler;
}

const LoginButton: React.FC<LoginButtonProps> = ({ onClick }) => (
  <div className={classes.btnRoot}>
    <button className="usa-button usa-button--big" onClick={onClick}>
      CAC Login
    </button>
  </div>
);

export default LoginButton;
