import { useCallback } from "react";
import { useDocumentSet } from "hooks";
import { Query, Document } from "solo-types";
import { DocumentWithReceivedBy } from "./tableColumns";
import { useAuthContext } from "context";
import { sleep } from "test-utils";

const useCORDocuments = () => {
  const { apiCall } = useAuthContext();
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
        // submit document and remove from current list
        await apiCall("/document/cor", {
          method: "POST",
          body: JSON.stringify({
            sdn: sdn,
            status: "COR",
            receivedBy: receivedBy
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

  return {
    setDocs,
    docs,
    updateDocuments: updateDocumentsWithD6TStatus,
    submitCOR,
    ...rest
  };
};

export default useCORDocuments;
