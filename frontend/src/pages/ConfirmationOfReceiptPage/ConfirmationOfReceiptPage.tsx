import React, { useMemo } from "react";
import { TableInstance } from "react-table";
import { Title, Table, SelectFilterControls, Paginator } from "components";
import { Document } from "solo-types";
import useCORDocuments from "./useCORDocuments";
import createColumns from "./tableColumns";

const filterable = [
  { name: "SDN", value: "sdn" },
  { name: "Nomenclature", value: "nomen" },
  { name: "Commodity", value: "commodity" }
];

const ConfirmationOfReceiptPage: React.FC = () => {
  const { docs, updateDocuments, pageCount, submitCOR } = useCORDocuments();
  const columns = useMemo(
    () =>
      createColumns({
        onSubmitCOR: submitCOR
      }),
    [submitCOR]
  );

  const renderPagination = (table: TableInstance<Document>) => (
    <Paginator table={table} />
  );

  const renderFilterControls = (table: TableInstance<Document>) => {
    const { setGlobalFilter } = table;
    return (
      <SelectFilterControls options={filterable} onSubmit={setGlobalFilter} />
    );
  };

  return (
    <div className="tablet:margin-x-8 overflow-x-auto">
      <Title>Confirmation of Receipt</Title>
      <Table<Document>
        columns={columns}
        data={docs}
        renderFilterControls={renderFilterControls}
        renderPagination={renderPagination}
        pageCount={pageCount}
        fetchData={updateDocuments}
      />
    </div>
  );
};

export default ConfirmationOfReceiptPage;
