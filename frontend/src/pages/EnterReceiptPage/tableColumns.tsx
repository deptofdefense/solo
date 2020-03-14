import React from "react";
import { Column } from "react-table";
import { Document } from "solo-types";
import LoadingIcon from "./LoadingIcon";

export interface DocumentWithLoadingStatus extends Partial<Document> {
  loading: boolean;
  error: string | null;
}

type CreateColumns = () => Column<DocumentWithLoadingStatus>[];

const createColumns: CreateColumns = () => [
  {
    Header: "Loading",
    Cell: ({
      row: {
        original: { loading, error }
      }
    }) => <LoadingIcon loading={loading} error={error} />
  },
  {
    Header: "SDN",
    accessor: "sdn"
  },
  {
    Header: "NIIN",
    accessor: "part.nsn",
    id: "niin"
  },
  {
    Header: "Nomenclature",
    id: "nomen",
    accessor: "part.nomen"
  },
  {
    Header: "Quantity",
    id: "quantity",
    accessor: ({ statuses = [] }) =>
      statuses[statuses.length - 1]?.projected_qty
  },
  {
    Header: "Commodity",
    id: "commodity",
    accessor: "suppadd.desc"
  },
  {
    Header: "Subinventory",
    id: "subinventory",
    accessor: () => "Subinventory"
  },
  {
    Header: "Locator",
    id: "locator",
    accessor: () => "locator"
  }
];

export default createColumns;
