import { useCallback, useState } from "react";
import { useDocumentSet } from "hooks";
import { Query, Document, LoadingStatus } from "solo-types";
import { useAuthContext } from "context";
import { sleep } from "test-utils";

const useCORDocuments = () => {
  const { apiCall } = useAuthContext();
  const [bulkSubmitStatus, setBulkSubmitStatus] = useState<LoadingStatus>({
    loading: false
  });
  const {
    setDocs,
    docs,
    updateDocuments,
    modifyDocument,
    removeDocument,
    ...rest
  } = useDocumentSet();

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
          },
          {
            id: "exclude_status",
            value: "COR"
          }
        ]
      }),
    [updateDocuments]
  );

  const submitCOR = useCallback(
    async (sdn: string, received_by: string) => {
      modifyDocument(sdn, {
        loadingStatus: {
          loading: true
        }
      });
      // simulate up to 1.5 seconds of load time
      await sleep(Math.floor(Math.random() * 1500));
      try {
        // submit single document and remove from current list
        await apiCall("/document/cor/", {
          method: "POST",
          body: JSON.stringify([
            {
              sdn,
              received_by,
              status: "COR"
            }
          ])
        });
        removeDocument(sdn);
      } catch (e) {
        // api or network error
        modifyDocument(sdn, {
          loadingStatus: {
            loading: false,
            error: true,
            message: e.message || "Something went wrong"
          }
        });
      }
    },
    [modifyDocument, removeDocument, apiCall]
  );

  const submitBulkCOR = useCallback(
    async (sdns: string[], received_by: string) => {
      setBulkSubmitStatus({
        loading: true
      });
      // simulate up to 1.5 seconds of load time
      await sleep(Math.floor(Math.random() * 1500));
      try {
        // submit bulk documents and remove from list
        await apiCall("/document/cor/", {
          method: "POST",
          body: JSON.stringify(
            sdns.map(sdn => ({
              sdn,
              received_by,
              status: "COR"
            }))
          )
        });
        // filter all submitted sdns
        setDocs(prevDocs =>
          prevDocs.filter(({ sdn }) => sdns.indexOf(sdn) < 0)
        );
        setBulkSubmitStatus({
          loading: false
        });
      } catch (e) {
        setBulkSubmitStatus({
          loading: false,
          error: true,
          message: e.message || "Something went wrong"
        });
      }
    },
    [setBulkSubmitStatus, setDocs, apiCall]
  );

  const resetBulkSubmitStatus = useCallback(() => {
    setBulkSubmitStatus({
      loading: false
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
