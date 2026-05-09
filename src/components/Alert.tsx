import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Alert.css';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertState {
  type?: AlertType;
  title: string;
  message: string;
}

interface AlertProps extends AlertState {
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose
}) => {
  const renderIcon = () => {
    const size = 28;

    switch (type) {
      case 'success':
        return <CheckCircle size={size} />;
      case 'error':
        return <XCircle size={size} />;
      case 'warning':
        return <AlertTriangle size={size} />;
      case 'info':
      default:
        return <Info size={size} />;
    }
  };

  return (
    <div className="alert-overlay" onClick={onClose}>
      <div className={`alert-modal alert-${type}`} onClick={(e) => e.stopPropagation()}>

        {/* HEADER ROW */}
        <div className="alert-header">
          <div className="alert-icon">
            {renderIcon()}
          </div>

          <div className="alert-text">
            <h3 className="alert-title">{title}</h3>
            <p className={`alert-message alert-message-${type}`}>
              {message}
            </p>
          </div>
        </div>

        {/* CLOSE BUTTON */}
        <button className="alert-close-btn" onClick={onClose}>
          <X size={18} />
          Close
        </button>

      </div>
    </div>
  );
};

export default Alert;