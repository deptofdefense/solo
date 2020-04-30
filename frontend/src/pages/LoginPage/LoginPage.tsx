import React, { useState } from "react";
import useAuthContext from "context/AuthContext";
import { Button } from "solo-uswds";
import classes from "./LoginPage.module.scss";

const LoginPage: React.FC = props => {
  const [loginError, setLoginError] = useState("");
  const { apiLogin } = useAuthContext();

  const login = async () => {
    try {
      await apiLogin();
    } catch (e) {
      setLoginError(
        "Hey Marine. Having trouble logging in? Try closing your browser window."
      );
    }
  };

  return (
    <div className={classes.root}>
      <h1 className={classes.title}>
        Welcome to the System for Operational Logistics Ordering (SOLO)
      </h1>
      <div className={classes.consent}>
        <h3>
          You are accessing a U.S. Government (USG) Information System (IS) that
          is provided for USG-authorized use only.
        </h3>
        <p>
          By using this IS (which includes any device attached to this IS), you
          consent to the following conditions:
        </p>
        <ul>
          <li>
            The USG routinely intercepts and monitors communications on this IS
            for purposes including, but not limited to, penetration testing,
            COMSEC monitoring, network operations and defense, personnel
            misconduct (PM), law enforcement (LE), and counterintelligence (CI)
            investigations.
          </li>
          <li>
            At any time, the USG may inspect and seize data stored on this IS.
          </li>
          <li>
            Communications using, or data stored on, this IS are not private,
            are subject to routine monitoring, interception, and search, and may
            be disclosed or used for any USG-authorized purpose.
          </li>
          <li>
            This IS includes security measures (e.g., authentication and access
            controls) to protect USG interests -- not for your personal benefit
            or privacy.
          </li>
          <li>
            Notwithstanding the above, using this IS does not constitute consent
            to PM, LE or CI investigative searching or monitoring of the content
            of privileged communications, or work product, related to personal
            representation or services by attorneys, psychotherapists, or
            clergy, and their assistants. Such communications and work product
            are private and confidential. See User Agreement for details.
          </li>
        </ul>
      </div>
      <div>
        <Button big className={classes.btnRoot} onClick={login}>
          Agree and CAC Login
        </Button>
      </div>
      {loginError && (
        <div>
          <span className={classes.errorMsg}>{loginError}</span>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
