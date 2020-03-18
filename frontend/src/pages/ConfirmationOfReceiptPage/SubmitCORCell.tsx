import React, { useState, useEffect } from "react";
import { Row, Cell } from "react-table";
import { DocumentWithReceivedBy } from "./tableColumns";

import { CORInputForm } from "components";

interface ReceivedByInputCellProps {
  onSubmitCOR: (sdn: string, receivedBy: string) => void;
  cell: Cell<DocumentWithReceivedBy>;
  row: Row<DocumentWithReceivedBy>;
}

const ReceivedByInputCell: React.FC<ReceivedByInputCellProps> = ({
  onSubmitCOR,
  row: {
    original: { sdn, submitting, error }
  }
}) => {
  const [receivedBy, setReceivedBy] = useState("");

  const onSubmit = () => {
    onSubmitCOR(sdn, receivedBy);
  };

  useEffect(() => {
    setReceivedBy("");
  }, [sdn]);

  return (
    <CORInputForm
      value={receivedBy}
      onReceivedByChange={setReceivedBy}
      onSubmitCOR={onSubmit}
      error={error}
      loading={submitting}
    />
  );
};

export default ReceivedByInputCell;
