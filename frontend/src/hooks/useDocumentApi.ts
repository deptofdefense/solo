import { useCallback, useState } from "react";
import useAuthContext from "context/AuthContext";
import {
  Document,
  ApiDocument,
  Query,
  PaginatedApiResponse,
  LocatorMap
} from "solo-types";

type DocumentApiResponse = PaginatedApiResponse<ApiDocument[]>;

// covert api returned document to frontend friendly Document
export const parseApiDocuments = (apiDocs: ApiDocument[]): Document[] =>
  apiDocs.map(
    ({
      addresses,
      suppadd: { desc: commodityName, subinventorys },
      service_request,
      statuses,
      ...apiDoc
    }) => {
      const mostRecentStatusIdx = statuses.length - 1;
      const enteredReceivedQty = statuses[mostRecentStatusIdx].projected_qty;
      const locatorsBySubinventory: LocatorMap = subinventorys.reduce(
        (locators, nextInv) => ({
          ...locators,
          [nextInv.code]: nextInv.locators
        }),
        {}
      );
      const flattenedSubinventorys = subinventorys.map(
        ({ locators, ...rest }) => ({ ...rest })
      );
      const enteredSubinventoryCode = flattenedSubinventorys[0].code;
      const enteredLocatorCode =
        locatorsBySubinventory[enteredSubinventoryCode][0].code;
      return {
        ...apiDoc,
        subinventorys: flattenedSubinventorys,
        locatorsBySubinventory,
        statuses,
        serviceRequest: service_request,
        shipper: addresses.find(addy => addy.address_type.type === "Ship-To"),
        receiver: addresses.find(
          addy => addy.address_type.type === "Requester"
        ),
        loadingStatus: {
          loading: false
        },
        commodityName,
        mostRecentStatusIdx,

        enteredReceivedQty,
        enteredReceivedBy: "",
        enteredLocatorCode,
        enteredSubinventoryCode
      };
    }
  );

const useDocumentApi = () => {
  const { apiCall } = useAuthContext();
  const [pageCount, setPageCount] = useState<number>(9);

  const makeQueryString = useCallback((query: Query<Document>) => {
    const {
      sort: [currentSort],
      page,
      filters
    } = query;
    const params = new URLSearchParams();
    if (currentSort?.id) {
      const descPrefix = currentSort?.desc ? "-" : "";
      params.set("sort", `${descPrefix}${currentSort.id}`);
    }
    if (page > 1) {
      params.set("page", page.toString());
    }
    filters.forEach(({ id, value }) => {
      if (id && value) {
        params.set(id, value);
      }
    });
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }, []);

  const fetchDocuments = useCallback<
    (query: Query<Document>) => Promise<Document[]>
  >(
    async query => {
      const url = `/document/${makeQueryString(query)}`;
      const { count, results } = await apiCall<DocumentApiResponse>(url, {
        method: "GET"
      });
      setPageCount(Math.ceil(count / 25));
      return parseApiDocuments(results);
    },
    // we don't need to refresh documents every time a token
    // refreshes and causes apiCall to change
    // eslint-disable-next-line
    [makeQueryString]
  );

  return {
    fetchDocuments,
    pageCount
  };
};

export default useDocumentApi;
