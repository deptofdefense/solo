import React, { useMemo } from "react";
import { Row, TableInstance } from "react-table";
import { Document } from "solo-types";
import {
  Table,
  DocumentDetails,
  DocumentStepper,
  Title,
  SelectFilterControls,
  Paginator
} from "components";
import useDocuments from "./useDocuments";
import createColumns from "./tableColumns";

const StatusPage: React.FC = () => {
  const {
    docs,
    fetchDocuments,
    setFilter,
    filterOptions,
    pageCount
  } = useDocuments();
  const tableColumns = useMemo(createColumns, []);

  const renderSubComponent = (row: Row<Document>) => {
    const {
      original: { shipper, receiver, part, statuses }
    } = row;
    return (
      <>
        <DocumentStepper statuses={statuses} />
        <DocumentDetails
          shipper={shipper}
          receiver={receiver}
          part={part}
          statuses={statuses}
        />
      </>
    );
  };

  const renderPagination = (table: TableInstance<Document>) => (
    <Paginator table={table} />
  );

  return (
    <div className="tablet:margin-x-8 overflow-x-auto">
      <Title>Status</Title>
      <SelectFilterControls options={filterOptions} onSubmit={setFilter} />
      <Table<Document>
        columns={tableColumns}
        data={docs}
        renderSubComponent={renderSubComponent}
        renderPagination={renderPagination}
        fetchData={fetchDocuments}
        pageCount={pageCount}
      />
    </div>
  );
};

export default StatusPage;
