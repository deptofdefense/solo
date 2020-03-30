import React from "react";
import { render, fireEvent, wait } from "test-utils";
import {
  Header,
  HeaderLogo,
  HeaderNav,
  HeaderNavLink,
  HeaderNavbar
} from "solo-uswds";

describe("uswds Header component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<Header />);
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("uswds HeaderNavbar component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<HeaderNavbar />);
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("uswds HeaderLogo component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<HeaderLogo text="test" />);
    expect(asFragment()).toMatchSnapshot();
  });
  it("includes link when text is passed", () => {
    const { getByAltText } = render(<HeaderLogo text="test" />);
    expect(getByAltText("test")).toBeInTheDocument();
  });

  it("excludes link when text is not passed", () => {
    const { queryByAltText } = render(<HeaderLogo />);
    expect(queryByAltText("test")).not.toBeInTheDocument();
  });
});

describe("uswds HeaderNavComponent", () => {
  let props = {
    isOpen: true,
    onClose: jest.fn()
  };

  afterEach(() => {
    props.onClose.mockReset();
  });

  it("matches snapshot when open", () => {
    const { asFragment } = render(<HeaderNav {...props} isOpen />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("matches snapshot when closed", () => {
    const { asFragment } = render(<HeaderNav {...props} isOpen={false} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("adds visible class when open", () => {
    const { container } = render(<HeaderNav {...props} isOpen />);
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

describe("uswds HeaderNavLink component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<HeaderNavLink to="#">test</HeaderNavLink>);
    expect(asFragment()).toMatchSnapshot();
  });
});
