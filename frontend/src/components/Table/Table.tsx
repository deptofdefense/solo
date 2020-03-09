import React, { useEffect } from "react";
import {
  useTable,
  useExpanded,
  Row,
  Column,
  useSortBy,
  SortingRule
} from "react-table";
import { Table as USWDSTable } from "solo-uswds";
import TableHead from "./TableHead";
import TableBody from "./TableBody";

interface TableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  initialSortBy: SortingRule<T>;
  onSort: (sortBy: SortingRule<T>) => void;
  renderSubComponent?: (row: Row<T>) => JSX.Element;
}

const Table = <T extends object>({
  columns,
  data,
  initialSortBy,
  onSort,
  renderSubComponent
}: TableProps<T>) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    visibleColumns,
    state: { sortBy }
  } = useTable(
    {
      columns,
      data,
      manualSortBy: true,
      initialState: { sortBy: [initialSortBy] }
    },
    useSortBy,
    useExpanded
  );

  useEffect(() => {
    onSort(sortBy[0]);
  }, [sortBy, onSort]);

  return (
    <>
      <USWDSTable {...getTableProps()}>
        <TableHead headerGroups={headerGroups} />
        <TableBody
          rows={rows}
          renderSubComponent={renderSubComponent}
          prepareRow={prepareRow}
          numColumns={visibleColumns.length}
          {...getTableBodyProps()}
        />
      </USWDSTable>
    </>
  );
};

export default Table;
