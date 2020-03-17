import React from "react";
import { Column } from "react-table";
import { Document } from "solo-types";
import { Checkbox } from "solo-uswds";
import ReceivedByInputCell from "./SubmitCORCell";

export interface DocumentWithReceivedBy extends Document {
  receivedBy?: string;
  submitting?: boolean;
  error?: string | null;
}

interface CreateOptions {
  onSubmitCOR: (sdn: string, receivedBy: string) => void;
}

type CreateColumns = (opts: CreateOptions) => Column<DocumentWithReceivedBy>[];

const createColumns: CreateColumns = ({ onSubmitCOR }) => [
  {
    id: "select",
    disableSortBy: true,
    Header: ({ getToggleAllRowsSelectedProps }) => {
      const {
        checked,
        onChange,
        indeterminate,
        ...rest
      } = getToggleAllRowsSelectedProps();
      return (
        <div className="padding-left-2">
          <Checkbox checked={checked} onChange={onChange} {...rest} />
        </div>
      );
    },
    Cell: ({ row }) => {
      const {
        checked,
        onChange,
        indeterminate,
        ...rest
      } = row.getToggleRowSelectedProps();
      return <Checkbox checked={checked} onChange={onChange} {...rest} />;
    }
  },
  {
    Header: "SDN",
    accessor: "sdn"
  },
  {
    Header: "NIIN",
    accessor: "part.nsn",
    id: "nsn"
  },
  {
    Header: "Quantity",
    id: "quantity",
    accessor: ({ statuses }) => statuses[statuses.length - 1]?.received_qty
  },
  {
    Header: "Commodity",
    id: "commodity",
    accessor: "suppadd.desc"
  },
  {
    Header: "Submit COR",
    id: "submitCOR",
    accessor: "receivedBy",
    disableSortBy: true,
    Cell: ({ ...args }) => (
      <ReceivedByInputCell {...args} onSubmitCOR={onSubmitCOR} />
    )
  }
];

export default createColumns;
