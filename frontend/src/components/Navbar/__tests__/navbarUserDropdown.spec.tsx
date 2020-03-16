import React from "react";
import { render, fireEvent, wait } from "test-utils";
import NavbarUserDropdown from "../NavbarUserDropdown";

describe("NavbarUserDropdown component", () => {
  const logoutMock = jest.fn();

  afterEach(() => {
    logoutMock.mockReset();
  });

  it("displays username", () => {
    const { queryByText } = render(
      <NavbarUserDropdown username="testuser" onLogout={logoutMock} />
    );
    expect(queryByText(/testuser/)).toBeInTheDocument();
  });

  it("shows logout link on expand menu", async () => {
    const { getByText, queryByText } = render(
      <NavbarUserDropdown username="testuser" onLogout={logoutMock} />
    );
    const dropdown = getByText("testuser");
    fireEvent.click(dropdown);
    await wait(() => {
      expect(queryByText(/Logout/)).toBeInTheDocument();
    });
  });

  it("calls logout prop on logout click", async () => {
    const { getByText, queryByText } = render(
      <NavbarUserDropdown username="testuser" onLogout={logoutMock} />
    );
    const dropdown = getByText("testuser");
    fireEvent.click(dropdown);
    await wait(() => {
      expect(queryByText(/Logout/)).toBeInTheDocument();
    });
    const logout = getByText(/Logout/);
    fireEvent.click(logout);
    await wait(() => {
      expect(logoutMock).toHaveBeenCalled();
    });
  });
});
