import React, { useMemo } from "react";
import { Title, Table } from "components";
import createColumns from "./tableColumns";
import useWarehouseUsers from "./useWarehouseUsers";
import { WarehouseUser } from "solo-types";

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

  return (
    <div className="tablet:margin-x-8 overflow-x-auto">
      <Title>User Administration</Title>
      <Table<WarehouseUser> columns={tableColumns} data={users} />
    </div>
  );
};

export default AdminPage;
