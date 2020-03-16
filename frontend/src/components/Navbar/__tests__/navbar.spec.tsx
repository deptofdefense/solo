import React from "react";
import { render, fireEvent, wait } from "test-utils";
import Navbar from "../Navbar";

describe("Navbar component", () => {
  const logoutMock = jest.fn();

  afterEach(() => {
    logoutMock.mockReset();
  });

  it("matches snapshot", () => {
    const { asFragment } = render(<Navbar />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("clicking menu adds visibility class", async () => {
    const { container, getByText } = render(<Navbar />);
    const primaryNavSelector = '[aria-label="Primary navigation"]';
    expect(container.querySelector(primaryNavSelector)).not.toHaveClass(
      "is-visible"
    );
    const menuButton = getByText("Menu");
    fireEvent.click(menuButton);
    await wait(() => {
      expect(container.querySelector(primaryNavSelector)).toHaveClass(
        "is-visible"
      );
    });
  });

  it("clicking a link closes the menu", async () => {
    const { container, getByText } = render(<Navbar />, {
      authContext: {
        authenticated: true
      }
    });
    const primaryNavSelector = '[aria-label="Primary navigation"]';
    const menuButton = getByText("Menu");
    fireEvent.click(menuButton);
    await wait(() => {
      expect(container.querySelector(primaryNavSelector)).toHaveClass(
        "is-visible"
      );
    });
    const aboutLink = getByText("Status");
    fireEvent.click(aboutLink);
    await wait(() => {
      expect(container.querySelector(primaryNavSelector)).not.toHaveClass(
        "is-visible"
      );
    });
  });

  it("clicking logout logs out the user", async () => {
    const { getByText, queryByText } = render(<Navbar />, {
      authContext: {
        authenticated: true,
        username: "scott",
        apiLogout: logoutMock
      }
    });
    const dropdown = getByText(/scott/);
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
