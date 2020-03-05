import React from "react";
import { NavLink, NavLinkProps } from "react-router-dom";

interface HeaderNavLinkProps extends NavLinkProps {
  children: string;
}

export const HeaderNavLink: React.FC<HeaderNavLinkProps> = ({
  children,
  activeClassName,
  ...props
}) => {
  return (
    <li className="usa-nav__primary-item">
      <NavLink
        className="usa-nav__link"
        activeClassName={activeClassName || "usa-current"}
        {...props}
      >
        <span>{children}</span>
      </NavLink>
    </li>
  );
};
