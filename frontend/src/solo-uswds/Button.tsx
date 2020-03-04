import React, { useState } from "react";
import classNames from "classnames";

interface ButtonProps {
  focused?: boolean;
  active?: boolean;
  disabled?: boolean;
  outline?: boolean;
  inverse?: boolean;
  big?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  color?: "secondary" | "accent-cool" | "base";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  color,
  focused = false,
  active = false,
  outline = false,
  inverse = false,
  big = false,
  disabled = false,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      className={classNames(className, "usa-button", {
        "usa-button--hover": isHovered,
        "usa-button--active": active,
        "usa-button--outline": outline,
        "usa-button--inverse": inverse,
        "usa-focus": focused,
        "usa-button--secondary": color === "secondary",
        "usa-button--accent-cool": color === "accent-cool",
        "usa-button--base": color === "base",
        "usa-button--big": big
      })}
    >
      {children}
    </button>
  );
};
