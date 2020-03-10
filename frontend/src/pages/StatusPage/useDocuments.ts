import { useCallback, useEffect, useState } from "react";
import { SortingRule } from "react-table";
import useAuthContext from "context/AuthContext";
import { Document, ApiDocument } from "solo-types";
import { createFakeApiDocs } from "solo-types";

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
    reciever: apiDoc.addresses.find(
      addy => addy.address_type.type === "Requester"
    )
  }));

const useDocuments = () => {
  const { apiCall } = useAuthContext();
  const [docs, setDocs] = useState<Document[]>([]);
  const [sortBy, setSortBy] = useState<SortingRule<Document>[]>([]);

  const makeQueryString = useCallback(() => {
    const params = new URLSearchParams();
    const currentSort = sortBy[0];
    if (currentSort?.id) {
      params.set("sort", currentSort.id);
    }
    if (currentSort?.desc) {
      params.set("desc", "true");
    }
    const query = params.toString();
    return query ? `?${query}` : "";
  }, [sortBy]);

  const fetchDocuments = useCallback(async () => {
    try {
      const query = makeQueryString();
      const url = `/documents${query}`;
      const docs = await apiCall<ApiDocument[]>(url, {
        method: "GET"
      });
      setDocs(parseApiDocuments(docs));
    } catch (e) {
      // use fake data until api is implemented
      setDocs(parseApiDocuments(createFakeApiDocs(10)));
    }
  }, [setDocs, apiCall, makeQueryString]);

  useEffect(() => {
    fetchDocuments();
  }, [setSortBy, sortBy, fetchDocuments]);

  return {
    docs,
    onSort: setSortBy,
    sort: sortBy
  };
};

export default useDocuments;
