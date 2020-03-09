import React, { PropsWithChildren } from "react";
import { TableBodyProps as RTableBodyProps, Row } from "react-table";
import classes from "./TableBody.module.scss";

interface TableBodyProps<T extends object> extends RTableBodyProps {
  rows: Row<T>[];
  numColumns: number;
  prepareRow: (row: Row<T>) => void;
  renderSubComponent?: (row: Row<T>) => JSX.Element;
}

const TableBody = <T extends object>({
  rows,
  numColumns,
  prepareRow,
  renderSubComponent,
  ...rest
}: PropsWithChildren<TableBodyProps<T>>) => {
  return (
    <tbody {...rest}>
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
                <td colSpan={numColumns} className={classes.subComponentTd}>
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
