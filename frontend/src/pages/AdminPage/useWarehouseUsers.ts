import { useState, useCallback, useEffect } from "react";
import {
  PaginatedApiResponse,
  LoadingStatus,
  createFakeUsers,
  WarehouseUser
} from "solo-types";
import { useAuthContext } from "context";

const useWarehouseUsers = () => {
  const { apiCall } = useAuthContext();
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>({
    loading: false
  });
  const [pageCount, setPageCount] = useState<number>(0);
  const [users, setUsers] = useState<WarehouseUser[]>([]);

  const fetchWarehouseUsers = useCallback(async () => {
    setLoadingStatus({
      loading: true,
      error: false
    });
    try {
      const { results, count } = await apiCall<
        PaginatedApiResponse<WarehouseUser[]>
      >("/warehouse/users/", {
        method: "GET"
      });
      setUsers(results);
      setPageCount(Math.ceil(count / 25));
      setLoadingStatus({
        loading: false
      });
    } catch (e) {
      setUsers(createFakeUsers(25));
      setPageCount(9);
      setLoadingStatus({
        loading: false
      });
    }
    // setLoadingStatus({
    //   loading: false,
    //   error: true,
    //   message: e.message || "Something went wrong"
    // })
  }, [setLoadingStatus, setUsers, apiCall]);

  useEffect(() => {
    fetchWarehouseUsers();
    // eslint-disable-next-line
  }, []);

  const modifyWarehouseUser = useCallback(
    (userId: number, data: Partial<WarehouseUser>) => {
      setUsers(
        users.map(user =>
          user.userId === userId
            ? { ...user, ...data, hasModified: true }
            : user
        )
      );
    },
    [setUsers, users]
  );

  const getUserById = useCallback(
    (userId: number) =>
      users.find(user => user.userId === userId) as WarehouseUser,
    [users]
  );

  const updateUserPermissons = useCallback(
    async (userId: number) => {
      modifyWarehouseUser(userId, {
        loading: true,
        error: false
      });
      try {
        const { canD6T, canCOR } = getUserById(userId);
        await apiCall(`/warehouse/users/${userId}/`, {
          method: "PATCH",
          body: JSON.stringify({
            canD6T,
            canCOR
          })
        });
        modifyWarehouseUser(userId, {
          loading: false
        });
      } catch (e) {
        modifyWarehouseUser(userId, {
          loading: false,
          error: true,
          message: e.message || "Something went wrong"
        });
      }
    },
    [apiCall, getUserById, modifyWarehouseUser]
  );

  return {
    loadingStatus,
    modifyWarehouseUser,
    updateUserPermissons,
    pageCount,
    users
  };
};

export default useWarehouseUsers;
