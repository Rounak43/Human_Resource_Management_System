import { useState, useCallback } from 'react';

/**
 * useFetch Hook
 * 
 * Responsibilities:
 * - Wrap API client requests.
 * - Track loading states and error exceptions.
 */
export const useFetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (serviceMethod, ...args) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await serviceMethod(...args);
      return data;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { request, isLoading, error };
};
