import React from "react";
import { NavLink } from "react-router-dom";

interface HeaderLogoProps {
  text?: string;
}

const HeaderLogo: React.FC<HeaderLogoProps> = ({ text }) => (
  <div className="usa-logo">
    {text && (
      <em className="usa-logo__text">
        <NavLink to="/">{text}</NavLink>
      </em>
    )}
  </div>
);

export default HeaderLogo;
