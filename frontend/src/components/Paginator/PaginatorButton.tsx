import React from "react";
import classNames from "classnames";
import { Button } from "solo-uswds";
import classes from "./Paginator.module.scss";

type BaseButtonProps = Omit<Partial<JSX.IntrinsicElements["button"]>, "color">;

interface PaginatorButtonProps extends BaseButtonProps {
  disabled?: boolean;
  isPageNumber?: boolean;
  active?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const PaginatorButton: React.FC<PaginatorButtonProps> = ({
  disabled = false,
  isPageNumber = false,
  active = false,
  children,
  ...rest
}) => {
  return (
    <Button
      className={classNames(classes.pageLink, {
        [classes.disabled]: disabled
      })}
      unstyled={!isPageNumber || !active}
      outline={isPageNumber && active}
      onClick={!disabled ? onclick : undefined}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default PaginatorButton;
