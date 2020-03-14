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

const filterAble = [
  { name: "SDN", value: "sdn" },
  { name: "Nomenclature", value: "nomen" },
  { name: "Commodity", value: "commodity" }
];

const StatusPage: React.FC = () => {
  const { docs, updateDocuments, pageCount } = useDocuments();
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
  const renderFilterControls = (table: TableInstance<Document>) => {
    const { setGlobalFilter } = table;
    return (
      <SelectFilterControls options={filterAble} onSubmit={setGlobalFilter} />
    );
  };

  return (
    <div className="tablet:margin-x-8 overflow-x-auto">
      <Title>Status</Title>
      <Table<Document>
        columns={tableColumns}
        data={docs}
        renderSubComponent={renderSubComponent}
        renderPagination={renderPagination}
        renderFilterControls={renderFilterControls}
        fetchData={updateDocuments}
        pageCount={pageCount}
      />
    </div>
  );
};

export default StatusPage;
