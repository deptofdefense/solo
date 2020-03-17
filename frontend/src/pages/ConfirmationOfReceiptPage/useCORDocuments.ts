import { useCallback, useState } from "react";
import { useDocumentSet } from "hooks";
import { Query, Document } from "solo-types";
import { DocumentWithReceivedBy } from "./tableColumns";
import { useAuthContext } from "context";
import { sleep } from "test-utils";

const useCORDocuments = () => {
  const { apiCall } = useAuthContext();
  const [bulkSubmitStatus, setBulkSubmitStatus] = useState<{
    submitting: boolean;
    error?: string;
  }>({
    submitting: false
  });
  const {
    setDocs,
    docs,
    updateDocuments,
    modifyDocument,
    removeDocument,
    ...rest
  } = useDocumentSet<DocumentWithReceivedBy>();

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

  const submitCOR = useCallback(
    async (sdn: string, receivedBy: string) => {
      modifyDocument(sdn, {
        submitting: true
      });
      // simulate up to 1.5 seconds of load time
      await sleep(Math.floor(Math.random() * 1500));
      try {
        // submit single document and remove from current list
        await apiCall("/document/cor", {
          method: "POST",
          body: JSON.stringify({
            sdn,
            receivedBy,
            status: "COR"
          })
        });
        removeDocument(sdn);
      } catch (e) {
        // api or network error
        modifyDocument(sdn, {
          submitting: false,
          error: e.message || "Something went wrong"
        });
      }
    },
    [modifyDocument, removeDocument, apiCall]
  );

  const submitBulkCOR = useCallback(
    async (sdns: string[], receivedBy: string) => {
      setBulkSubmitStatus({
        submitting: true
      });
      // simulate up to 1.5 seconds of load time
      await sleep(Math.floor(Math.random() * 1500));
      try {
        // submit bulk documents and remove from list
        await apiCall("/document/cor/bulk", {
          method: "POST",
          body: JSON.stringify(
            sdns.map(sdn => ({
              sdn,
              receivedBy,
              status: "COR"
            }))
          )
        });
        // filter all submitted sdns
        setDocs(prevDocs =>
          prevDocs.filter(({ sdn }) => sdns.indexOf(sdn) < 0)
        );
        setBulkSubmitStatus({
          submitting: false
        });
      } catch (e) {
        setBulkSubmitStatus({
          submitting: false,
          error: e.message || "Something went wrong"
        });
      }
    },
    [setBulkSubmitStatus, setDocs, apiCall]
  );

  const resetBulkSubmitStatus = useCallback(() => {
    setBulkSubmitStatus({
      submitting: false
    });
  }, [setBulkSubmitStatus]);

  return {
    setDocs,
    docs,
    updateDocuments: updateDocumentsWithD6TStatus,
    submitCOR,
    submitBulkCOR,
    bulkSubmitStatus,
    resetBulkSubmitStatus,
    ...rest
  };
};

export default useCORDocuments;
