import React, { useState, useCallback } from "react";
import HeaderNav from "./HeaderNav";
import HeaderLogo from "./HeaderLogo";
import HeaderNavLink from "./HeaderNavLink";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  return (
    <>
      <div className="usa-overlay"></div>
      <header className="usa-header usa-header--basic">
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <HeaderLogo text="SOLO" />
            <button onClick={toggleOpen} className="usa-menu-btn">
              Menu
            </button>
          </div>
          <HeaderNav isOpen={isOpen} onClose={toggleOpen}>
            <HeaderNavLink
              to="/about"
              activeClassName="usa-current"
              onClick={() => setIsOpen(false)}
            >
              About
            </HeaderNavLink>
          </HeaderNav>
        </div>
      </header>
    </>
  );
};

export default Header;
