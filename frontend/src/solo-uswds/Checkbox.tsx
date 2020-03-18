import React from "react";
import classNames from "classnames";
import classes from "./Checkbox.module.scss";

interface CheckboxProps extends Partial<JSX.IntrinsicElements["input"]> {
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  className,
  ...rest
}) => (
  <input
    className={classNames("usa-checkbox__input", classes.inp, className)}
    onChange={onChange}
    type="checkbox"
    checked={checked}
    {...rest}
  />
);
