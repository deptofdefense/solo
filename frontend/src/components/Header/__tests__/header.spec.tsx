import React from "react";
import { render, fireEvent, wait } from "test-utils";
import Header from "../Header";
import HeaderLogo from "../HeaderLogo";
import HeaderNavLink from "../HeaderNavLink";
import HeaderNav from "../HeaderNav";

describe("HeaderLogo component", () => {
  it("matches snapshot @snapshot", () => {
    const { asFragment } = render(<HeaderLogo text="test" />);
    expect(asFragment()).toMatchSnapshot();
  });
  it("includes link when text is passed", () => {
    const { getByText } = render(<HeaderLogo text="test" />);
    expect(getByText("test")).toBeInTheDocument();
  });

  it("excludes link when text is not passed", () => {
    const { queryByText } = render(<HeaderLogo />);
    expect(queryByText("test")).not.toBeInTheDocument();
  });
});

describe("HeaderNavComponent", () => {
  let props = {
    isOpen: true,
    onClose: jest.fn()
  };

  afterEach(() => {
    props.onClose.mockReset();
  });

  it("matches snapshot @snapshot", () => {
    const { asFragment } = render(<HeaderNav {...props} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("adds visible class when open", () => {
    const { container } = render(<HeaderNav {...props} />);
    expect(container.firstChild).toHaveClass("is-visible");
  });

  it("omits visible class when closed", () => {
    const { container } = render(<HeaderNav {...props} isOpen={false} />);
    expect(container.firstChild).not.toHaveClass("is-visible");
  });

  it("calls onClose when close button is clicked", async () => {
    const { getByAltText } = render(<HeaderNav {...props} />);
    const closeIcon = getByAltText("close");
    fireEvent.click(closeIcon);
    await wait(() => {
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });
  });
});

describe("HeaderNavLink component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<HeaderNavLink to="#">test</HeaderNavLink>);
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("Header component", () => {
  it("matches snapshot @snapshot", () => {
    const { asFragment } = render(<Header />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("clicking menu adds visibility class", async () => {
    const { container, getByText } = render(<Header />);
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
    const { container, getByText } = render(<Header />);
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
