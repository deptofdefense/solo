import React from "react";
import AdminPage from "../AdminPage";
import { render } from "test-utils";

describe("AdminPage Component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<AdminPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
