import React, { useState, useCallback } from "react";
import { Button, Input } from "solo-uswds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface SdnInputFormProps {
  disabled?: boolean;
  onSubmit: (sdn: string) => void;
}

const SdnInputForm: React.FC<SdnInputFormProps> = ({
  onSubmit,
  disabled = false
}) => {
  const [value, setValue] = useState("");

  const onSubmitted: React.FormEventHandler = useCallback(
    event => {
      event.preventDefault();
      onSubmit(value);
      setValue("");
    },
    [onSubmit, setValue, value]
  );

  return (
    <form
      onSubmit={onSubmitted}
      className="display-flex flex-row flex-justify-start flex-align-center flex-no-wrap flex-auto margin-1"
    >
      <Input
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
        placeholder="SDN"
      />
      <Button type="submit" disabled={disabled} square>
        <FontAwesomeIcon icon={faSearch} />
      </Button>
    </form>
  );
};

export default SdnInputForm;
