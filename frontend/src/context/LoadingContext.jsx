import React, { createContext, useState, useContext, useEffect } from 'react';
import loadingService from '../utils/loadingService';

const LoadingContext = createContext({
  loading: false,
  // deprecated: keep for compatibility
  setLoading: () => {},
});

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(loadingService.getCount() > 0);

  useEffect(() => {
    const unsub = loadingService.subscribe((count) => {
      setLoading(count > 0);
      try {
        if (typeof document !== 'undefined') {
          if (count > 0) document.body.setAttribute('data-loading', 'true');
          else document.body.removeAttribute('data-loading');
        }
      } catch (e) {
        // ignore
      }
    });
    return unsub;
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

export default LoadingContext;
