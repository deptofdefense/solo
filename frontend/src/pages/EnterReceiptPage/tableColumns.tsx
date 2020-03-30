import React from "react";
import { Column } from "react-table";
import { Document } from "solo-types";
import { LoadingIcon } from "components";
import { Button } from "solo-uswds";
import QuantityInput from "./QuantityInput";
import { SubinventorySelector, LocatorSelector } from "./SubinventorySelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

type CreateColumns = (
  modifyDocument: (sdn: string, data: Partial<Document>) => void,
  removeDocument: (sdn: string) => void
) => Column<Document>[];

const createColumns: CreateColumns = (modifyDocument, removeDocument) => [
  {
    Header: "",
    id: "removeRow",
    Cell: ({
      row: {
        original: { sdn }
      }
    }) => (
      <Button onClick={() => removeDocument(sdn)} unstyled>
        <FontAwesomeIcon icon={faTimes} />
      </Button>
    )
  },
  {
    Header: <div className="width-full text-center">Loading</div>,
    id: "loadingStatus",
    disableSortBy: true,
    Cell: ({
      row: {
        original: { loadingStatus }
      }
    }) => (
      <div className="text-center">
        <LoadingIcon {...loadingStatus} />
      </div>
    )
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
      <div className="maxw-8">
        <QuantityInput
          enteredQuantity={enteredReceivedQty}
          onQuantitiyChange={value =>
            modifyDocument(sdn, {
              enteredReceivedQty: value
            })
          }
        />
      </div>
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
