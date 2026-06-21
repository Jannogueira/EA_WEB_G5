import React, { createContext, useContext, useState, useEffect } from 'react';
import Alert from '../components/Alert';
import type { AlertState, AlertType } from '../components/Alert';

interface AlertContextType {
  showAlert: (title: string, message: string, type?: AlertType, duration?: number) => void;
  hideAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertState[]>([]);

  useEffect(() => {
    const errorChannel = new BroadcastChannel('sw-errors');

    errorChannel.onmessage = (event) => {
      if (event.data?.type === 'SW_CREDENTIALS_MISSING') {
        showAlert('System Configuration Error', event.data.message, 'error', Infinity);
      }
    };

    return () => errorChannel.close();
  }, []);

  const showAlert = (
    title: string,
    message: string,
    type: AlertType = 'error',
    duration = 5000,
  ) => {
    const newAlert: AlertState = {
      id: crypto.randomUUID(),
      title,
      message,
      type,
      duration,
    };
    // Append new alerts to the queue safely using functional state update
    setAlerts((prev) => [...prev, newAlert]);
  };

  const hideAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}

      {/* Toast Fixed Container Layer */}
      {alerts.length > 0 && (
        <div className="alert-toast-container">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              id={alert.id}
              type={alert.type}
              title={alert.title}
              message={alert.message}
              duration={alert.duration}
              onClose={hideAlert}
            />
          ))}
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useGlobalAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useGlobalAlert must be used within an AlertProvider');
  return context;
};
