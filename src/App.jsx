import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SplashLoader } from './components/common/SplashLoader';
import { AppRoutes } from './routes/AppRoutes';
import { initLocalData } from './services/storageService';

export function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Pre-initialize local data
    initLocalData();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {showSplash && <SplashLoader onFinish={() => setShowSplash(false)} />}
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
