import React, { useState, useCallback } from "react";
import {
  Header,
  HeaderNavbar,
  HeaderNav,
  HeaderNavLink,
  HeaderLogo
} from "solo-uswds";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  const close = () => setIsOpen(false);

  return (
    <Header>
      <HeaderNavbar>
        <HeaderLogo text="SOLO" />
        <button onClick={toggleOpen} className="usa-menu-btn">
          Menu
        </button>
      </HeaderNavbar>
      <HeaderNav isOpen={isOpen} onClose={toggleOpen}>
        <HeaderNavLink to="/" exact onClick={close}>
          Status
        </HeaderNavLink>
      </HeaderNav>
    </Header>
  );
};

export default Navbar;
