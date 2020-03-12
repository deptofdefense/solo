import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";

interface IndicatorProps {
  left?: boolean;
  pad?: boolean;
}

const PaginatorIndicatorIcon: React.FC<IndicatorProps> = ({
  left = false,
  pad = false
}) => (
  <FontAwesomeIcon
    size="sm"
    icon={left ? faChevronLeft : faChevronRight}
    className={pad ? (left ? "margin-right-1" : "margin-left-1") : ""}
  />
);

export default PaginatorIndicatorIcon;
