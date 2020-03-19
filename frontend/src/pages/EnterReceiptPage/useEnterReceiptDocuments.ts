import { useCallback, useState } from "react";
import { useDocumentSet } from "hooks";
import { useAuthContext } from "context";
import { Document, LoadingStatus } from "solo-types";

const validateDocsBeforeSubmit = (docs: Document[]): boolean => {
  for (let i = 0; i < docs.length; i++) {
    const { error, loading } = docs[i].loadingStatus;
    if (loading || error) {
      return false;
    }
  }
  return true;
};

const useDocuments = () => {
  const { apiCall } = useAuthContext();
  const [submitAllLoadingStatus, setSubmitAllLoadingStatus] = useState<
    LoadingStatus
  >({
    loading: false
  });
  const {
    addDocument,
    modifyDocument,
    fetchDocuments,
    clearAllDocuments,
    docs,
    ...rest
  } = useDocumentSet();

  const fetchDetailsForDocument = useCallback(
    async (sdn: string) => {
      try {
        const [doc] = await fetchDocuments({
          filters: [{ id: "sdn", value: sdn }],
          sort: [],
          page: 0
        });
        modifyDocument(sdn, {
          ...doc,
          loadingStatus: {
            loading: false
          }
        });
      } catch (e) {
        /* istanbul ignore next */
        modifyDocument(sdn, {
          loadingStatus: {
            loading: false,
            error: e.message || "Something went wrong"
          }
        });
      }
    },
    [fetchDocuments, modifyDocument]
  );

  const addSdn = (sdn: string) => {
    addDocument(sdn, {
      loadingStatus: {
        loading: true
      }
    });
    fetchDetailsForDocument(sdn);
  };

  const submitAll = useCallback(async () => {
    setSubmitAllLoadingStatus({
      loading: true
    });

    if (!validateDocsBeforeSubmit(docs)) {
      // can't submit documents that are loading or contain errors
      setSubmitAllLoadingStatus({
        loading: false,
        error: true,
        message: "All documents must be successfully loaded before submitting"
      });
      return;
    }

    // format documents for api call
    const data = docs.map(doc => ({
      sdn: doc.sdn,
      status: "D6T",
      quantity: doc.enteredReceivedQty,
      subinventory: doc.enteredSubinventoryCode,
      locator: doc.enteredLocatorCode
    }));

    try {
      // submit documents
      await apiCall<{}>("/documents/d6t", {
        method: "POST",
        body: JSON.stringify(data)
      });
      clearAllDocuments();
      setSubmitAllLoadingStatus({
        loading: false,
        error: false,
        message: `Successfully submitted ${data.length} document(s)`
      });
    } catch (e) {
      // api or network error
      setSubmitAllLoadingStatus({
        loading: false,
        error: true,
        message: e.message || "Something went wrong"
      });
    }
  }, [docs, apiCall, clearAllDocuments]);

  return {
    docs,
    submitAllLoadingStatus,
    addSdn,
    modifyDocument,
    submitAll,
    ...rest
  };
};

export default useDocuments;
