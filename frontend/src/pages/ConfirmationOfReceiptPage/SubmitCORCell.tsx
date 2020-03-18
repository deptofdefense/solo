import React, { useState, useEffect } from "react";
import { Document } from "solo-types";
import { CORInputForm } from "components";

interface SubmitCORCellProps {
  onSubmitCOR: (sdn: string, receivedBy: string) => void;
  document: Document;
}

const ReceivedByInputCell: React.FC<SubmitCORCellProps> = ({
  onSubmitCOR,
  document: { sdn, loadingStatus }
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
      {...loadingStatus}
    />
  );
};

export default ReceivedByInputCell;
