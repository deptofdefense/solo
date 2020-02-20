import React from "react";
import { render, fireEvent, wait } from "test-utils";
import LoginPage from "../LoginPage";

describe("Home page component", () => {
  const fakeLogin = jest.fn();
  const renderOpts = {
    authContext: {
      apiLogin: fakeLogin
    }
  };

  afterEach(() => {
    fakeLogin.mockReset();
  });

  it("calls login on button click", async () => {
    const { getByText } = render(<LoginPage />, renderOpts);
    const loginBtn = getByText("CAC Login");
    fireEvent.click(loginBtn);
    expect(fakeLogin).toHaveBeenCalled();
  });

  it("displays login information on failed login", async () => {
    fakeLogin.mockRejectedValue(new Error("test error message"));
    const { getByText, queryByText } = render(<LoginPage />, renderOpts);
    const loginBtn = getByText("CAC Login");
    fireEvent.click(loginBtn);
    await wait(() => {
      expect(fakeLogin).toHaveBeenCalled();
      expect(queryByText(/test error message/)).toBeInTheDocument();
    });
  });
});
