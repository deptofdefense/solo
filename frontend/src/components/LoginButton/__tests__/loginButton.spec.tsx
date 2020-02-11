import React from "react";
import { render, fireEvent } from "test-utils";
import LoginButton from "../LoginButton";

describe("Login Button", () => {
  const clickHandler = jest.fn();

  afterEach(() => {
    clickHandler.mockReset();
  });

  it("matches snapshot", () => {
    const { asFragment } = render(<LoginButton onClick={clickHandler} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls click handler when clicked", async () => {
    const { getByText } = render(<LoginButton onClick={clickHandler} />);
    const button = getByText("API Test");
    fireEvent.click(button);
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });
});
