import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Alert.css';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertState {
  id: string; // Added tracking ID
  type?: AlertType;
  title: string;
  message: string;
  duration?: number; // Optional auto-dismiss
}

interface AlertProps extends AlertState {
  onClose: (id: string) => void;
}

const Alert: React.FC<AlertProps> = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    if (duration === Infinity) return;
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const renderIcon = () => {
    const size = 24;
    switch (type) {
      case 'success':
        return <CheckCircle size={size} />;
      case 'error':
        return <XCircle size={size} />;
      case 'warning':
        return <AlertTriangle size={size} />;
      default:
        return <Info size={size} />;
    }
  };

  return (
    <div className={`alert-toast alert-${type}`} role="alert" aria-live="assertive">
      <div className="alert-header">
        <div className="alert-icon">{renderIcon()}</div>
        <div className="alert-text">
          <h3 className="alert-title">{title}</h3>
          <p className={`alert-message alert-message-${type}`}>{message}</p>
        </div>
      </div>
      <button
        type="button"
        className="alert-close-btn"
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Alert;
