import React, { useEffect } from "react";
import {
  useTable,
  useExpanded,
  Row,
  Column,
  useSortBy,
  SortingRule
} from "react-table";
import { Query } from "solo-types";
import { Table as USWDSTable } from "solo-uswds";
import TableHead from "./TableHead";
import TableBody from "./TableBody";

interface TableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  initialSortBy?: SortingRule<T>[];
  fetchData: (query: Query<T>) => void;
  renderSubComponent?: (row: Row<T>) => JSX.Element;
}

const Table = <T extends object>({
  columns,
  data,
  initialSortBy,
  fetchData,
  renderSubComponent
}: TableProps<T>) => {
  const instance = useTable(
    {
      columns,
      data,
      manualSortBy: true,
      manualPagination: true,
      disableMultiSort: true,
      initialState: { sortBy: initialSortBy ?? [], pageSize: 20 },
      autoResetSortBy: false
    },
    useSortBy,
    useExpanded
  );

  const {
    state: { sortBy }
  } = instance;

  useEffect(() => {
    fetchData({
      sort: sortBy
    });
  }, [fetchData, sortBy]);

  return (
    <>
      <USWDSTable {...instance.getTableProps()}>
        <TableHead headerGroups={instance.headerGroups} />
        <TableBody {...instance} renderSubComponent={renderSubComponent} />
      </USWDSTable>
    </>
  );
};

export default Table;
