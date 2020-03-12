import React, { PropsWithChildren } from "react";
import { TableInstance, Row } from "react-table";
import classes from "./TableBody.module.scss";

interface TableBodyProps<T extends object> extends TableInstance<T> {
  renderSubComponent?: (row: Row<T>) => JSX.Element;
}

const TableBody = <T extends object>({
  rows,
  visibleColumns,
  prepareRow,
  renderSubComponent,
  getTableBodyProps
}: PropsWithChildren<TableBodyProps<T>>) => {
  return (
    <tbody {...getTableBodyProps()}>
      {rows.map(row => {
        prepareRow(row);
        const { key, ...rest } = row.getRowProps();
        return (
          <React.Fragment key={key}>
            <tr {...rest}>
              {row.cells.map(cell => {
                const { key, ...rest } = cell.getCellProps();
                return (
                  <td key={key} {...rest} className={classes.td}>
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>

            {row.isExpanded && renderSubComponent ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className={classes.subComponentTd}
                >
                  {renderSubComponent(row)}
                </td>
              </tr>
            ) : null}
          </React.Fragment>
        );
      })}
    </tbody>
  );
};

export default TableBody;
