import React from "react";

interface USWDSTdProps extends Partial<JSX.IntrinsicElements["td"]> {
  details?: boolean;
}

export const TableData: React.FC<USWDSTdProps> = ({
  details = false,
  children,
  ...rest
}) => (
  <td
    {...rest}
    style={{
      backgroundColor: details ? "white" : "#f0f0f0",
      borderColor: "white"
    }}
  >
    {children}
  </td>
);
