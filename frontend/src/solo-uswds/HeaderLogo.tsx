import React from "react";
import { NavLink } from "react-router-dom";
import Logo from "../images/solo.png";
import classNames from "classnames";
import classes from "./HeaderLogo.module.scss";

interface HeaderLogoProps {
  text?: string;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({ text }) => (
  <div className={classNames("usa-logo", classes.logoHeader)}>
    {text && (
      <em className="usa-logo__text">
        <NavLink to="/">
          <img src={Logo} alt={text} className={classNames(classes.logoImg)} />
        </NavLink>
      </em>
    )}
  </div>
);
