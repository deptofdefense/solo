import React from "react";
import { render, fireEvent, wait } from "test-utils";
import Navbar from "../Navbar";

describe("Navbar component", () => {
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
    const { container, getByText } = render(<Navbar />);
    const primaryNavSelector = '[aria-label="Primary navigation"]';
    const menuButton = getByText("Menu");
    fireEvent.click(menuButton);
    await wait(() => {
      expect(container.querySelector(primaryNavSelector)).toHaveClass(
        "is-visible"
      );
    });
    const aboutLink = getByText("About");
    fireEvent.click(aboutLink);
    await wait(() => {
      expect(container.querySelector(primaryNavSelector)).not.toHaveClass(
        "is-visible"
      );
    });
  });
});
