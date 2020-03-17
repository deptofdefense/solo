import React, { useState } from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserLock } from "@fortawesome/free-solid-svg-icons";
import classes from "./NavbarUserDropdown.module.scss";

interface NavbarUserDropdownProps {
  username: string;
  onLogout: () => void;
}

const NavbarUserDropdown: React.FC<NavbarUserDropdownProps> = ({
  username,
  onLogout
}) => {
  const [expanded, setExpanded] = useState(false);

  const onLogoutClick: React.MouseEventHandler<HTMLAnchorElement> = event => {
    event.preventDefault();
    onLogout();
  };

  return (
    <li className="usa-nav__primary-item">
      <button
        onClick={() => setExpanded(!expanded)}
        className={classNames("usa-accordion__button", "usa-nav__link", {
          "usa-current": expanded
        })}
        aria-expanded={expanded}
      >
        <FontAwesomeIcon className="margin-right-1" icon={faUser} />
        <span>{username}</span>
      </button>
      {expanded && (
        <ul className={classNames("usa-nav__submenu", classes.submenu)}>
          <li className="usa-nav__submenu-item">
            <a href="/postlogout" onClick={onLogoutClick}>
              <FontAwesomeIcon className="margin-right-1" icon={faUserLock} />
              Logout
            </a>
          </li>
        </ul>
      )}
    </li>
  );
};

export default NavbarUserDropdown;
