import React from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationCircle,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import classes from "./LoadingIcon.module.scss";

interface LoadingIconProps {
  loading: boolean;
  error: string | null;
}

const LoadingIcon: React.FC<LoadingIconProps> = ({ loading, error }) => (
  <span>
    <FontAwesomeIcon
      spin={loading}
      icon={loading ? faSpinner : error ? faExclamationCircle : faCheck}
      className={classNames({
        [classes.error]: !!error
      })}
    />
  </span>
);

export default LoadingIcon;
