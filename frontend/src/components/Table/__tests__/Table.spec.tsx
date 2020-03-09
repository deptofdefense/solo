import React from "react";
import { Column } from "react-table";
import Table from "../Table";
import { render, fireEvent, wait } from "test-utils";

interface TestDoc {
  value: any;
}

describe("Table component", () => {
  const columns: Column<TestDoc>[] = [
    {
      Header: "expand",
      Cell: ({ row }) => (
        <span data-testid="testexpand" {...row.getToggleRowExpandedProps()}>
          expand
        </span>
      )
    },
    {
      Header: "test column",
      accessor: "value"
    }
  ];

  const data = [{ value: "2" }];
  const onSortMock = jest.fn();
  const onRenderSubMock = jest.fn();

  afterEach(() => {
    onSortMock.mockReset();
    onRenderSubMock.mockReset();
  });

  it("matches snapshot", () => {
    const { asFragment } = render(
      <Table<TestDoc>
        columns={columns}
        data={data}
        initialSortBy={{ id: "value" }}
        onSort={onSortMock}
        renderSubComponent={onRenderSubMock}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls onSort callback on sort toggled", async () => {
    const { getByText } = render(
      <Table<TestDoc>
        columns={columns}
        data={data}
        initialSortBy={{ id: "value" }}
        onSort={onSortMock}
        renderSubComponent={onRenderSubMock}
      />
    );
    await wait(() => {
      expect(onSortMock).toHaveBeenCalled();
    });
    const sortHeader = getByText("test column");
    fireEvent.click(sortHeader);
    await wait(() => {
      expect(onSortMock).toHaveBeenCalledTimes(2);
      expect(onSortMock.mock.calls[1][0]).toMatchObject({
        id: "value"
      });
    });
    fireEvent.click(sortHeader);
    await wait(() => {
      expect(onSortMock).toHaveBeenCalledTimes(3);
      expect(onSortMock.mock.calls[2][0]).toBeUndefined();
    });
  });

  it("calls render subcomponent on click", async () => {
    const { getByTestId } = render(
      <Table<TestDoc>
        columns={columns}
        data={data}
        initialSortBy={{ id: "value" }}
        onSort={onSortMock}
        renderSubComponent={onRenderSubMock}
      />
    );
    const toggleBtn = getByTestId("testexpand");
    fireEvent.click(toggleBtn);
    await wait(() => {
      expect(onRenderSubMock).toHaveBeenCalled();
    });
  });
});
