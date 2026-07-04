import { useState } from 'react';

/**
 * useForm Hook
 * 
 * Responsibilities:
 * - Manage form states.
 * - Map validation errors based on validator.js utilities.
 */
export const useForm = (initialValues = {}, validateCallback) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();
    if (validateCallback) {
      const validationErrors = validateCallback(values);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;
    }
    onSubmit(values);
  };

  return { values, handleChange, handleSubmit, errors, setErrors };
};
