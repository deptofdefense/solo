import React from "react";
import classNames from "classnames";
import iconClose from "uswds/dist/img/close.svg";
import classes from "./HeaderNav.module.scss";

interface HeaderNavProps {
  isOpen: boolean;
  onClose: React.MouseEventHandler;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  children,
  isOpen,
  onClose
}) => (
  <nav
    aria-label="Primary navigation"
    className={classNames("usa-nav", classes.navContainer, {
      "is-visible": isOpen
    })}
  >
    <ul
      className={classNames(
        "usa-nav__primary",
        "usa-accordion",
        classes.navList
      )}
    >
      <button className="usa-nav__close" onClick={onClose}>
        <img src={iconClose} alt="close" />
      </button>
      {children}
    </ul>
  </nav>
);
