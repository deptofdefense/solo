import React from "react";
import DocumentDetails from "../DocumentDetails";
import { Address, defaultDoc } from "solo-types";
import { render } from "test-utils";

jest.mock("date-fns", () => ({
  parseISO: () => "testiso",
  formatDistanceToNow: () => {
    return "some amount of time";
  }
}));

describe("DocumentDetails Component", () => {
  const { statuses, shipper, receiver, part } = defaultDoc;

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("excludes shipper and receiver information if not available", () => {
    const { queryByText } = render(
      <DocumentDetails statuses={statuses} part={part} />
    );
    expect(queryByText("Shipped From")).not.toBeInTheDocument();
  });

  it("includes shipper information if avaialable", () => {
    const { queryByText } = render(
      <DocumentDetails
        shipper={
          {
            ...shipper,
            name: "testshipper"
          } as Address
        }
        statuses={statuses}
        part={part}
      />
    );
    expect(queryByText("Shipped From")).toBeInTheDocument();
    expect(queryByText("testshipper")).toBeInTheDocument();
  });

  it("includes receiver information if avaialable", () => {
    const { queryByText } = render(
      <DocumentDetails
        receiver={
          {
            ...receiver,
            name: "test receiver"
          } as Address
        }
        statuses={statuses}
        part={part}
      />
    );
    expect(queryByText("Shipped To")).toBeInTheDocument();
    expect(queryByText("test receiver")).toBeInTheDocument();
  });

  it("excludes part information if not available", () => {
    const { queryByText } = render(<DocumentDetails statuses={[]} />);
    expect(queryByText("NIIN")).not.toBeInTheDocument();
  });

  it("includes information of part if available", () => {
    const { queryByText } = render(
      <DocumentDetails
        statuses={[]}
        part={{
          ...part,
          nsn: "testpartnsn",
          uom: "testunitofmeasure"
        }}
      />
    );
    expect(queryByText("NIIN")).toBeInTheDocument();
    expect(queryByText("Unit of Measure")).toBeInTheDocument();
    expect(queryByText("testpartnsn")).toBeInTheDocument();
    expect(queryByText("testunitofmeasure")).toBeInTheDocument();
  });

  it("formats status date relative to the current time", () => {
    const { queryByText } = render(
      <DocumentDetails statuses={[statuses[0]]} />
    );
    expect(queryByText("some amount of time ago")).toBeInTheDocument();
  });
});
