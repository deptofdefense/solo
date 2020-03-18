import React from "react";
import { render, fireEvent, wait } from "test-utils";
import { Checkbox } from "solo-uswds/Checkbox";

describe("Checkbox component", () => {
  const changeMock = jest.fn();

  afterEach(() => {
    changeMock.mockReset();
  });

  it("calls on change on checked change", async () => {
    const { getByTitle } = render(
      <Checkbox onChange={changeMock} checked={false} title="testcheck" />
    );
    const inp = getByTitle("testcheck");
    fireEvent.click(inp);
    await wait(() => {
      expect(changeMock).toHaveBeenCalled();
    });
  });
});
