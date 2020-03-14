import React, { useEffect } from "react";
import {
  useTable,
  useExpanded,
  Row,
  Column,
  useSortBy,
  SortingRule,
  usePagination,
  useGlobalFilter,
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
  manualSortBy?: boolean;
  manualPagination?: boolean;
  pageCount?: number;
  fetchData?: (query: Query<T>) => void;
  renderSubComponent?: (row: Row<T>) => JSX.Element;
  renderPagination?: (table: TableInstance<T>) => JSX.Element;
  renderFilterControls?: (table: TableInstance<T>) => JSX.Element;
}

const Table = <T extends object>({
  columns,
  data,
  initialSortBy,
  manualPagination = true,
  manualSortBy = true,
  pageCount = 0,
  fetchData,
  renderSubComponent,
  renderPagination,
  renderFilterControls
}: TableProps<T>) => {
  const stateReducer = (nextState: any, action: any, prevState: any) => {
    if (action.type === "toggleSortBy" || action.type === "setGlobalFilter") {
      return { ...nextState, pageIndex: 0 };
    }
    return nextState;
  };

  const instance = useTable(
    {
      columns,
      data,
      manualGlobalFilter: true,
      disableMultiSort: true,
      manualSortBy,
      manualPagination,
      autoResetSortBy: !manualSortBy,
      pageCount,
      stateReducer,
      initialState: {
        sortBy: initialSortBy ?? [],
        pageSize: 20,
        globalFilter: []
      }
    },
    useGlobalFilter,
    useSortBy,
    useExpanded,
    usePagination
  );

  const {
    state: { sortBy, pageIndex, globalFilter }
  } = instance;

  useEffect(() => {
    fetchData &&
      fetchData({
        sort: sortBy,
        page: pageIndex + 1,
        filters: globalFilter
      });
  }, [fetchData, sortBy, globalFilter, pageIndex]);

  return (
    <>
      {renderFilterControls && renderFilterControls(instance)}
      <USWDSTable {...instance.getTableProps()}>
        <TableHead headerGroups={instance.headerGroups} />
        <TableBody {...instance} renderSubComponent={renderSubComponent} />
      </USWDSTable>
      {renderPagination && renderPagination(instance)}
    </>
  );
};

export default Table;
