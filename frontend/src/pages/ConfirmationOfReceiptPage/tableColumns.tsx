import React from "react";
import { Column } from "react-table";
import { Document } from "solo-types";
import ReceivedByInputCell from "./ReceivedByInput";

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
    id: "receivedBy",
    accessor: "receivedBy",
    Cell: ({ ...args }) => (
      <ReceivedByInputCell {...args} onSubmitCOR={onSubmitCOR} />
    )
  }
];

export default createColumns;
