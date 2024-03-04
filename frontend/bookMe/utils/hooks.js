// hooks.js
import { useState } from 'react';

export const useFormField = (initialValue) => {
  const [value, setValue] = useState(initialValue);
  const handleChange = (newValue) => setValue(newValue);
  return [value, handleChange];
};

export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue(!value);
  return [value, toggle];
};
