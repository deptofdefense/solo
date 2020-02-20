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

  it("Shows about page on /about route", () => {
    const { queryByText } = render(<Layout />, {
      initialHistory: ["/about"]
    });
    expect(queryByText("SOLO Home Page")).not.toBeInTheDocument();
    expect(queryByText("About Page")).toBeInTheDocument();
  });
});
