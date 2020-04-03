import React from "react";
import { Column } from "react-table";
import { Document } from "solo-types";
import { Checkbox } from "solo-uswds";
import SubmitCORCell from "./SubmitCORCell";

interface CreateOptions {
  onSubmitCOR: (sdn: string, receivedBy: string) => void;
}

type CreateColumns = (opts: CreateOptions) => Column<Document>[];

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
    id: "nsn",
    disableSortBy: true
  },
  {
    Header: "Quantity",
    id: "quantity",
    disableSortBy: true,
    accessor: ({ mostRecentStatusIdx, statuses }) =>
      statuses[mostRecentStatusIdx].received_qty
  },
  {
    Header: "Commodity",
    id: "suppadd__code",
    accessor: "commodityName"
  },
  {
    Header: "Submit COR",
    id: "submitCOR",
    accessor: "receivedBy",
    disableSortBy: true,
    Cell: ({ row: { original } }) => (
      <SubmitCORCell document={original} onSubmitCOR={onSubmitCOR} />
    )
  }
];

export default createColumns;
