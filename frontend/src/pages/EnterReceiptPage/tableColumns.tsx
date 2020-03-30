import React from "react";
import { Column } from "react-table";
import { Document } from "solo-types";
import { LoadingIcon } from "components";
import QuantityInput from "./QuantityInput";
import { SubinventorySelector, LocatorSelector } from "./SubinventorySelector";

type CreateColumns = (
  modifyDocument: (sdn: string, data: Partial<Document>) => void
) => Column<Document>[];

const createColumns: CreateColumns = modifyDocument => [
  {
    Header: "Loading",
    Cell: ({
      row: {
        original: { loadingStatus }
      }
    }) => <LoadingIcon {...loadingStatus} />
  },
  {
    Header: "SDN",
    accessor: "sdn"
  },
  {
    Header: "NIIN",
    accessor: "part.nsn",
    id: "niin"
  },
  {
    Header: "Nomenclature",
    id: "nomen",
    accessor: "part.nomen"
  },
  {
    Header: "Quantity",
    id: "quantity",
    accessor: ({ sdn, enteredReceivedQty }) => (
      <QuantityInput
        enteredQuantity={enteredReceivedQty}
        onQuantitiyChange={value =>
          modifyDocument(sdn, {
            enteredReceivedQty: value
          })
        }
      />
    )
  },
  {
    Header: "Commodity",
    id: "commodity",
    accessor: "commodityName"
  },
  {
    Header: "Subinventory",
    id: "subinventory",
    accessor: ({
      sdn,
      subinventorys,
      enteredSubinventoryCode,
      locatorsBySubinventory
    }) => (
      <>
        {subinventorys && (
          <SubinventorySelector
            subinventorys={subinventorys}
            enteredSubinventoryCode={enteredSubinventoryCode}
            onSelectSubinventory={code => {
              modifyDocument(sdn, {
                enteredSubinventoryCode: code,
                enteredLocatorCode: locatorsBySubinventory[code][0].code
              });
            }}
          />
        )}
      </>
    )
  },
  {
    Header: "Locator",
    id: "locator",
    accessor: ({
      sdn,
      locatorsBySubinventory,
      enteredSubinventoryCode,
      enteredLocatorCode
    }) => (
      <>
        {locatorsBySubinventory && enteredSubinventoryCode && (
          <LocatorSelector
            locators={locatorsBySubinventory[enteredSubinventoryCode]}
            enteredLocatorCode={enteredLocatorCode}
            onSelectLocator={code => {
              modifyDocument(sdn, {
                enteredLocatorCode: code
              });
            }}
          />
        )}
      </>
    )
  }
];

export default createColumns;
