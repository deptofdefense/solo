import React from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Address, Status, Part } from "solo-types";

interface StatusPageDetailDataProps {
  address: Address[];
  status: Status[];
  part: Part[];
}

const StatusPageDetailData: React.FC<StatusPageDetailDataProps> = ({
  address,
  status,
  part
}) => {
  const shipperAddy = address.find(addy => addy.address_type === "2")?.name;
  const receiverAddy = address.find(addy => addy.address_type === "3")?.name;
  const quantity = status[0]?.qty || 0;

  return (
    <div className="grid-row flex-justify flex-align-start padding-5">
      <div className="flex-col">
        <div className="text-bold">DIC</div>
        {status.map(({ status_date, dic: { code } }) => {
          const formattedDate = formatDistanceToNow(parseISO(status_date));
          return (
            <div
              className="grid-row flex-nowrap flex-col flex-align-center"
              key={code}
            >
              <div className="margin-right-2">{code}</div>
              <div>{`${formattedDate} ago`}</div>
            </div>
          );
        })}
      </div>
      {part.length > 0 && (
        <>
          <div className="flex-col">
            <div className="text-bold">NIIN</div>
            <div>{part[0].nsn}</div>
          </div>
          <div className="flex-col">
            <div className="text-bold">Quantity</div>
            <div>{quantity}</div>
          </div>
          <div className="flex-col">
            <div className="text-bold">Unit of Measure</div>
            <div>{part[0].uom}</div>
          </div>
        </>
      )}
      {shipperAddy && (
        <div className="flex-col">
          <div className="text-bold">Shipped From</div>
          <div>{shipperAddy}</div>
        </div>
      )}
      {receiverAddy && (
        <div className="flex-col">
          <div className="text-bold">Shipped To</div>
          <div>{receiverAddy}</div>
        </div>
      )}
    </div>
  );
};

export default StatusPageDetailData;
