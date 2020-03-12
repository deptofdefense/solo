import React from "react";
import { render, fireEvent } from "test-utils";
import Paginator from "../Paginator";
import { TableInstance } from "react-table";
import { wait } from "@testing-library/react";

describe("Paginator component", () => {
  const nextPageMock = jest.fn();
  const prevPageMock = jest.fn();
  const gotoPageMock = jest.fn();
  const defaultTableInstance = ({
    canPreviousPage: true,
    canNextPage: true,
    previousPage: prevPageMock,
    nextPage: nextPageMock,
    gotoPage: gotoPageMock,
    pageCount: 100,
    state: { pageIndex: 10 }
  } as unknown) as TableInstance;

  afterEach(() => {
    nextPageMock.mockReset();
    prevPageMock.mockReset();
    gotoPageMock.mockReset();
  });

  it("matches snapshot", () => {
    const { asFragment } = render(<Paginator table={defaultTableInstance} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("goes to first page on first link click", async () => {
    const { getByText } = render(<Paginator table={defaultTableInstance} />);
    const firstPage = getByText("First");
    fireEvent.click(firstPage);
    await wait(() => {
      expect(gotoPageMock).toHaveBeenCalled();
      expect(gotoPageMock.mock.calls[0][0]).toEqual(0);
    });
  });

  it("goes to previous page on previous page click", async () => {
    const { getByText } = render(<Paginator table={defaultTableInstance} />);
    const firstPage = getByText("Previous");
    fireEvent.click(firstPage);
    await wait(() => {
      expect(prevPageMock).toHaveBeenCalled();
    });
  });

  it("goes to next page on next page click", async () => {
    const { getByText } = render(<Paginator table={defaultTableInstance} />);
    const nextPage = getByText("Next");
    fireEvent.click(nextPage);
    await wait(() => {
      expect(nextPageMock).toHaveBeenCalled();
    });
  });

  it("goes to last page on last page click", async () => {
    const { getByText } = render(<Paginator table={defaultTableInstance} />);
    const specificPage = getByText("12");
    fireEvent.click(specificPage);
    await wait(() => {
      expect(gotoPageMock).toHaveBeenCalled();
      expect(gotoPageMock.mock.calls[0][0]).toEqual(11);
    });
  });

  it("goes to the specified page on page link click", async () => {
    const { getByText } = render(<Paginator table={defaultTableInstance} />);
    const lastPage = getByText("Last");
    fireEvent.click(lastPage);
    await wait(() => {
      expect(gotoPageMock).toHaveBeenCalled();
      expect(gotoPageMock.mock.calls[0][0]).toEqual(99);
    });
  });

  it("renders the beginning links properly", async () => {
    const { queryByText } = render(
      <Paginator
        table={{
          ...defaultTableInstance,
          state: {
            ...defaultTableInstance.state,
            pageIndex: 1 // this is page `2` when 1-indexed
          }
        }}
      />
    );
    [1, 2, 3, 4].forEach(num => {
      expect(queryByText(num.toString())).toBeInTheDocument();
    });
    [0, 5].forEach(num => {
      expect(queryByText(num.toString())).not.toBeInTheDocument();
    });
  });

  it("renders the ending links properly", async () => {
    const { queryByText } = render(
      <Paginator
        table={{
          ...defaultTableInstance,
          state: {
            ...defaultTableInstance.state,
            pageIndex: 98 // this is page `99` 1-indexed
          }
        }}
      />
    );
    [97, 98, 99, 100].forEach(num => {
      expect(queryByText(num.toString())).toBeInTheDocument();
    });
    [96, 101].forEach(num => {
      expect(queryByText(num.toString())).not.toBeInTheDocument();
    });
  });

  it("renders the middle links properly", async () => {
    const { queryByText } = render(
      <Paginator
        table={{
          ...defaultTableInstance,
          state: {
            ...defaultTableInstance.state,
            pageIndex: 41 // this is page `42` 1-indexed
          }
        }}
      />
    );
    [40, 41, 42, 43, 44].forEach(num => {
      expect(queryByText(num.toString())).toBeInTheDocument();
    });
    [39, 45].forEach(num => {
      expect(queryByText(num.toString())).not.toBeInTheDocument();
    });
  });
});
