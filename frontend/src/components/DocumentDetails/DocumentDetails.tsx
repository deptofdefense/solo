import React from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Address, Status, Part } from "solo-types";

interface DocumentDetailDataProps {
  statuses: Status[];
  part?: Part;
  shipper?: Address;
  receiver?: Address;
}

const DocumentDetails: React.FC<DocumentDetailDataProps> = ({
  statuses,
  part,
  shipper,
  receiver
}) => {
  return (
    <div className="grid-row flex-justify flex-align-start padding-5">
      <div className="flex-col">
        <div className="text-bold">DIC</div>
        {statuses.map(({ status_date, dic: { code } }) => {
          const formattedDate = formatDistanceToNow(parseISO(status_date));
          return (
            <div
              className="grid-row flex-nowrap flex-col flex-align-center"
              key={code}
            >
              <div className="width-5">{code}</div>
              <div>{`${formattedDate} ago`}</div>
            </div>
          );
        })}
      </div>
      <div className="flex-col">
        <div className="text-bold">Quantity</div>
        {statuses.map(({ id, projected_qty, received_qty }) => (
          <div
            className="grid-row flex-nowrap flex-col flex-align-center"
            key={id}
          >
            {`${received_qty}/${projected_qty}`}
          </div>
        ))}
      </div>
      {part && (
        <>
          <div className="flex-col">
            <div className="text-bold">NIIN</div>
            <div>{part.nsn}</div>
          </div>
          <div className="flex-col">
            <div className="text-bold">Unit of Measure</div>
            <div>{part.uom}</div>
          </div>
        </>
      )}
      <div className="flex-col">
        <div className="text-bold">Shipped From</div>
        <div>{shipper?.name || ""}</div>
      </div>
      <div className="flex-col">
        <div className="text-bold">Shipped To</div>
        <div>{receiver?.name || ""}</div>
      </div>
    </div>
  );
};

export default DocumentDetails;
