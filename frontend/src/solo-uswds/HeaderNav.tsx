import React from "react";
import classNames from "classnames";
import iconClose from "uswds/dist/img/close.svg";

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
    className={classNames("usa-nav", {
      "is-visible": isOpen
    })}
  >
    <ul className="usa-nav__primary usa-accordion">
      <button className="usa-nav__close" onClick={onClose}>
        <img src={iconClose} alt="close" />
      </button>
      {children}
    </ul>
  </nav>
);
