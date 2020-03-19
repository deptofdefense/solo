import React from "react";
import { Alert } from "@trussworks/react-uswds";
import { LoadingStatus } from "solo-types";

const EnterReceiptStatusIndicator: React.FC<LoadingStatus> = ({
  loading,
  error = false,
  message = ""
}) => (
  <div className="grid-row flex-justify-center flex-12 margin-top-4 tablet:flex-10">
    {!loading && message && (
      <Alert type={error ? "error" : "success"} heading={message} />
    )}
  </div>
);

export default EnterReceiptStatusIndicator;
