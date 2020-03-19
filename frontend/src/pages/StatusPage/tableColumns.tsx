import React from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { Column } from "react-table";
import { Document } from "solo-types";

type CreateColumns = () => Column<Document>[];

const createColumns: CreateColumns = () => [
  {
    Header: "Details",
    Cell: ({ row }) => (
      <span {...row.getToggleRowExpandedProps()}>
        <FontAwesomeIcon icon={row.isExpanded ? faMinus : faPlus} />
      </span>
    )
  },
  {
    Header: "SDN",
    accessor: "sdn"
  },
  {
    Header: "Service Request #",
    accessor: "serviceRequest.service_request",
    id: "service_request"
  },
  {
    Header: "Commodity",
    id: "commodity",
    accessor: "commodityName"
  },
  {
    Header: "Status",
    disableSortBy: true,
    id: "currentStatus",
    accessor: ({ mostRecentStatusIdx, statuses }) =>
      statuses[mostRecentStatusIdx].dic.desc
  },
  {
    Header: "Nomenclature",
    id: "nomen",
    accessor: "part.nomen"
  },
  {
    Header: "Last Updated",
    id: "status_date",
    accessor: ({ mostRecentStatusIdx, statuses }) =>
      `${formatDistanceToNow(
        parseISO(statuses[mostRecentStatusIdx].status_date)
      )} ago`
  }
];

export default createColumns;
