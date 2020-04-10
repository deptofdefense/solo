import React from "react";
import classNames from "classnames";
import classes from "./Table.module.scss";

interface USWDSTableProps extends Partial<JSX.IntrinsicElements["table"]> {
  borderless?: boolean;
}

export const Table: React.FC<USWDSTableProps> = ({
  children,
  borderless = true,
  ...rest
}) => (
  <table
    className={classNames(
      "usa-table",
      "grid-col-12",
      {
        "usa-table--borderless": borderless
      },
      classes.tableBorders
    )}
    {...rest}
  >
    {children}
  </table>
);
