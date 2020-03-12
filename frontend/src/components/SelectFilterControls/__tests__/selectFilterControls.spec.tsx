import React from "react";
import { render, fireEvent, wait } from "test-utils";
import SelectFilterControls from "../SelectFilterControls";

describe("SelectFilterControls component", () => {
  const testOpts = [
    { name: "test opt 1", value: "testopt1" },
    { name: "test opt 2", value: "testopt2" },
    { name: "test opt 3", value: "testopt3" }
  ];
  const submitCallback = jest.fn();

  afterEach(() => {
    submitCallback.mockReset();
  });

  it("matches snapshot", () => {
    const { asFragment } = render(
      <SelectFilterControls options={testOpts} onSubmit={submitCallback} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("includes all passed options", () => {
    const { queryByText } = render(
      <SelectFilterControls options={testOpts} onSubmit={submitCallback} />
    );
    expect(queryByText("test opt 1")).toBeInTheDocument();
    expect(queryByText("test opt 2")).toBeInTheDocument();
    expect(queryByText("test opt 3")).toBeInTheDocument();
  });

  it("sets current field based on default option when rendered", async () => {
    const { getByPlaceholderText } = render(
      <SelectFilterControls
        options={testOpts}
        onSubmit={submitCallback}
        defaultOption="testopt3"
      />
    );
    const select = getByPlaceholderText("Field");
    expect(select).toHaveValue("testopt3");
  });

  it("calls submit callback with field and value on form submit", async () => {
    const { getByPlaceholderText, container } = render(
      <SelectFilterControls
        options={testOpts}
        onSubmit={submitCallback}
        defaultOption="testopt2"
      />
    );
    const btn = container.querySelector("button");
    const search = getByPlaceholderText("Search");
    fireEvent.change(search, {
      target: {
        value: "my search value"
      }
    });
    await wait(() => {
      expect(search).toHaveValue("my search value");
    });
    fireEvent.click(btn as Element);
    await wait(() => {
      expect(submitCallback).toHaveBeenCalled();
      expect(submitCallback.mock.calls[0][0]).toMatchObject({
        option: "testopt2",
        value: "my search value"
      });
    });
  });
});
