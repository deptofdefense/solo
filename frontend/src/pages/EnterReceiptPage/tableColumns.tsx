import React from "react";
import { Column } from "react-table";
import { Document } from "solo-types";
import LoadingIcon from "./LoadingIcon";

type CreateColumns = () => Column<Document>[];

const createColumns: CreateColumns = () => [
  {
    Header: "Loading",
    Cell: ({
      row: {
        original: { loadingStatus }
      }
    }) => <LoadingIcon {...loadingStatus} />
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
    accessor: ({ enteredReceivedQty }) => enteredReceivedQty
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
