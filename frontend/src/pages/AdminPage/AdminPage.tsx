import React, { useMemo } from "react";
import {
  Title,
  Table
  //  SelectFilterControls
} from "components";
import createColumns from "./tableColumns";
import useWarehouseUsers from "./useWarehouseUsers";
import { WarehouseUser } from "solo-types";

// const filterable = [
//   {name: "AAC", value: "aac"},
//   {name: "User", value: "user"},
// ];

const AdminPage: React.FC = () => {
  const {
    //loadingStatus,
    modifyWarehouseUser,
    updateUserPermissons,
    // pageCount,
    users
  } = useWarehouseUsers();

  const tableColumns = useMemo(
    () => createColumns(modifyWarehouseUser, updateUserPermissons),
    [modifyWarehouseUser, updateUserPermissons]
  );

  // const renderFilterControls = ({
  //   setGlobalFilter
  // }: TableInstance<Document>) => (
  //   <SelectFilterControls options={filterable} onSubmit={setGlobalFilter} />
  // );

  return (
    <div className="tablet:margin-x-8 overflow-x-auto">
      <Title>User Administration</Title>
      <Table<WarehouseUser>
        columns={tableColumns}
        data={users}
        // renderFilterControls={renderFilterControls}
      />
    </div>
  );
};

export default AdminPage;
