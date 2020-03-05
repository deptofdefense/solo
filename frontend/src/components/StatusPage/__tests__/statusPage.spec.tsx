import React from "react";
import { render } from "test-utils";
import StatusPage from "../StatusPage";

describe("StatusPage component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<StatusPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
