import React from "react";
import classes from "./LoginButton.module.css";

interface LoginButtonProps {
  onClick: React.MouseEventHandler;
}

const LoginButton: React.FC<LoginButtonProps> = ({ onClick }) => (
  <div className={classes.root}>
    <button className="usa-button usa-button--big" onClick={onClick}>
      CAC Login
    </button>
  </div>
);

export default LoginButton;
