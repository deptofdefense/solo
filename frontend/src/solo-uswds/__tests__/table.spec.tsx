import React from "react";
import { render } from "test-utils";
import { Table, TableData } from "solo-uswds";

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

describe("USWDS TableData component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(
      <Table>
        <tbody>
          <tr>
            <TableData />
          </tr>
        </tbody>
      </Table>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("is a regular darker colored row by default", () => {
    const { getByTestId } = render(
      <Table>
        <tbody>
          <tr>
            <TableData data-testid="testtd" />
          </tr>
        </tbody>
      </Table>
    );
    const ref = getByTestId("testtd");
    expect(ref).toHaveStyle("background-color: #f0f0f0");
  });

  it("has a white background if it's a detail row", () => {
    const { getByTestId } = render(
      <Table>
        <tbody>
          <tr>
            <TableData data-testid="testtd" details />
          </tr>
        </tbody>
      </Table>
    );
    const ref = getByTestId("testtd");
    expect(ref).not.toHaveStyle("backgroundColor: white");
  });
});
