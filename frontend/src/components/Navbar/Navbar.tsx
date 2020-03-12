import React, { useState, useCallback } from "react";
import {
  Header,
  HeaderNavbar,
  HeaderNav,
  HeaderNavLink,
  HeaderLogo
} from "solo-uswds";
import { useAuthContext } from "context";

const Navbar: React.FC = () => {
  const { authenticated } = useAuthContext();
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
        {authenticated && (
          <>
            <HeaderNavLink to="/" exact onClick={close}>
              Status
            </HeaderNavLink>
            <HeaderNavLink to="/d6t" exact onClick={close}>
              Enter Receipt (D6T)
            </HeaderNavLink>
            <HeaderNavLink to="/cor" exact onClick={close}>
              Confirmation of Receipt (COR)
            </HeaderNavLink>
          </>
        )}
      </HeaderNav>
    </Header>
  );
};

export default Navbar;
