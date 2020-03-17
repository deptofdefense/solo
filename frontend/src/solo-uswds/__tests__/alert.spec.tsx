import React from "react";
import { render } from "test-utils";
import { Alert } from "solo-uswds";

describe("USWDS alert component", () => {
  it("renders heading when passed", () => {
    const { queryByText } = render(
      <Alert status="success" heading="some heading" />
    );
    expect(queryByText("some heading")).toBeInTheDocument();
  });

  it("renders body when passed", () => {
    const { queryByText } = render(
      <Alert status="success" text="alert body" />
    );
    expect(queryByText("alert body")).toBeInTheDocument();
  });
});
