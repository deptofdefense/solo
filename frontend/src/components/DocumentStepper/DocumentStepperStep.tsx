import React from "react";
import classNames from "classnames";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps
} from "@fortawesome/react-fontawesome";
import { faCheckCircle, faDotCircle } from "@fortawesome/free-solid-svg-icons";
import classes from "./DocumentStepper.module.scss";

interface IconProps extends Omit<FontAwesomeIconProps, "icon"> {
  complete?: boolean;
}

const StatusIcon: React.FC<IconProps> = ({ complete, ...rest }) => (
  <FontAwesomeIcon {...rest} icon={complete ? faCheckCircle : faDotCircle} />
);

interface StepProps {
  title: string;
  first?: boolean;
  last?: boolean;
  occuredAt?: string;
  complete?: boolean | string | undefined;
}

const Step: React.FC<StepProps> = ({
  first = false,
  last = false,
  complete = false,
  title,
  occuredAt
}) => (
  <div
    className={classNames(classes.step, {
      [classes.stepComplete]: complete,
      [classes.stepIncomplete]: !complete
    })}
  >
    <StatusIcon className={classes.stepIcon} complete={Boolean(complete)} />
    <div>{title}</div>
    {occuredAt && (
      <div>{`${formatDistanceToNow(parseISO(occuredAt))} ago `}</div>
    )}
    {!first && <div className={classes.stepLeft} />}
    {!last && <div className={classes.stepRight} />}
  </div>
);

export default Step;
