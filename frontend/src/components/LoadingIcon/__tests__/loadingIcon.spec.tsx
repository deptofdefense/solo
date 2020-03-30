import React from "react";
import { render } from "test-utils";
import { LoadingIcon } from "../LoadingIcon";

describe("LoadingIcon component", () => {
  it("renders loading icon when loading", async () => {
    const { asFragment } = render(<LoadingIcon loading error={false} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders error icon on fetch error", async () => {
    const { asFragment } = render(
      <LoadingIcon loading={false} error={true} message="some error" />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders check icon on fetch success", async () => {
    const { asFragment } = render(
      <LoadingIcon loading={false} error={false} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
