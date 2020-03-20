import React, { useMemo, useState, useCallback } from "react";
import { TableInstance } from "react-table";
import {
  Title,
  Table,
  SelectFilterControls,
  Paginator,
  CORInputForm
} from "components";
import { Document } from "solo-types";
import useCORDocuments from "./useCORDocuments";
import createColumns from "./tableColumns";

const filterable = [
  { name: "SDN", value: "sdn" },
  { name: "Nomenclature", value: "nomen" },
  { name: "Commodity", value: "commod" }
];

const ConfirmationOfReceiptPage: React.FC = () => {
  const [bulkReceivedBy, setBulkReceivedBy] = useState("");
  const {
    docs,
    updateDocuments,
    pageCount,
    submitCOR,
    submitBulkCOR,
    bulkSubmitStatus,
    resetBulkSubmitStatus
  } = useCORDocuments();
  const columns = useMemo(
    () =>
      createColumns({
        onSubmitCOR: submitCOR
      }),
    [submitCOR]
  );

  const onSelectedRowsChange = useCallback(
    ({ toggleHideColumn, selectedFlatRows }: TableInstance<Document>) => {
      // show individual row submit forms only when no rows are selected
      resetBulkSubmitStatus();
      toggleHideColumn("submitCOR", selectedFlatRows.length > 0);
    },
    [resetBulkSubmitStatus]
  );

  const renderPagination = (table: TableInstance<Document>) => (
    <>{table.selectedFlatRows.length === 0 && <Paginator table={table} />}</>
  );

  const renderFilterControls = (table: TableInstance<Document>) => {
    const { setGlobalFilter, selectedFlatRows } = table;
    return selectedFlatRows.length > 0 ? (
      <CORInputForm
        value={bulkReceivedBy}
        onReceivedByChange={setBulkReceivedBy}
        onSubmitCOR={() =>
          submitBulkCOR(
            selectedFlatRows.map(({ original }) => original.sdn),
            bulkReceivedBy
          )
        }
        actionText={`Submit ${selectedFlatRows.length} Cors`}
        className="margin-left-2 padding-y-2 flex-justify-center"
        {...bulkSubmitStatus}
      />
    ) : (
      <SelectFilterControls options={filterable} onSubmit={setGlobalFilter} />
    );
  };

  return (
    <div className="tablet:margin-x-8 overflow-x-auto">
      <Title>Confirmation of Receipt</Title>
      <Table<Document>
        columns={columns}
        data={docs}
        onSelectedRowsChange={onSelectedRowsChange}
        renderFilterControls={renderFilterControls}
        renderPagination={renderPagination}
        pageCount={pageCount}
        fetchData={updateDocuments}
      />
    </div>
  );
};

export default ConfirmationOfReceiptPage;
