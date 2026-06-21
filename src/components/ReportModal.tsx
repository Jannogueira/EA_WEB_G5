import React, { useState } from 'react';
import './ReportModal.css';
import { X, CheckCircle2, ChevronRight } from 'lucide-react';
import reportService from '../services/report';

interface ReportModalProps {
  tipo: 'post' | 'comment' | 'user' | 'chat';
  objetivoId: string;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ tipo, objetivoId, onClose }) => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasons = [
    'Contenido inapropiado',
    'Spam o estafa',
    'Acoso o bullying',
    'Discurso de odio',
    'Información falsa',
    'Otros'
  ];

  const handleReport = async (descripcion: string) => {
    setLoading(true);
    setError(null);
    try {
      await reportService.reportContent(tipo, objetivoId, descripcion);
      setSent(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError('No se pudo enviar el reporte. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (tipo) {
      case 'post':
        return 'Reportar publicación';
      case 'comment':
        return 'Reportar comentario';
      case 'user':
        return 'Reportar perfil';
      case 'chat':
        return 'Reportar mensaje';
      default:
        return 'Reportar contenido';
    }
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="report-modal-header">
          <h2>{getTitle()}</h2>
          <button className="close-x-btn" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </header>

        {sent ? (
          <div className="report-sent-success">
            <CheckCircle2 size={60} color="#10b981" />
            <p>Reporte enviado correctamente</p>
          </div>
        ) : (
          <div className="report-modal-body">
            <p className="report-intro">¿Por qué quieres reportar este contenido? Tu reporte será anónimo.</p>
            {error && <p className="report-error-msg">{error}</p>}
            <ul className="report-reasons-list">
              {reasons.map((reason, idx) => (
                <li key={idx} className="report-reason-item" onClick={() => !loading && handleReport(reason)}>
                  <span>{reason}</span>
                  <ChevronRight size={18} className="chevron-icon" />
                </li>
              ))}
            </ul>
            {loading && <div className="report-loading-overlay">Enviando reporte...</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
