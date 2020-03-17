import React, { useMemo } from "react";
import { Title, Table, SdnInputForm } from "components";
import { Button } from "solo-uswds";
import createColumns, { DocumentWithLoadingStatus } from "./tableColumns";
import EnterReceiptStatusIndicator from "./EnterReceiptStatusIndicator";
import useEnterReceiptDocuments from "./useEnterReceiptDocuments";

const EnterReceiptPage: React.FC = () => {
  const { docs, addSdn, submitStatus, submitAll } = useEnterReceiptDocuments();
  const columns = useMemo(createColumns, []);

  return (
    <div className="tablet:margin-x-8 overflow-x-auto">
      <Title>Enter Receipt</Title>
      <Table<DocumentWithLoadingStatus>
        columns={columns}
        data={docs}
        manualPagination={false}
        manualSortBy={false}
      />
      <div className="grid-row flex-align-start flex-justify">
        <SdnInputForm onSubmit={addSdn} disabled={submitStatus.loading} />
        <Button
          onClick={submitAll}
          className="margin-top-2"
          disabled={submitStatus.loading || docs.length < 1}
        >
          Submit All
        </Button>
      </div>
      <EnterReceiptStatusIndicator {...submitStatus} />
    </div>
  );
};

export default EnterReceiptPage;
