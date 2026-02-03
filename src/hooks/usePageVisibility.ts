import { useState, useEffect } from 'react';

/**
 * Hook to detect page visibility state
 * @returns isVisible - whether the page is currently visible
 */
const usePageVisibility = (): boolean => {
  const [isVisible, setIsVisible] = useState<boolean>(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};

export default usePageVisibility;
