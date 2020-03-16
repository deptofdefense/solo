import { useCallback, useState } from "react";
import { Document, Query } from "solo-types";
import { useDocumentApi } from "hooks";

const useDocumentSet = () => {
  const { fetchDocuments, ...rest } = useDocumentApi();
  const [docs, setDocs] = useState<Document[]>([]);

  const updateDocuments = useCallback(
    async (query: Query<Document>) => {
      const docs = await fetchDocuments(query);
      setDocs(docs);
    },
    [fetchDocuments, setDocs]
  );

  return {
    docs,
    setDocs,
    updateDocuments,
    ...rest
  };
};

export default useDocumentSet;
