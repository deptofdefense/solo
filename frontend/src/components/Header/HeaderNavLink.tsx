import React from "react";
import { NavLink, NavLinkProps } from "react-router-dom";

interface HeaderNavLinkProps extends NavLinkProps {
  children: string;
}

const HeaderNavLink: React.FC<HeaderNavLinkProps> = ({
  children,
  ...props
}) => {
  return (
    <li className="usa-nav__primary-item">
      <NavLink className="usa-nav__link" {...props}>
        <span>{children}</span>
      </NavLink>
    </li>
  );
};

export default HeaderNavLink;
