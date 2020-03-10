import React from "react";
import StatusPageDetails from "../StatusPageDetails";
import StatusPageDetailsData from "../StatusPageDetailData";
import { defaultDoc } from "../fakeDoc";
import { Address, Part, Status } from "solo-types";
import { render } from "test-utils";

jest.mock("date-fns", () => ({
  parseISO: () => "testiso",
  formatDistanceToNow: () => {
    return "some amount of time";
  }
}));

describe("StatusPageDetails Component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<StatusPageDetails document={defaultDoc} />);
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("StatusPageDetailsData Component", () => {
  const {
    status: validStatus,
    address: validAddress,
    part: validPart
  } = defaultDoc;

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("excludes shipper and receiver information if not available", () => {
    const { queryByText } = render(
      <StatusPageDetailsData
        address={[]}
        status={validStatus}
        part={validPart}
      />
    );
    expect(queryByText("Shipped From")).not.toBeInTheDocument();
  });

  it("includes shipper information if avaialable", () => {
    const shipper: Address = {
      ...validAddress[0],
      address_type: "2",
      name: "test shipper"
    };
    const { queryByText } = render(
      <StatusPageDetailsData
        address={[shipper]}
        status={validStatus}
        part={validPart}
      />
    );
    expect(queryByText("Shipped From")).toBeInTheDocument();
    expect(queryByText("test shipper")).toBeInTheDocument();
  });

  it("includes receiver information if avaialable", () => {
    const shipper: Address = {
      ...validAddress[0],
      address_type: "3",
      name: "test receiver"
    };
    const { queryByText } = render(
      <StatusPageDetailsData
        address={[shipper]}
        status={validStatus}
        part={validPart}
      />
    );
    expect(queryByText("Shipped To")).toBeInTheDocument();
    expect(queryByText("test receiver")).toBeInTheDocument();
  });

  it("excludes part information if not available", () => {
    const { queryByText } = render(
      <StatusPageDetailsData address={[]} status={[]} part={[]} />
    );
    expect(queryByText("NIIN")).not.toBeInTheDocument();
  });

  it("includes information of first part if available", () => {
    const part: Part = {
      ...validPart[0],
      nsn: "testpartnsn",
      uom: "testunitofmeasure"
    };
    const { queryByText } = render(
      <StatusPageDetailsData address={[]} status={[]} part={[part]} />
    );
    expect(queryByText("NIIN")).toBeInTheDocument();
    expect(queryByText("Quantity")).toBeInTheDocument();
    expect(queryByText("Unit of Measure")).toBeInTheDocument();
    expect(queryByText("testpartnsn")).toBeInTheDocument();
    expect(queryByText("testunitofmeasure")).toBeInTheDocument();
  });

  it("formats status date relative to the current time", () => {
    const status: Status = {
      ...validStatus[0]
    };
    const { queryByText } = render(
      <StatusPageDetailsData address={[]} status={[status]} part={[]} />
    );
    expect(queryByText("some amount of time ago")).toBeInTheDocument();
  });
});
