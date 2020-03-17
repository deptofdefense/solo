import { useCallback, useState } from "react";
import { Document, Query } from "solo-types";
import { useDocumentApi } from "hooks";

const useDocumentSet = <T extends Partial<Document> = Document>() => {
  const { fetchDocuments, ...rest } = useDocumentApi();
  const [docs, setDocs] = useState<T[]>([]);

  const updateDocuments = useCallback(
    async (query: Query<Document>) => {
      const docs = await fetchDocuments(query);
      setDocs(docs as T[]);
    },
    [fetchDocuments, setDocs]
  );

  const modifyDocument = useCallback(
    (sdn: string, data: Partial<T>) => {
      setDocs(prevDocs =>
        prevDocs.map(doc => (doc.sdn === sdn ? { ...doc, ...data } : doc))
      );
    },
    [setDocs]
  );

  const removeDocument = useCallback(
    (sdn: string) => {
      setDocs(prevDocs => prevDocs.filter(doc => doc.sdn !== sdn));
    },
    [setDocs]
  );

  const addDocument = useCallback((sdn: string, data: Partial<T>) => {
    setDocs(prevDocs => [...prevDocs, ({ sdn, ...data } as unknown) as T]);
    // fetchDetailsForDocument(sdn);
  }, []);

  const clearAllDocuments = useCallback(() => setDocs([]), [setDocs]);

  return {
    docs,
    setDocs,
    updateDocuments,
    modifyDocument,
    removeDocument,
    addDocument,
    clearAllDocuments,
    fetchDocuments,
    ...rest
  };
};

export default useDocumentSet;
