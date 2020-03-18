import React from "react";
import classNames from "classnames";
import classes from "./Input.module.scss";

interface InputProps extends Partial<JSX.IntrinsicElements["input"]> {
  defaultMargin?: boolean;
  defaultOutline?: boolean;
}

export const Input: React.FC<InputProps> = ({
  className,
  defaultMargin = false,
  defaultOutline = false,
  ...rest
}) => (
  <input
    className={classNames("usa-input", className, {
      [classes.noMargin]: !defaultMargin,
      [classes.noOutline]: !defaultOutline
    })}
    {...rest}
  />
);
