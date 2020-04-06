import React from "react";
import { Alert } from "solo-uswds";

interface DuplicateSdnIndicatorProps {
  isDuplicate: boolean;
}

const DuplicateSdnIndicator: React.FC<DuplicateSdnIndicatorProps> = ({
  isDuplicate
}) => {
  return (
    <div className="margin-bottom-1em overflow-hidden">
      {isDuplicate && (
        <Alert
          status={"error"}
          className="margin-top-1"
          heading={"SDN already exists in table"}
        />
      )}
    </div>
  );
};

export default DuplicateSdnIndicator;
