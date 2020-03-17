import React from "react";
import { defaultApiResponse } from "solo-types";
import { render, fireEvent, wait } from "test-utils";
import ConfirmationOfReceiptPage from "../ConfirmationOfReceiptPage";

jest.mock("components/Paginator", () => () => <div>paginator</div>);
jest.mock("components/SelectFilterControls", () => () => <div>filters</div>);
jest.mock("components/Title", () => () => <div>title</div>);

afterAll(() => {
  jest.restoreAllMocks();
});

describe("ConfirmationOfReceiptPage component submit COR functionality", () => {
  const fetchMock = jest.fn();
  const defaultDoc = defaultApiResponse.results[0];

  afterEach(() => {
    fetchMock.mockReset();
  });

  const renderWithInitialData = async () => {
    fetchMock.mockResolvedValue(defaultApiResponse);
    const { queryByText, getByPlaceholderText, container, ...rest } = render(
      <ConfirmationOfReceiptPage />,
      {
        authContext: {
          apiCall: fetchMock
        }
      }
    );
    await wait(() => {
      expect(queryByText(defaultDoc.sdn)).toBeInTheDocument();
    });
    const receivedByInput = getByPlaceholderText("Rank Lastname, Firstname MI");
    fireEvent.change(receivedByInput, {
      target: { value: "Private Casarotto, Stuart" }
    });
    await wait(() => {
      expect(receivedByInput).toHaveValue("Private Casarotto, Stuart");
    });
    const submitBtn = container.querySelector(
      "button[type='submit']"
    ) as Element;
    return {
      queryByText,
      getByPlaceholderText,
      container,
      submitBtn,
      receivedByInput,
      ...rest
    };
  };

  it("form inputs are disabled when appropriate", async () => {
    const { submitBtn, receivedByInput } = await renderWithInitialData();
    expect(submitBtn).not.toHaveAttribute("disabled");
    expect(receivedByInput).not.toHaveAttribute("disabled");
    fireEvent.change(receivedByInput, {
      target: { value: "" }
    });
    await wait(() => {
      expect(submitBtn).toHaveAttribute("disabled");
    });
    fireEvent.change(receivedByInput, {
      target: { value: "LCpl Haley, Garrett" }
    });
    await wait(() => {
      expect(submitBtn).not.toHaveAttribute("disabled");
    });
  });

  it("submits COR to api on form submission in table row", async () => {
    const { submitBtn, queryByText } = await renderWithInitialData();
    fetchMock.mockResolvedValue({});
    fireEvent.click(submitBtn);
    await wait(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toEqual("/document/cor");
      expect(fetchMock.mock.calls[1][1]).toMatchObject({
        method: "POST",
        body: JSON.stringify({
          sdn: defaultDoc.sdn,
          status: "COR",
          receivedBy: "Private Casarotto, Stuart"
        })
      });
      expect(queryByText("Private Casarotto, Stuart")).not.toBeInTheDocument();
      expect(queryByText(defaultDoc.sdn)).not.toBeInTheDocument();
    });
  });

  it("leaves row and input in table with original value on api/network error", async () => {
    const {
      queryByText,
      submitBtn,
      receivedByInput
    } = await renderWithInitialData();
    fetchMock.mockRejectedValue(new Error("some error"));
    fireEvent.click(submitBtn);
    await wait(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(queryByText(defaultDoc.sdn)).toBeInTheDocument();
      expect(receivedByInput).toHaveValue("Private Casarotto, Stuart");
    });
  });

  it("leaves row and input in table with original value on api/network error default message", async () => {
    const {
      queryByText,
      submitBtn,
      receivedByInput
    } = await renderWithInitialData();
    const err = new Error("");
    fetchMock.mockRejectedValue(err);
    fireEvent.click(submitBtn);
    await wait(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(queryByText(defaultDoc.sdn)).toBeInTheDocument();
      expect(receivedByInput).toHaveValue("Private Casarotto, Stuart");
    });
  });
});
