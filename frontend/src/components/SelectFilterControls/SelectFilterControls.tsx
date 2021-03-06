import React, { useState } from "react";
import { Button, Select, Input } from "solo-uswds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface SelectFilterControls {
  onSubmit: (filter: { id: string; value: string }[]) => void;
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
    onSubmit([
      {
        id: currentOption,
        value: currentValue
      }
    ]);
  };

  return (
    <form
      className="grid-row flex-row flex-justify-center flex-align-center"
      onSubmit={onSubmitted}
    >
      <div className="grid-col-full tablet:grid-col-2 margin-x-2">
        <Select
          onChange={onOptionChange}
          value={currentOption}
          placeholder="Field"
          defaultMargin
          defaultOutline
        >
          {options.map(({ name, value }) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid-col-10 tablet:grid-col-3">
        <Input
          defaultMargin
          value={currentValue}
          onChange={onValueChange}
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
