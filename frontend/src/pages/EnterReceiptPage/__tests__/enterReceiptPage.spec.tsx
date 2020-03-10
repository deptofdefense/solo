import React from "react";
import EnterReceiptPage from "../EnterReceiptPage";
import { render } from "test-utils";

describe("EnterReceiptPage Component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<EnterReceiptPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
