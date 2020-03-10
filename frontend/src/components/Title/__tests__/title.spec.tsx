import React from "react";
import { Title } from "components";
import { render } from "test-utils";

describe("title component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<Title />);
    expect(asFragment()).toMatchSnapshot();
  });
});
