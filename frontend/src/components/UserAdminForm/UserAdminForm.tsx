import React, { useState, useCallback } from "react";
import classNames from "classnames";
import classes from "./UserAdminForm.module.scss";
import { LoadingStatus } from "solo-types";

interface UserAdminFormProps
  extends Partial<JSX.IntrinsicElements["form"]>,
    LoadingStatus {
  onSubmitUser: (value: string) => void;
  onUserNameEntry: (value: string) => void;
  value: string;
}

const UserAdminForm: React.FC<UserAdminFormProps> = ({
  onSubmitUser,
  onUserNameEntry,
  error
}) => {
  const [value, setValue] = useState("");

  const onSubmitted: React.FormEventHandler = useCallback(
    event => {
      event.preventDefault();
      onSubmitUser(value);
      setValue("");
    },
    [onSubmitUser, setValue, value]
  );

  return (
    <div className="display-flex flex-column">
      <form
        onSubmit={onSubmitted}
        className={classNames("display-flex", "flex-row", "flex-align-center")}
      >
        <input
          className={classNames("usa-input", classes.userNameInput, {
            "usa-input--error": error
          })}
          placeholder="Rank Lastname, Firstname MI"
          value={value}
          onChange={e => onUserNameEntry(e.currentTarget.value)}
        />
      </form>
    </div>
  );
};

export default UserAdminForm;
