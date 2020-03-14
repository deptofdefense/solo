import React, { useMemo } from "react";
import { Title, Table, SdnInputForm } from "components";
import createColumns, { DocumentWithLoadingStatus } from "./tableColumns";
import useEnterReceiptDocuments from "./useEnterReceiptDocuments";

const EnterReceiptPage: React.FC = () => {
  const { docs, addSdn } = useEnterReceiptDocuments();
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
      <SdnInputForm onSubmit={addSdn} />
    </div>
  );
};

export default EnterReceiptPage;
