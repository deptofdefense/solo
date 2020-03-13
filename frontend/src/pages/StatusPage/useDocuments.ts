import { useCallback, useState } from "react";
import useAuthContext from "context/AuthContext";
import { Document, ApiDocument, Query, PaginatedApiResponse } from "solo-types";
import { createFakeApiDocs } from "solo-types";

type DocumentApiResponse = PaginatedApiResponse<ApiDocument[]>;

// covert api returned document to Document
export const parseApiDocuments = (apiDocs: ApiDocument[]): Document[] =>
  apiDocs.map(apiDoc => ({
    id: apiDoc.id,
    sdn: apiDoc.sdn,
    serviceRequest: apiDoc.service_request,
    part: apiDoc.part,
    statuses: apiDoc.statuses,
    suppadd: {
      ...apiDoc.suppadd
    },
    shipper: apiDoc.addresses.find(
      addy => addy.address_type.type === "Ship-To"
    ),
    receiver: apiDoc.addresses.find(
      addy => addy.address_type.type === "Requester"
    )
  }));

const useDocuments = () => {
  const { apiCall } = useAuthContext();
  const [docs, setDocs] = useState<Document[]>([]);
  const [pageCount, setPageCount] = useState<number>(9);
  const [filter, setFilter] = useState<{ option: string; value: string }>({
    option: "",
    value: ""
  });

  const makeQueryString = useCallback(
    (query: Query<Document>) => {
      const {
        sort: [currentSort],
        page
      } = query;
      const params = new URLSearchParams();
      if (currentSort?.id) {
        params.set("sort", currentSort.id);
      }
      if (currentSort?.desc) {
        params.set("desc", "true");
      }
      if (filter.value) {
        params.set(filter.option, filter.value);
      }
      if (page > 1) {
        params.set("page", page.toString());
      }
      const queryString = params.toString();
      return queryString ? `?${queryString}` : "";
    },
    [filter]
  );

  const fetchDocuments = useCallback(
    async (query: Query<Document>) => {
      try {
        const url = `/documents${makeQueryString(query)}`;
        const { count, results } = await apiCall<DocumentApiResponse>(url, {
          method: "GET"
        });
        setPageCount(Math.ceil(count / 25));
        setDocs(parseApiDocuments(results));
      } catch (e) {
        // use fake data until api is implemented
        setDocs(parseApiDocuments(createFakeApiDocs(25)));
      }
    },
    [setDocs, apiCall, makeQueryString]
  );

  return {
    docs,
    fetchDocuments,
    pageCount,
    setFilter,
    filterOptions: [
      { name: "SDN", value: "sdn" },
      { name: "Nomenclature", value: "nomen" },
      { name: "Commodity", value: "commodity" }
    ]
  };
};

export default useDocuments;
