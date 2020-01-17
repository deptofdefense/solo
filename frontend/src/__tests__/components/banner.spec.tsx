import React from "react";
import Banner from "../../components/Banner";
import { render } from "@testing-library/react";

describe("test temporary banner component", () => {
  it("renders with a default title", () => {
    const expectedTitle = "System for Operational Logistics Orders (SOLO)";
    const { getByText } = render(<Banner />);
    const headerElem = getByText(expectedTitle);
    expect(headerElem).toBeInTheDocument();
  });

  it("renders provided title if passed", () => {
    const { getByText } = render(<Banner title="test title" />);
    const headerElem = getByText("test title");
    expect(headerElem).toBeInTheDocument();
  });
});
