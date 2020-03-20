import React from "react";
import { render, wait } from "test-utils";
import { defaultApiResponse } from "solo-types";
import StatusPage from "../StatusPage";
import { fireEvent } from "@testing-library/react";

jest.mock("components/DocumentDetails", () => () => <div>testdetails</div>);
jest.mock("components/SelectFilterControls", () => () => (
  <div>filtercontrols</div>
));

afterAll(() => {
  jest.restoreAllMocks();
});

describe("StatusPage pagination control", () => {
  const fetchMock = jest.fn();

  afterEach(() => {
    fetchMock.mockReset();
  });

  it("calls api on navigate next page", async () => {
    fetchMock.mockResolvedValue(defaultApiResponse);
    const { getByText } = render(<StatusPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const nextPageBtn = getByText("Next");
    fireEvent.click(nextPageBtn);
    await wait(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toEqual(
        "/document/?page=2" // 1 is second page
      );
    });
  });

  it("calls api based on navigate last page", async () => {
    fetchMock.mockResolvedValue({
      ...defaultApiResponse,
      count: 126 // 6 pages
    });
    const { getByText } = render(<StatusPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const nextPageBtn = getByText("Last");
    fireEvent.click(nextPageBtn);
    await wait(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toEqual(
        "/document/?page=6" // 5 is 0-indexed last page
      );
    });
  });
});
