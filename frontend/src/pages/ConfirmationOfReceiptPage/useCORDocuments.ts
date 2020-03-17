import { useCallback } from "react";
import { useDocumentSet } from "hooks";
import { Query, Document } from "solo-types";

const useCORDocuments = () => {
  const { setDocs, updateDocuments, ...rest } = useDocumentSet();

  const updateDocumentsWithD6TStatus = useCallback(
    (query: Query<Document>) =>
      // always filter for documents that are ready for COR
      updateDocuments({
        ...query,
        filters: [
          ...query.filters,
          {
            id: "status",
            value: "D6T"
          }
        ]
      }),
    [updateDocuments]
  );

  return {
    setDocs,
    updateDocuments: updateDocumentsWithD6TStatus,
    ...rest
  };
};

export default useCORDocuments;
