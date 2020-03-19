import React, { useMemo } from "react";
import { Title, Table, SdnInputForm } from "components";
import { Document } from "solo-types";
import { Button } from "solo-uswds";
import createColumns from "./tableColumns";
import EnterReceiptStatusIndicator from "./EnterReceiptStatusIndicator";
import useEnterReceiptDocuments from "./useEnterReceiptDocuments";

const EnterReceiptPage: React.FC = () => {
  const {
    docs,
    addSdn,
    submitAllLoadingStatus,
    submitAll,
    modifyDocument
  } = useEnterReceiptDocuments();
  const columns = useMemo(() => createColumns(modifyDocument), [
    modifyDocument
  ]);

  return (
    <div className="tablet:margin-x-8 overflow-x-auto">
      <Title>Enter Receipt</Title>
      <Table<Document>
        columns={columns}
        data={docs}
        manualPagination={false}
        manualSortBy={false}
      />
      <div className="grid-row flex-align-start flex-justify">
        <SdnInputForm
          onSubmit={addSdn}
          disabled={submitAllLoadingStatus.loading}
        />
        <Button
          onClick={submitAll}
          className="margin-top-1"
          disabled={submitAllLoadingStatus.loading || docs.length < 1}
        >
          Submit All
        </Button>
      </div>
      <EnterReceiptStatusIndicator {...submitAllLoadingStatus} />
    </div>
  );
};

export default EnterReceiptPage;
