import React from "react";
import PostLogoutPage from "../PostLogoutPage";
import { render } from "test-utils";

describe("post logout page componenent", () => {
  it("matches snapshot", async () => {
    const { asFragment } = render(<PostLogoutPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
