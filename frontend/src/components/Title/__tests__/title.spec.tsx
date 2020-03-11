import React from "react";
import { Title } from "components";
import { render } from "test-utils";

describe("title component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<Title>Test Title</Title>);
    expect(asFragment()).toMatchSnapshot();
  });

  it("Includes title being passed as children", () => {
    const { queryByText } = render(<Title>Title Argument</Title>);
    expect(queryByText("Title Argument")).toBeInTheDocument();
  });
});
