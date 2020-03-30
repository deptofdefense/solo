import React from "react";
import { Column } from "react-table";
import { LoadingIcon } from "components";
import { WarehouseUser } from "solo-types";
import { Checkbox, Button } from "solo-uswds";

type CreateColumns = (
  modifyWarehouseUser: (userId: number, data: Partial<WarehouseUser>) => void,
  updateUserPermissons: (userId: number) => void
) => Column<WarehouseUser>[];

const createColumns: CreateColumns = (
  modifyWarehouseUser,
  updateUserPermissons
) => [
  {
    Header: "Loading",
    id: "loading",
    disableSortBy: true,
    Cell: ({
      row: {
        original: { loading, error }
      }
    }) => <LoadingIcon loading={loading} error={error} />
  },
  {
    Header: "AAC",
    accessor: "aac"
  },
  {
    Header: "User",
    accessor: "username"
  },
  {
    Header: "D6T",
    id: "canD6T",
    disableSortBy: true,
    Cell: ({
      row: {
        original: { canD6T, userId }
      }
    }) => {
      return (
        <div className="padding-left-2">
          <Checkbox
            data-testid="has-d6t-checkbox"
            checked={canD6T}
            onChange={e => {
              modifyWarehouseUser(userId, {
                canD6T: e.target.checked
              });
            }}
          />
        </div>
      );
    }
  },
  {
    Header: "COR",
    id: "canCOR",
    disableSortBy: true,
    Cell: ({
      row: {
        original: { userId, canCOR }
      }
    }) => {
      return (
        <div className="padding-left-2">
          <Checkbox
            data-testid="has-cor-checkbox"
            checked={canCOR}
            onChange={e => {
              modifyWarehouseUser(userId, {
                canCOR: e.target.checked
              });
            }}
          />
        </div>
      );
    }
  },
  {
    Header: "Submit Permissions",
    id: "submit",
    disableSortBy: true,
    Cell: ({
      row: {
        original: { userId, hasModified }
      }
    }) => {
      return (
        <div className="padding-left-2">
          <Button
            disabled={!hasModified}
            onClick={() => {
              updateUserPermissons(userId);
            }}
          >
            Submit
          </Button>
        </div>
      );
    }
  }
];

export default createColumns;
