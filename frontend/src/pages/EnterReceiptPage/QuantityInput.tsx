import React from "react";
import { Input } from "solo-uswds";

interface QuantityInputProps {
  enteredQuantity?: number;
  onQuantitiyChange: (value: number) => void;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  enteredQuantity = 0,
  onQuantitiyChange
}) => {
  const onValueChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const asNum = parseInt(e.currentTarget.value);
    if (!isNaN(asNum)) {
      onQuantitiyChange(asNum);
    }
  };

  return (
    <Input
      value={enteredQuantity}
      onChange={onValueChange}
      placeholder="Quantity"
    />
  );
};

export default QuantityInput;
