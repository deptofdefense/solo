import React, { useState, useCallback } from "react";
import { useHistory } from "react-router";
import {
  Header,
  HeaderNavbar,
  HeaderNav,
  HeaderNavLink,
  HeaderLogo
} from "solo-uswds";
import NavbarUserDropdown from "./NavbarUserDropdown";
import { useAuthContext } from "context";

const Navbar: React.FC = () => {
  const history = useHistory();
  const { authenticated, username, apiLogout } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  const close = () => setIsOpen(false);

  const onLogout = async () => {
    await apiLogout();
    history.push("/postlogout");
  };

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
            <NavbarUserDropdown
              username={username}
              onLogout={onLogout}
            />
          </>
        )}
      </HeaderNav>
    </Header>
  );
};

export default Navbar;
