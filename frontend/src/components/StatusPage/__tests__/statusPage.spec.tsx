import React from "react";
import { render, wait } from "test-utils";
import { defaultDoc } from "../fakeDoc";
import StatusPage from "../StatusPage";
import { fireEvent } from "@testing-library/react";

// jest.mock("../StatusPageDetails", () => () => <div>testdetails</div>);

describe("StatusPage component", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue([defaultDoc]);
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("matches snapshot", async () => {
    const { asFragment } = render(<StatusPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it("requests documents from api on initial render", async () => {
    fetchMock.mockResolvedValue([]);
    render(<StatusPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][0]).toEqual("/documents");
      expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: "GET"
      });
    });
  });

  it("shows document details when toggled", async () => {
    const { getByTitle, queryByText } = render(<StatusPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const toggleBtn = getByTitle("Toggle Row Expanded");
    fireEvent.click(toggleBtn);
    await wait(() => {
      expect(queryByText("placeholder")).toBeInTheDocument();
    });
  });

  it("re-fetches documents on table sort change", async () => {
    const { getByText } = render(<StatusPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const lastUpdatedHeader = getByText(/^Last Updated/);
    fireEvent.click(lastUpdatedHeader);
    await wait(() => {
      // first call was on render, this is second
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toEqual("/documents?sort=status_date");
    });
    fireEvent.click(lastUpdatedHeader);
    await wait(() => {
      // sort by is now desc
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock.mock.calls[2][0]).toEqual(
        "/documents?sort=status_date&desc=true"
      );
    });
    fireEvent.click(lastUpdatedHeader);
    await wait(() => {
      // sort by is undefined
      expect(fetchMock).toHaveBeenCalledTimes(4);
      expect(fetchMock.mock.calls[3][0]).toEqual("/documents");
    });
  });

  it("renders 10 fake documents on fetch error for now", async () => {
    fetchMock.mockRejectedValue(new Error());
    const { getAllByTitle } = render(<StatusPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const allRowToggles = getAllByTitle("Toggle Row Expanded");
    expect(allRowToggles.length).toEqual(10);
  });
});
