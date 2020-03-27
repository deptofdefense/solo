import React from "react";
import ConfirmationOfReceiptPage from "../ConfirmationOfReceiptPage";
import { render, wait, fireEvent } from "test-utils";
import { defaultApiResponse } from "solo-types";

describe("ConfirmationOfReceiptPage Component", () => {
  const fetchMock = jest.fn();
  const defaultDoc = defaultApiResponse.results[0];

  beforeEach(() => {
    fetchMock.mockResolvedValue(defaultApiResponse);
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it("matches snapshot", async () => {
    const { asFragment, queryByText } = render(<ConfirmationOfReceiptPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      // wait for some data to render before snapshot test
      expect(fetchMock).toHaveBeenCalled();
      expect(queryByText(defaultDoc.sdn)).toBeInTheDocument();
      expect(queryByText(defaultDoc.suppadd.desc)).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("adds a filter for a status of d6t on initial load", async () => {
    render(<ConfirmationOfReceiptPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][0]).toEqual(
        "/document/?status=D6T&exclude_status=COR"
      );
      expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: "GET"
      });
    });
  });

  it("adds d6t status filter to any filters submitted by user", async () => {
    const { getByPlaceholderText, container } = render(
      <ConfirmationOfReceiptPage />,
      {
        authContext: {
          apiCall: fetchMock
        }
      }
    );
    const filterInp = getByPlaceholderText("Search");
    const filterSubmit = container.querySelector(
      "button[type='submit']"
    ) as Element;
    fireEvent.change(filterInp, {
      target: { value: "usersdnfilter" }
    });
    await wait(() => {
      expect(filterInp).toHaveValue("usersdnfilter");
    });
    fireEvent.click(filterSubmit);
    await wait(() => {
      // first call was on render
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toEqual(
        "/document/?sdn=usersdnfilter&status=D6T&exclude_status=COR"
      );
    });
  });

  it("adds d6t status filter when paginating due-outs", async () => {
    const { getByText, queryByText } = render(<ConfirmationOfReceiptPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(queryByText(defaultDoc.sdn)).toBeInTheDocument();
    });
    const pageTwo = getByText("2");
    fireEvent.click(pageTwo);
    await wait(() => {
      // first call was on render
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toEqual(
        "/document/?page=2&status=D6T&exclude_status=COR"
      );
    });
  });
});
