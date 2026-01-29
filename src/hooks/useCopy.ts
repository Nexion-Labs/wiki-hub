import { useState, useCallback } from 'react';

export function useCopy(timeout = 2000) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = useCallback((text: string, id: string) => {
    if (!navigator.clipboard) {
      // Fallback for non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), timeout);
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), timeout);
      },
      (err) => {
        console.error('Async: Could not copy text: ', err);
      }
    );
  }, [timeout]);

  return { copiedId, copy };
}
