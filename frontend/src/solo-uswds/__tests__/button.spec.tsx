import React from "react";
import { render, wait, fireEvent } from "test-utils";
import { Button } from "solo-uswds";

describe("uswds button component", () => {
  const clickMock = jest.fn();

  afterEach(() => {
    clickMock.mockReset();
  });

  it("matches snapshot", () => {
    const { asFragment, getByText } = render(
      <Button onClick={clickMock}>testbtn</Button>
    );
    const btn = getByText("testbtn");
    expect(btn).toHaveClass("usa-button");
    expect(btn).not.toHaveClass(
      "usa-button--outline",
      "usa-button--active",
      "usa-button--inverse",
      "usa-focus",
      "usa-button--big"
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("adds other classes based on props", () => {
    const { getByText } = render(
      <Button
        onClick={clickMock}
        focused
        outline
        active
        inverse
        big
        className="someotherclassfromparent"
      >
        testbtn
      </Button>
    );
    const btn = getByText("testbtn");
    expect(btn).toHaveClass(
      "usa-button",
      "usa-button--outline",
      "usa-button--active",
      "usa-button--inverse",
      "usa-focus",
      "usa-button--big"
    );
  });

  it("calls click handler on click", () => {
    const { getByText } = render(<Button onClick={clickMock}>clickme</Button>);
    const btn = getByText("clickme");
    fireEvent.click(btn);
    expect(clickMock).toHaveBeenCalled();
  });

  it("adds appropriate secondary color class", () => {
    const { getByText } = render(
      <Button onClick={clickMock} color="secondary">
        testbtn
      </Button>
    );
    const btn = getByText("testbtn");
    expect(btn).toHaveClass("usa-button--secondary");
    expect(btn).not.toHaveClass("usa-button--base");
  });

  it("adds appropriate cool accent color class", () => {
    const { getByText } = render(
      <Button onClick={clickMock} color="accent-cool">
        testbtn
      </Button>
    );
    const btn = getByText("testbtn");
    expect(btn).toHaveClass("usa-button--accent-cool");
    expect(btn).not.toHaveClass("usa-button--base");
  });

  it("adds appropriate base color class", () => {
    const { getByText } = render(
      <Button onClick={clickMock} color="base">
        testbtn
      </Button>
    );
    const btn = getByText("testbtn");
    expect(btn).toHaveClass("usa-button--base");
  });

  it("toggles focus class on mouse over", async () => {
    const { getByText } = render(<Button onClick={clickMock}>testbtn</Button>);
    const btn = getByText("testbtn");
    expect(btn).not.toHaveClass("usa-button--hover");
    fireEvent.mouseEnter(btn);
    await wait(() => {
      expect(btn).toHaveClass("usa-button--hover");
    });
    fireEvent.mouseLeave(btn);
    await wait(() => {
      expect(btn).not.toHaveClass("usa-button--hover");
    });
  });
});
