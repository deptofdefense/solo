import React, { useState, useCallback } from "react";
import { Button } from "solo-uswds";

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
      <input
        className="usa-input"
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
        placeholder="SDN"
      />
      <Button
        className="margin-top-1 margin-left-1"
        type="submit"
        disabled={disabled}
        square
      >
        Search
      </Button>
    </form>
  );
};

export default SdnInputForm;
