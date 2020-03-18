import React from "react";
import { Alert } from "solo-uswds";
import { LoadingStatus } from "solo-types";

const EnterReceiptStatusIndicator: React.FC<LoadingStatus> = ({
  loading,
  error = false,
  message = ""
}) => (
  <div className="grid-row flex-justify-center flex-12 tablet:flex-10">
    {!loading && message && (
      <Alert
        status={error ? "error" : "success"}
        className="margin-top-4"
        heading={message}
      />
    )}
  </div>
);

export default EnterReceiptStatusIndicator;
