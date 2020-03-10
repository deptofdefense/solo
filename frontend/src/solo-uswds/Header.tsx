import React from "react";

export const Header: React.FC = ({ children }) => (
  <header className="usa-header usa-header--basic">
    <div className="usa-nav-container" style={{ maxWidth: "none" }}>
      {children}
    </div>
  </header>
);

export const HeaderNavbar: React.FC = ({ children }) => (
  <div className="usa-navbar">{children}</div>
);
