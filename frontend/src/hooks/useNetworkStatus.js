import { useState, useEffect } from 'react';

/**
 * Custom hook to detect network status (online/offline)
 * @returns {boolean} - true if online, false if offline
 */
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(() => {
    return navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default useNetworkStatus;
