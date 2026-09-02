import { useState, useCallback } from 'react';

const RESET_DELAY_MS = 1500;

export function useCopyToClipboard(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), RESET_DELAY_MS);
  }, []);

  return [copied, copy];
}
