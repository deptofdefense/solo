import { useCallback, useState } from "react";
import { useDocumentApi } from "hooks";
import { DocumentWithLoadingStatus } from "./tableColumns";

const useDocuments = () => {
  const { fetchDocuments, ...rest } = useDocumentApi();
  const [docs, setDocs] = useState<DocumentWithLoadingStatus[]>([]);

  const updateDoc = useCallback(
    (sdn: string, data: Partial<DocumentWithLoadingStatus>) => {
      setDocs(prevDocs =>
        prevDocs.map(existingDoc =>
          existingDoc.sdn === sdn ? { ...existingDoc, ...data } : existingDoc
        )
      );
    },
    [setDocs]
  );

  const fetchDetailsForDocument = useCallback(
    async (sdn: string) => {
      try {
        const [doc] = await fetchDocuments({
          filters: [{ id: "sdn", value: sdn }],
          sort: [],
          page: 0
        });
        updateDoc(sdn, {
          ...doc,
          loading: false,
          error: null
        });
      } catch (e) {
        /* istanbul ignore next */
        updateDoc(sdn, {
          loading: false,
          error: e.toString()
        });
      }
    },
    [fetchDocuments, updateDoc]
  );

  const addSdn = (sdn: string) => {
    setDocs(prevDocs => [...prevDocs, { sdn, loading: true, error: null }]);
    setTimeout(() => {
      fetchDetailsForDocument(sdn);
    }, Math.floor(Math.random() * 1000)); // add up to 1 second of load time
  };

  return {
    docs,
    addSdn,
    ...rest
  };
};

export default useDocuments;
