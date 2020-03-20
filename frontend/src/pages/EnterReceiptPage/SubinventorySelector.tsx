import React from "react";
import { Subinventory, Locator } from "solo-types";
import { Select } from "solo-uswds";

interface SubinventorySelectorProps {
  subinventorys: Omit<Subinventory, "locators">[];
  enteredSubinventoryCode: string;
  onSelectSubinventory: (code: string) => void;
}

export const SubinventorySelector: React.FC<SubinventorySelectorProps> = ({
  subinventorys,
  enteredSubinventoryCode,
  onSelectSubinventory
}) => (
  <Select
    value={enteredSubinventoryCode}
    onChange={e => {
      onSelectSubinventory(e.currentTarget.value);
    }}
    placeholder="Subinventory"
  >
    {subinventorys.map(subinv => (
      <option key={subinv.code} value={subinv.code}>
        {subinv.code}
      </option>
    ))}
  </Select>
);

interface LocatorSelectrProps {
  locators: Locator[];
  enteredLocatorCode: string;
  onSelectLocator: (code: string) => void;
}

export const LocatorSelector: React.FC<LocatorSelectrProps> = ({
  locators,
  enteredLocatorCode,
  onSelectLocator
}) => (
  <Select
    value={enteredLocatorCode}
    onChange={e => {
      onSelectLocator(e.currentTarget.value);
    }}
    placeholder="Locator"
  >
    {locators.map(loc => (
      <option key={loc.code} value={loc.code}>
        {loc.code}
      </option>
    ))}
  </Select>
);
