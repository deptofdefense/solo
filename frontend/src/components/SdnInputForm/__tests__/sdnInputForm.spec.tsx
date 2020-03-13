import React from "react";
import { render, fireEvent, wait } from "test-utils";
import SdnInputForm from "../SdnInputForm";

describe("SdnInputForm component", () => {
  const submitMock = jest.fn();

  afterEach(() => {
    submitMock.mockReset();
  });

  it("updates input value", async () => {
    const { getByPlaceholderText } = render(
      <SdnInputForm onSubmit={submitMock} />
    );
    const inputField = getByPlaceholderText("SDN");
    fireEvent.change(inputField, {
      target: { value: "sdniwant" }
    });
    await wait(() => {
      expect(inputField).toHaveValue("sdniwant");
    });
  });

  it("calls onSubmit callback and resets input field on form submit", async () => {
    const { getByPlaceholderText, container } = render(
      <SdnInputForm onSubmit={submitMock} />
    );
    const inputField = getByPlaceholderText("SDN");
    const submitBtn = container.querySelector(
      "button[type='submit']"
    ) as Element;
    fireEvent.change(inputField, {
      target: { value: "anothersdn" }
    });
    await wait(() => {
      expect(inputField).toHaveValue("anothersdn");
    });
    fireEvent.click(submitBtn);
    await wait(() => {
      expect(submitMock).toHaveBeenCalledTimes(1);
      expect(submitMock.mock.calls[0][0]).toEqual("anothersdn");
      expect(inputField).toHaveValue("");
    });
  });
});
