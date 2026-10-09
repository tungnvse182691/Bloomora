import { useEffect } from 'react';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);
};
