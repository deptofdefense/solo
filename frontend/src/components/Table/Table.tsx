import React, { useEffect } from "react";
import {
  useTable,
  useExpanded,
  Row,
  Column,
  useSortBy,
  SortingRule,
  usePagination,
  TableInstance
} from "react-table";
import { Query } from "solo-types";
import { Table as USWDSTable } from "solo-uswds";
import TableHead from "./TableHead";
import TableBody from "./TableBody";

interface TableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  initialSortBy?: SortingRule<T>[];
  pageCount?: number;
  fetchData: (query: Query<T>) => void;
  renderSubComponent?: (row: Row<T>) => JSX.Element;
  renderPagination?: (table: TableInstance<T>) => JSX.Element;
}

const Table = <T extends object>({
  columns,
  data,
  initialSortBy,
  pageCount = 0,
  fetchData,
  renderSubComponent,
  renderPagination
}: TableProps<T>) => {
  const stateReducer = (nextState: any, action: any, prevState: any) => {
    if (action.type === "toggleSortBy") {
      return { ...nextState, pageIndex: 0 };
    }
    return nextState;
  };

  const instance = useTable(
    {
      columns,
      data,
      manualSortBy: true,
      manualPagination: true,
      disableMultiSort: true,
      initialState: { sortBy: initialSortBy ?? [], pageSize: 25 },
      autoResetSortBy: false,
      pageCount,
      stateReducer
    },
    useSortBy,
    useExpanded,
    usePagination
  );

  const {
    state: { sortBy, pageIndex }
  } = instance;

  useEffect(() => {
    fetchData({
      sort: sortBy,
      page: pageIndex + 1
    });
  }, [fetchData, sortBy, pageIndex]);

  return (
    <>
      <USWDSTable {...instance.getTableProps()}>
        <TableHead headerGroups={instance.headerGroups} />
        <TableBody {...instance} renderSubComponent={renderSubComponent} />
      </USWDSTable>
      {renderPagination && renderPagination(instance)}
    </>
  );
};

export default Table;
