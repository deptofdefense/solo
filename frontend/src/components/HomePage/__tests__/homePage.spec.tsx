import React from "react";
import HomePage from "../HomePage";
import { render, fireEvent } from "test-utils";

describe("home page protected route component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<HomePage />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("includes username in the body", () => {
    const { queryByText } = render(<HomePage />, {
      authContext: {
        username: "testuser"
      }
    });
    expect(queryByText(/testuser/)).toBeInTheDocument();
  });

  it("calls logout on button click", () => {
    const fakeLogout = jest.fn();
    const { getByText } = render(<HomePage />, {
      authContext: {
        apiLogout: fakeLogout
      }
    });
    const logoutBtn = getByText("Logout");
    fireEvent.click(logoutBtn);
    expect(fakeLogout).toHaveBeenCalled();
  });
});
