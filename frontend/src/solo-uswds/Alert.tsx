import React from "react";
import classNames from "classnames";

interface AlertProps extends Partial<JSX.IntrinsicElements["div"]> {
  status: "success" | "warning" | "error" | "info";
  heading?: string;
  text?: string;
}

export const Alert: React.FC<AlertProps> = ({
  status,
  heading,
  text,
  className,
  ...rest
}) => (
  <div
    className={classNames("usa-alert", `usa-alert--${status}`, className)}
    {...rest}
  >
    <div className="usa-alert__body">
      {heading && <h3 className="usa-alert__heading">{heading}</h3>}
      {text && <p className="usa-alert__text">{text}</p>}
    </div>
  </div>
);
