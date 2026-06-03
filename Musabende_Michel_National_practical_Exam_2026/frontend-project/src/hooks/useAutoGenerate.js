import { useState, useCallback } from 'react';
import authService from '../services/authService';

export default function useAutoGenerate() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');

  const generate = useCallback(async (type) => {
    setLoading(true);
    try {
      const res = await authService.generateCode(type);
      if (res.data.success) {
        setCode(res.data.data.code);
        return res.data.data.code;
      }
    } catch {
      const prefix =
        type === 'customer' ? 'CUST' : type === 'product' ? 'PROD' : 'INV';
      const fallback = `${prefix}${String(Date.now()).slice(-5)}`;
      setCode(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, []);

  return { code, loading, generate };
}
