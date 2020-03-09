import React from "react";
import { render } from "test-utils";
import { Table } from "solo-uswds";

describe("USWDS Table component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<Table />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("is borderless by default", () => {
    const { getByTestId } = render(<Table data-testid="testtable" />);
    const ref = getByTestId("testtable");
    expect(ref).toHaveClass("usa-table--borderless");
  });

  it("is not borderless if specified", () => {
    const { getByTestId } = render(
      <Table data-testid="testtable" borderless={false} />
    );
    const ref = getByTestId("testtable");
    expect(ref).not.toHaveClass("usa-table--borderless");
  });
});
