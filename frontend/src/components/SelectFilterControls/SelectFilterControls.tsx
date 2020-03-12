import React, { useState } from "react";
import classNames from "classnames";
import { Button } from "solo-uswds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import classes from "./SelectFilterControls.module.scss";

interface SelectFilterControls {
  onSubmit: (filter: { option: string; value: string }) => void;
  options: Array<{ name: string; value: string }>;
  defaultOption?: string;
}

const SelectFilterControls: React.FC<SelectFilterControls> = ({
  options,
  defaultOption,
  onSubmit
}) => {
  const [currentOption, setCurrentOption] = useState(
    defaultOption ?? options[0]?.value
  );
  const [currentValue, setCurrentValue] = useState("");

  const onOptionChange: React.ChangeEventHandler<HTMLSelectElement> = event => {
    setCurrentOption(event.currentTarget.value);
  };

  const onValueChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    setCurrentValue(event.currentTarget.value);
  };

  const onSubmitted: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    onSubmit({
      option: currentOption,
      value: currentValue
    });
  };

  return (
    <form
      className="grid-row flex-row flex-justify-center flex-align-center"
      onSubmit={onSubmitted}
    >
      <div className="grid-col-full tablet:grid-col-2 margin-x-2">
        <select
          onChange={onOptionChange}
          value={currentOption}
          className="usa-select"
          placeholder="Field"
        >
          {options.map(({ name, value }) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid-col-10 tablet:grid-col-3">
        <input
          value={currentValue}
          onChange={onValueChange}
          className={classNames("usa-input", classes.select)}
          name="input-type-text"
          type="text"
          placeholder="Search"
        />
      </div>
      <div className="grid-col-auto">
        <Button square className="margin-top-1" type="submit">
          <FontAwesomeIcon icon={faSearch} />
        </Button>
      </div>
    </form>
  );
};

export default SelectFilterControls;
