import React from "react";
import classNames from "classnames";
import { Button } from "solo-uswds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import classes from "./CORInputForm.module.scss";

interface CORInputFormProps extends Partial<JSX.IntrinsicElements["form"]> {
  onSubmitCOR: (value: string) => void;
  onReceivedByChange: (value: string) => void;
  value: string;
  actionText?: string;
  loading?: boolean;
  error?: string | null;
}

const ReceivedByInputCell: React.FC<CORInputFormProps> = ({
  onSubmitCOR,
  onReceivedByChange,
  value,
  loading,
  error,
  actionText = "Submit",
  className,
  ...rest
}) => {
  const onSubmitEvent: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    onSubmitCOR(value);
  };

  return (
    <div className="display-flex flex-column">
      <form
        onSubmit={onSubmitEvent}
        className={classNames(
          "display-flex",
          "flex-row",
          "flex-align-center",
          className
        )}
        {...rest}
      >
        <input
          className={classNames("usa-input", classes.receivedByInput, {
            "usa-input--error": error
          })}
          placeholder="Rank Lastname, Firstname MI"
          disabled={loading}
          value={value}
          onChange={e => onReceivedByChange(e.currentTarget.value)}
        />
        <Button
          type="submit"
          disabled={loading || !value}
          color={error ? "secondary" : undefined}
          className={classes.btn}
        >
          {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : actionText}
        </Button>
      </form>
      {error && (
        <div className="usa-error-message text-center" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default ReceivedByInputCell;
