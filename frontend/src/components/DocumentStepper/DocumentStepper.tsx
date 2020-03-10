import React, { useMemo } from "react";
import classes from "./DocumentStepper.module.scss";
import { Status } from "solo-types";
import Step from "./DocumentStepperStep";

interface DocumentStepperProps {
  statuses: Status[];
}

const DocumentStepper: React.FC<DocumentStepperProps> = ({ statuses }) => {
  const statusByDic: Record<string, string> = useMemo(
    () =>
      statuses.reduce(
        (allDics, newStat) => ({
          ...allDics,
          [newStat.dic.code]: newStat.status_date
        }),
        {}
      ),
    [statuses]
  );

  return (
    <div className={classes.stepRoot}>
      <Step
        first
        title="Requested (AE1)"
        occuredAt={statusByDic["AE1"]}
        complete={statusByDic["AE1"]}
      />

      <Step
        title="Shipped (AS1)"
        occuredAt={statusByDic["AS1"]}
        complete={statusByDic["AS1"]}
      />

      <Step
        title="In Transit"
        occuredAt={statusByDic["AS2"]}
        complete={statusByDic["AS2"]}
      />

      <Step
        title="Received (D6T)"
        occuredAt={statusByDic["D6T"]}
        complete={statusByDic["D6T"]}
      />

      <Step
        title="Confirmation (COR)"
        occuredAt={statusByDic["D6T"]}
        complete={statusByDic["D6T"]}
        last
      />
    </div>
  );
};

export default DocumentStepper;
