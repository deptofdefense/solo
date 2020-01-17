import React from "react";
import App from "../../App";
import { render } from "@testing-library/react";

describe("test app component", () => {
  it("renders without crashing", () => {
    const { getByText } = render(<App />);
    const tmpBannerElement = getByText(/SOLO/i);
    expect(tmpBannerElement).toBeInTheDocument();
  });
});
