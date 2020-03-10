import React from "react";
import Layout from "../Layout";
import { render } from "test-utils";

describe("test layout component", () => {
  it("Shows home page on index route", () => {
    const { queryByText } = render(<Layout />, {
      initialHistory: [""]
    });
    expect(queryByText("About Page")).not.toBeInTheDocument();
    expect(queryByText(/Welcome/)).toBeInTheDocument();
  });
});
