import React from "react";
import { Document } from "solo-types";
import StatusPageDetailData from "./StatusPageDetailData";

interface StatusPageDetailsProps {
  document: Document;
}

const StatusPageDetails: React.FC<StatusPageDetailsProps> = ({ document }) => {
  const { status, part, address } = document;

  return (
    <>
      <StatusPageDetailData address={address} part={part} status={status} />
    </>
  );
};

export default StatusPageDetails;
