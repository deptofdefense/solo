import { useCallback, useState } from "react";
import { useDocumentApi } from "hooks";
import { useAuthContext } from "context";
import { DocumentWithLoadingStatus } from "./tableColumns";

const validateDocsBeforeSubmit = (
  docs: DocumentWithLoadingStatus[]
): boolean => {
  for (let i = 0; i < docs.length; i++) {
    if (docs[i].loading || docs[i].error) {
      return false;
    }
  }
  return true;
};

interface SubmissionStatus {
  loading: boolean;
  status?: "success" | "error";
  message?: string;
}

const useDocuments = () => {
  const { apiCall } = useAuthContext();
  const { fetchDocuments, ...rest } = useDocumentApi();
  const [submitStatus, setSubmitStatus] = useState<SubmissionStatus>({
    loading: false
  });
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
    fetchDetailsForDocument(sdn);
  };

  const submitAll = useCallback(async () => {
    setSubmitStatus({
      loading: true
    });

    if (!validateDocsBeforeSubmit(docs)) {
      // can't submit documents that are loading or contain errors
      setSubmitStatus({
        loading: false,
        status: "error",
        message: "All documents must be successfully loaded before submitting"
      });
      return;
    }

    // format documents for api call
    const data = docs.map(doc => ({
      sdn: doc.sdn,
      status: "D6T"
    }));

    try {
      // submit documents
      await apiCall<{}>("/documents/d6t", {
        method: "POST",
        body: JSON.stringify(data)
      });
      setDocs([]);
      setSubmitStatus({
        loading: false,
        status: "success",
        message: `Successfully submitted ${data.length} document(s)`
      });
    } catch (e) {
      // api or network error
      setSubmitStatus({
        loading: false,
        status: "error",
        message: e.message || "Something went wrong"
      });
    }
  }, [docs, apiCall]);

  return {
    docs,
    submitStatus,
    addSdn,
    submitAll,
    ...rest
  };
};

export default useDocuments;
