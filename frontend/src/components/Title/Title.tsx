import React from "react";

const Title: React.FC = ({ children }) => {
  const defaultTitle = "Title";
  return <h1 className="usa-prose">{children || defaultTitle}</h1>;
};

export default Title;
