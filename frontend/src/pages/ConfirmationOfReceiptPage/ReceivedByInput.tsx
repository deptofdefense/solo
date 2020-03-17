import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { Row, Cell } from "react-table";
import { Button } from "solo-uswds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { DocumentWithReceivedBy } from "./tableColumns";
import classes from "./ReceivedByInput.module.scss";

interface ReceivedByInputCellProps {
  onSubmitCOR: (sdn: string, receivedBy: string) => void;
  cell: Cell<DocumentWithReceivedBy>;
  row: Row<DocumentWithReceivedBy>;
}

const ReceivedByInputCell: React.FC<ReceivedByInputCellProps> = ({
  onSubmitCOR,
  row: {
    original: { sdn, submitting, error }
  }
}) => {
  const [receivedBy, setReceivedBy] = useState("");
  const onSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    onSubmitCOR(sdn, receivedBy);
  };

  useEffect(() => {
    setReceivedBy("");
  }, [sdn]);

  return (
    <form
      onSubmit={onSubmit}
      className="display-flex flex-row flex-justify-start flex-align-center"
    >
      <input
        className={classNames("usa-input", classes.receivedByInput)}
        placeholder="Rank Lastname, Firstname MI"
        disabled={submitting}
        value={receivedBy}
        onChange={e => setReceivedBy(e.currentTarget.value)}
      />
      <Button
        type="submit"
        disabled={submitting || !receivedBy}
        color={error ? "secondary" : undefined}
        className={classes.btn}
      >
        {submitting ? <FontAwesomeIcon icon={faSpinner} spin /> : "Submit"}
      </Button>
    </form>
  );
};

export default ReceivedByInputCell;
