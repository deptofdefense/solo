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
    fetchMock.mockResolvedValue(defaultApiResponse);
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
    fetchMock.mockResolvedValue(defaultApiResponse);
    const { submitBtn, queryByText } = await renderWithInitialData();
    fetchMock.mockResolvedValue({});
    fireEvent.click(submitBtn);
    await wait(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toEqual("/document/cor/");
      expect(fetchMock.mock.calls[1][1]).toMatchObject({
        method: "POST",
        body: JSON.stringify({
          sdn: defaultDoc.sdn,
          received_by: "Private Casarotto, Stuart",
          status: "COR"
        })
      });
      expect(queryByText("Private Casarotto, Stuart")).not.toBeInTheDocument();
      expect(queryByText(defaultDoc.sdn)).not.toBeInTheDocument();
    });
  });

  it("leaves row and input in table with original value on api/network error", async () => {
    fetchMock.mockResolvedValue(defaultApiResponse);
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
    fetchMock.mockResolvedValue(defaultApiResponse);
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

  it("can submit bulk CORs successful api call", async () => {
    const docs = Array.from({ length: 3 }).map((_, idx) => ({
      ...defaultDoc,
      sdn: `SDNINDEX-${idx}`
    }));
    fetchMock.mockResolvedValue({
      ...defaultApiResponse,
      results: docs
    });
    const {
      queryByText,
      getByTitle,
      queryAllByTitle,
      getByText,
      getByPlaceholderText
    } = await render(<ConfirmationOfReceiptPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    expect(queryByText("filters")).toBeInTheDocument();
    expect(queryByText("paginator")).toBeInTheDocument();
    await wait(() => {
      expect(queryByText("SDNINDEX-0")).toBeInTheDocument();
    });
    const selectAll = getByTitle("Toggle All Rows Selected");
    const checkboxes = queryAllByTitle("Toggle Row Selected");
    // 5 rows plus select all
    expect(checkboxes.length).toEqual(3);
    fireEvent.click(selectAll);
    await wait(() => {
      expect(queryByText("filters")).not.toBeInTheDocument();
      expect(queryByText("paginator")).not.toBeInTheDocument();
      expect(queryByText("Submit 3 Cors")).toBeInTheDocument();
    });
    const bulkInput = getByPlaceholderText("Rank Lastname, Firstname MI");
    const submitAll = getByText("Submit 3 Cors");
    expect(submitAll).toHaveAttribute("disabled");
    fireEvent.change(bulkInput, {
      target: { value: "person receiving" }
    });
    await wait(() => {
      expect(bulkInput).toHaveValue("person receiving");
      expect(submitAll).not.toHaveAttribute("disabled");
    });
    fetchMock.mockResolvedValue({});
    fireEvent.click(submitAll);
    await wait(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toEqual("/document/cor/bulk/");
      expect(fetchMock.mock.calls[1][1]).toMatchObject({
        method: "POST",
        body: JSON.stringify([
          { sdn: "SDNINDEX-0", received_by: "person receiving", status: "COR" },
          { sdn: "SDNINDEX-1", received_by: "person receiving", status: "COR" },
          { sdn: "SDNINDEX-2", received_by: "person receiving", status: "COR" }
        ])
      });
      // // all rows submitted and removed from table
      expect(queryAllByTitle("Toggle Row Selected").length).toEqual(0);
    });
  });

  it("bulk submit COR network or API error", async () => {
    const docs = Array.from({ length: 3 }).map((_, idx) => ({
      ...defaultDoc,
      sdn: `SDNINDEX-${idx}`
    }));
    fetchMock.mockResolvedValue({
      ...defaultApiResponse,
      results: docs
    });
    const {
      queryByText,
      queryAllByTitle,
      getByText,
      getByPlaceholderText
    } = await render(<ConfirmationOfReceiptPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(queryByText("SDNINDEX-0")).toBeInTheDocument();
    });
    const checkboxes = queryAllByTitle("Toggle Row Selected");
    // 5 rows plus select all
    expect(checkboxes.length).toEqual(3);
    fireEvent.click(checkboxes[0]);
    await wait(() => {
      expect(queryByText("Submit 1 Cors")).toBeInTheDocument();
    });
    const bulkInput = getByPlaceholderText("Rank Lastname, Firstname MI");
    const submitAll = getByText("Submit 1 Cors");
    expect(submitAll).toHaveAttribute("disabled");
    fireEvent.change(bulkInput, {
      target: { value: "person receiving" }
    });
    await wait(() => {
      expect(bulkInput).toHaveValue("person receiving");
      expect(submitAll).not.toHaveAttribute("disabled");
    });
    fetchMock.mockRejectedValue(new Error("some error message"));
    fireEvent.click(submitAll);
    await wait(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][1]).toMatchObject({
        method: "POST",
        body: JSON.stringify([
          { sdn: "SDNINDEX-0", received_by: "person receiving", status: "COR" }
        ])
      });
      // row not removed from table and error is rendered
      expect(queryAllByTitle("Toggle Row Selected").length).toEqual(3);
      expect(queryByText("some error message")).toBeInTheDocument();
    });
    fetchMock.mockRejectedValue(new Error());
    fireEvent.click(submitAll);
    await wait(() => {
      expect(queryByText("Something went wrong")).toBeInTheDocument();
    });
  });
});
