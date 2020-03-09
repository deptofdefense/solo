import React, { useEffect } from "react";
import {
  useTable,
  useExpanded,
  Row,
  Column,
  useSortBy,
  SortingRule
} from "react-table";
import { Table as USWDSTable, TableData } from "solo-uswds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface TableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  initialSortBy: SortingRule<T>;
  onSort: (sortBy: SortingRule<T>) => void;
  renderSubComponent?: (row: Row<T>) => JSX.Element;
}

function Table<T extends object>({
  columns,
  data,
  initialSortBy,
  onSort,
  renderSubComponent
}: TableProps<T>) {
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
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  <div className="display-flex flex-justify flex-align-center flex-no-wrap text-no-wrap">
                    {column.render("Header")}
                    <FontAwesomeIcon
                      icon={column.isSortedDesc ? faChevronDown : faChevronUp}
                      style={{
                        visibility: column.isSorted ? "visible" : "hidden"
                      }}
                      className="margin-left-05"
                    />
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            const { key, ...rest } = row.getRowProps();
            return (
              <React.Fragment key={key}>
                <tr {...rest}>
                  {row.cells.map(cell => (
                    <TableData {...cell.getCellProps()}>
                      {cell.render("Cell")}
                    </TableData>
                  ))}
                </tr>

                {row.isExpanded && renderSubComponent ? (
                  <tr>
                    <TableData colSpan={visibleColumns.length} details>
                      {renderSubComponent(row)}
                    </TableData>
                  </tr>
                ) : null}
              </React.Fragment>
            );
          })}
        </tbody>
      </USWDSTable>
    </>
  );
}

export default Table;
