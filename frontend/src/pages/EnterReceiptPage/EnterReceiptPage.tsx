import React, { useMemo, useState } from "react";
import { Title, Table, SdnInputForm } from "components";
import { Document } from "solo-types";
import { Button } from "solo-uswds";
import createColumns from "./tableColumns";
import EnterReceiptStatusIndicator from "./EnterReceiptStatusIndicator";
import useEnterReceiptDocuments from "./useEnterReceiptDocuments";
import DuplicateSdnIndicator from "./DuplicateSdnIndicator";

const EnterReceiptPage: React.FC = () => {
  const {
    docs,
    addSdn,
    submitAllLoadingStatus,
    submitAll,
    modifyDocument,
    removeDocument
  } = useEnterReceiptDocuments();

  const columns = useMemo(() => createColumns(modifyDocument, removeDocument), [
    modifyDocument,
    removeDocument
  ]);

  const [duplicateSdn, setDuplicateSdn] = useState(false);
  const onAddSdn = (sdn: string) => {
    const isDuplicate = docs.some(doc => doc.sdn === sdn);
    if (isDuplicate) {
      setDuplicateSdn(true);
    } else {
      addSdn(sdn);
      setDuplicateSdn(false);
    }
  };

  return (
    <div className="tablet:margin-x-8 overflow-x-auto">
      <Title>Enter Receipt</Title>
      <EnterReceiptStatusIndicator {...submitAllLoadingStatus} />
      <Table<Document>
        columns={columns}
        data={docs}
        manualPagination={false}
        manualSortBy={false}
      />
      <DuplicateSdnIndicator isDuplicate={duplicateSdn} />
      <div className="grid-row flex-align-start flex-justify margin-bottom-1em">
        <SdnInputForm
          onSubmit={onAddSdn}
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
    </div>
  );
};

export default EnterReceiptPage;
