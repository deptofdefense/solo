import React, { useMemo } from "react";
import { Row } from "react-table";
import { Document } from "solo-types";
import { Table, DocumentDetails, DocumentStepper } from "components";
import useDocuments from "./useDocuments";
import createColumns from "./tableColumns";

const StatusPage: React.FC = () => {
  const { sort, onSort, docs } = useDocuments();
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

  return (
    <div className="tablet:margin-x-8 overflow-x-auto">
      <Table<Document>
        columns={tableColumns}
        data={docs}
        renderSubComponent={renderSubComponent}
        onSort={onSort}
        initialSortBy={sort}
      />
    </div>
  );
};

export default StatusPage;
