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
      ),
      id: "expand"
    },
    {
      Header: "test column",
      accessor: "value"
    }
  ];

  const data = [{ value: "2" }];
  const onRenderSubMock = jest.fn();
  const fetchDataMock = jest.fn();

  afterEach(() => {
    onRenderSubMock.mockReset();
    fetchDataMock.mockReset();
  });

  it("matches snapshot", () => {
    const { asFragment } = render(
      <Table<TestDoc>
        columns={columns}
        data={data}
        renderSubComponent={onRenderSubMock}
        fetchData={fetchDataMock}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("honors the initial sort by prop", async () => {
    render(
      <Table<TestDoc>
        columns={columns}
        data={data}
        renderSubComponent={onRenderSubMock}
        fetchData={fetchDataMock}
        initialSortBy={[{ id: "value", desc: true }]}
      />
    );
    await wait(() => {
      expect(fetchDataMock).toHaveBeenCalled();
      expect(fetchDataMock.mock.calls[0][0]).toMatchObject({
        sort: [{ id: "value", desc: true }]
      });
    });
  });

  it("calls re-fetches data on sort toggled", async () => {
    const { getByText } = render(
      <Table<TestDoc>
        columns={columns}
        data={data}
        renderSubComponent={onRenderSubMock}
        fetchData={fetchDataMock}
      />
    );
    await wait(() => {
      expect(fetchDataMock).toHaveBeenCalledTimes(1);
    });
    const sortHeader = getByText("test column");
    fireEvent.click(sortHeader);
    await wait(() => {
      expect(fetchDataMock).toHaveBeenCalledTimes(2);
      expect(fetchDataMock.mock.calls[1][0]).toMatchObject({
        sort: [{ id: "value" }]
      });
    });
    fireEvent.click(sortHeader);
    await wait(() => {
      expect(fetchDataMock).toHaveBeenCalledTimes(3);
      expect(fetchDataMock.mock.calls[2][0]).toMatchObject({
        sort: [{ id: "value", desc: true }]
      });
    });
  });

  it("calls render subcomponent on click", async () => {
    const { getByTestId } = render(
      <Table<TestDoc>
        columns={columns}
        data={data}
        renderSubComponent={onRenderSubMock}
        fetchData={fetchDataMock}
      />
    );
    const toggleBtn = getByTestId("testexpand");
    fireEvent.click(toggleBtn);
    await wait(() => {
      expect(onRenderSubMock).toHaveBeenCalled();
    });
  });
});
