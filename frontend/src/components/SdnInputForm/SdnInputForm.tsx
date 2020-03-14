import React, { useState, useCallback } from "react";
import { Button } from "solo-uswds";

interface SdnInputFormProps {
  onSubmit: (sdn: string) => void;
}

const SdnInputForm: React.FC<SdnInputFormProps> = ({ onSubmit }) => {
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
      className="grid-row flex-row flex-justify-start flex-align-center margin-3 col-5"
    >
      <input
        className="usa-input"
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
        placeholder="SDN"
      />
      <Button className="margin-top-1 margin-left-1" type="submit" square>
        Submit
      </Button>
    </form>
  );
};

export default SdnInputForm;
