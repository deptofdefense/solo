import React, { useState, useCallback } from "react";
import iconFlag from "uswds/dist/img/us_flag_small.png";
import iconDotGov from "uswds/dist/img/icon-dot-gov.svg";
import iconHttps from "uswds/dist/img/icon-https.svg";

export const OfficialSiteBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [setExpanded, expanded]);

  return (
    <div className="usa-banner">
      <header className="usa-banner__header">
        <div className="usa-banner__inner">
          <div className="grid-col-auto">
            <img
              className="usa-banner__header-flag"
              src={iconFlag}
              alt="U.S. flag"
            />
          </div>
          <div className="grid-col-fill tablet:grid-col-auto">
            <p className="usa-banner__header-text">
              An official website of the United States government
            </p>
          </div>
          <button
            onClick={toggleExpanded}
            className="usa-accordion__button usa-banner__button"
            aria-expanded={expanded}
            aria-controls="gov-banner"
          >
            <span className="usa-banner__button-text">
              {"Here's how you know"}
            </span>
          </button>
        </div>
      </header>
      {expanded && (
        <div className="usa-banner__content">
          <div className="grid-row grid-gap-lg">
            <div className="usa-banner__guidance tablet:grid-col-6">
              <img
                className="usa-banner__icon usa-media-block__img"
                src={iconDotGov}
                alt="Dot gov"
              />
              <div className="usa-media-block__body">
                <p>
                  <strong>{"The .mil means it's official."}</strong>
                  <br />
                  Federal government websites often end in .gov or .mil. Before
                  sharing sensitive information, make sure you’re on a federal
                  government site.
                </p>
              </div>
            </div>
            <div className="usa-banner__guidance tablet:grid-col-6">
              <img
                className="usa-banner__icon usa-media-block__img"
                src={iconHttps}
                alt="This site uses HTTPS"
              />
              <div className="usa-media-block__body">
                <p>
                  <strong>The site is secure.</strong>
                  <br />
                  The <strong>https://</strong> ensures that you are connecting
                  to the official website and that any information you provide
                  is encrypted and transmitted securely.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
