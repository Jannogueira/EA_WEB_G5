import React, { useState } from 'react';
import useUser from '../hooks/useUser';
import useAsignatura from '../hooks/useAsignatura';
import usuarioService from '../services/usuario';
import type { Usuario } from '../models/usuario';
import SelectionStep from './SelectionStep';
import { BookOpen, X } from 'lucide-react';
import Alert from './Alert';
import type { AlertState } from './Alert';
import './AcademicSelectorModal.css'; // Reutilizamos base de estilos

interface Props {
  gradoId: string;
  open: boolean;
  onClose: () => void;
  onUpdated: (u: Usuario) => void;
}

const AsignaturasModal: React.FC<Props> = ({ gradoId, open, onClose, onUpdated }) => {
  const { usuario } = useUser();
  const { asignaturas, selected, toggle, loading, error } = useAsignatura(gradoId, usuario);

  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  if (!open || !usuario) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await usuarioService.updateAsignaturas(usuario._id, selected);
      const updated = res.data;

      localStorage.setItem('usuario', JSON.stringify(updated));
      onUpdated(updated);
      onClose();
    } catch (error: any) {
      setAlert({
        type: 'error',
        title: 'Error al guardar',
        message: error.response?.data?.message || 'No se pudieron guardar las asignaturas',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="academic-modal-overlay">
      <div className="academic-modal-container">
        {alert && (
          <Alert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <button className="academic-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="academic-modal-content">
          <SelectionStep
            title="Tus Asignaturas"
            subtitle="Selecciona las materias que cursas"
            items={asignaturas}
            selectedIds={selected}
            onSelect={toggle}
            loading={loading}
            icon={<BookOpen size={24} />}
            multiple={true}
          />
        </div>

        <div className="academic-modal-footer">
          <button className="academic-cancel-btn" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="academic-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Selección'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignaturasModal;
