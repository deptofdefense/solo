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
import { useDocumentSet } from "hooks";
import createColumns from "./tableColumns";

const filterable = [
  { name: "SDN", value: "sdn" },
  { name: "Nomenclature", value: "nomen" },
  { name: "Commodity", value: "commod" }
];

const StatusPage: React.FC = () => {
  const { docs, updateDocuments, pageCount } = useDocumentSet();
  const tableColumns = useMemo(createColumns, []);

  const renderSubComponent = ({
    original: { shipTo, holder, part, statuses }
  }: Row<Document>) => (
    <>
      <DocumentStepper statuses={statuses} />
      <DocumentDetails
        shipper={holder}
        receiver={shipTo}
        part={part}
        statuses={statuses}
      />
    </>
  );

  const renderPagination = (table: TableInstance<Document>) => (
    <Paginator table={table} />
  );
  const renderFilterControls = ({
    setGlobalFilter
  }: TableInstance<Document>) => (
    <SelectFilterControls options={filterable} onSubmit={setGlobalFilter} />
  );

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
