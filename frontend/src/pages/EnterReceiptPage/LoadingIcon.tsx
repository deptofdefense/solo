import React from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationCircle,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import { LoadingStatus } from "solo-types";
import classes from "./EnterReceiptPage.module.scss";

const LoadingIcon: React.FC<LoadingStatus> = ({ loading, error }) => (
  <span>
    <FontAwesomeIcon
      spin={loading}
      icon={loading ? faSpinner : error ? faExclamationCircle : faCheck}
      className={classNames({
        [classes.error]: error
      })}
    />
  </span>
);

export default LoadingIcon;
