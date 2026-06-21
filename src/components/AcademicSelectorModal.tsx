import React, { useState, useEffect } from 'react';
import { Library, GraduationCap, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGlobalAlert } from '../context/AlertContext';
import SelectionStep from './SelectionStep';
import universidadService from '../services/universidad';
import gradoService from '../services/grado';
import type { Universidad } from '../models/universidad';
import type { Grado } from '../models/grado';
import './AcademicSelectorModal.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (uni: Universidad, grado: Grado) => void;
  initialUni?: Universidad | null;
  initialGrado?: Grado | null;
}

const AcademicSelectorModal: React.FC<Props> = ({
  open,
  onClose,
  onSelect,
  initialUni,
  initialGrado,
}) => {
  const [step, setStep] = useState(1);
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);

  const [selectedUni, setSelectedUni] = useState<Universidad | null>(initialUni || null);
  const [selectedGrado, setSelectedGrado] = useState<Grado | null>(initialGrado || null);
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();
  const { showAlert } = useGlobalAlert();

  useEffect(() => {
    if (open) {
      fetchUniversidades();
      setStep(1);
      // Sincronizar con los valores del padre por si han cambiado
      setSelectedUni(initialUni || null);
      setSelectedGrado(initialGrado || null);
    }
  }, [open, initialUni, initialGrado]);

  useEffect(() => {
    if (selectedUni?._id && step === 2) {
      fetchGrados();
    }
  }, [selectedUni?._id, step]);

  const fetchUniversidades = async () => {
    setLoading(true);
    try {
      const { request } = universidadService.getAll({ limit: 1000 });
      const res = await request;
      setUniversidades(res.data.docs || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar las universidades';
      showAlert(t('academic_modal.error_title'), errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrados = async () => {
    if (!selectedUni?._id) return;
    setLoading(true);
    try {
      const res = await gradoService.getByUniversidad(selectedUni._id);
      setGrados(res.data || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar los grados académicos';
      showAlert(t('academic_modal.error_title'), errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUni = (id: string) => {
    const uni = universidades.find((u) => u._id === id);
    if (uni) {
      setSelectedUni(uni);
      setSelectedGrado(null);
      setStep(2);
    }
  };

  const handleSelectGrado = (id: string) => {
    const grado = grados.find((g) => g._id === id);
    if (grado) {
      setSelectedGrado(grado);
    }
  };

  const handleConfirm = () => {
    if (selectedUni && selectedGrado) {
      onSelect(selectedUni, selectedGrado);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="academic-modal-overlay">
      <div className="academic-modal-container">
        <button className="academic-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="academic-modal-content">
          <div className="academic-step-indicator">
            <div className={`step-pill ${step === 1 ? 'active' : ''}`}>
              1. {t('academic_modal.step_uni')}
            </div>
            <div className="step-arrow">
              <ChevronRight size={14} />
            </div>
            <div className={`step-pill ${step === 2 ? 'active' : ''}`}>
              2. {t('academic_modal.step_degree')}
            </div>
          </div>

          {step === 1 ? (
            <SelectionStep
              title={t('academic_modal.select_uni_title')}
              subtitle={t('academic_modal.select_uni_subtitle')}
              items={universidades}
              selectedIds={selectedUni ? [selectedUni._id] : []}
              onSelect={handleSelectUni}
              loading={loading}
              icon={<Library size={24} />}
            />
          ) : (
            <div className="grado-selection-wrapper">
              <button className="back-to-uni" onClick={() => setStep(1)}>
                <ChevronLeft size={16} /> {t('academic_modal.change_uni')}
              </button>
              <SelectionStep
                title={t('academic_modal.select_degree_title')}
                subtitle={t('academic_modal.select_degree_subtitle')}
                items={grados}
                selectedIds={selectedGrado ? [selectedGrado._id] : []}
                onSelect={handleSelectGrado}
                loading={loading}
                icon={<GraduationCap size={24} />}
              />
            </div>
          )}
        </div>

        <div className="academic-modal-footer">
          <button className="academic-cancel-btn" onClick={onClose}>
            {t('academic_modal.cancel')}
          </button>
          {step === 2 && (
            <button className="academic-save-btn" disabled={!selectedGrado} onClick={handleConfirm}>
              {t('academic_modal.confirm')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicSelectorModal;
