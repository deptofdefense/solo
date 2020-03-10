import React, { useMemo, useCallback, useEffect, useState } from "react";
import { Column, Row, SortingRule } from "react-table";
import { formatDistanceToNow, parseISO } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { Document } from "solo-types";
import { Table } from "components";
import useAuthContext from "context/AuthContext";
import createFakeDocs from "./fakeDoc";
import StatusPageDetails from "./StatusPageDetails";

const StatusPage: React.FC = () => {
  const { apiCall } = useAuthContext();
  const [docs, setDocs] = useState<Document[]>([]);
  const [sortBy, setSortBy] = useState<SortingRule<Document>[]>([]);

  const fetchDocuments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      const sort = sortBy[0];
      if (sort?.id) {
        params.set("sort", sort?.id);
      }
      if (sort?.desc) {
        params.set("desc", "true");
      }
      const query = params.toString();
      const queryString = query ? `?${query}` : "";
      const url = `/documents${queryString}`;
      setDocs(
        await apiCall<Document[]>(url, {
          method: "GET"
        })
      );
    } catch (e) {
      // use fake data until api is implemented
      setDocs(createFakeDocs(10));
    }
  }, [setDocs, sortBy, apiCall]);

  useEffect(() => {
    fetchDocuments();
  }, [setSortBy, sortBy, fetchDocuments]);

  const columns: Column<Document>[] = useMemo(
    () => [
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
        accessor: "service_request"
      },
      {
        Header: "Commodity",
        id: "commodity",
        accessor: () => "Motor T"
      },
      {
        Header: "Status",
        disableSortBy: true,
        accessor: "status[0].dic[0].desc"
      },
      {
        Header: "Nomenclature",
        id: "nomen",
        accessor: "part[0].nomen"
      },
      {
        Header: "Last Updated",
        id: "status_date",
        accessor: ({ status }) =>
          `${formatDistanceToNow(parseISO(status[0].status_date))} ago`
      }
    ],
    []
  );

  return (
    <div className="tablet:margin-x-8 overflow-x-auto">
      <Table<Document>
        columns={columns}
        data={docs}
        renderSubComponent={(row: Row<Document>) => (
          <StatusPageDetails document={row.original} />
        )}
        onSort={setSortBy}
        initialSortBy={sortBy}
      />
    </div>
  );
};

export default StatusPage;
