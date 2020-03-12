import React from "react";
import ConfirmationOfReceiptPage from "../ConfirmationOfReceiptPage";
import { render } from "test-utils";

describe("ConfirmationOfReceiptPage Component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<ConfirmationOfReceiptPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
