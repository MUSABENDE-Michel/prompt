import { useState, useCallback } from 'react';

export function useAutoGenerate(prefix = 'BWS') {
  const [generatedId, setGeneratedId] = useState('');

  const generateId = useCallback(() => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const id = `${prefix}-${ts}-${rand}`;
    setGeneratedId(id);
    return id;
  }, [prefix]);

  const generateTimestamp = useCallback(() => {
    return new Date().toISOString();
  }, []);

  return { generatedId, generateId, generateTimestamp };
}
