import React from "react";
import { Alert } from "solo-uswds";

interface IndicatorProps {
  loading: boolean;
  status?: "error" | "success";
  message?: string;
}

const EnterReceiptStatusIndicator: React.FC<IndicatorProps> = ({
  loading,
  status,
  message
}) => (
  <div className="grid-row flex-justify-center flex-12 tablet:flex-4">
    {!loading && status && (
      <Alert status={status} className="margin-top-4" heading={message ?? ""} />
    )}
  </div>
);

export default EnterReceiptStatusIndicator;
