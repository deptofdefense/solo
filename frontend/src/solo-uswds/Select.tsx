import React from "react";
import classNames from "classnames";
import classes from "./Input.module.scss";

interface InputProps extends Partial<JSX.IntrinsicElements["select"]> {
  defaultMargin?: boolean;
  defaultOutline?: boolean;
}

export const Select: React.FC<InputProps> = ({
  className,
  defaultMargin = false,
  defaultOutline = false,
  children,
  ...rest
}) => (
  <select
    className={classNames("usa-select", className, {
      [classes.noMargin]: !defaultMargin,
      [classes.noOutline]: !defaultOutline
    })}
    {...rest}
  >
    {children}
  </select>
);
