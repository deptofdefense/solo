import React from "react";
import { Column } from "react-table";
import { Document } from "solo-types";
import { Button } from "solo-uswds";

type CreateColumns = () => Column<Document>[];

const createColumns: CreateColumns = () => [
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
    Header: "Received By",
    id: "receivedBy",
    accessor: () => "Received By"
  },
  {
    Header: "Submit",
    id: "submit",
    Cell: () => <Button onClick={() => {}}>Submit</Button>
  }
];

export default createColumns;
