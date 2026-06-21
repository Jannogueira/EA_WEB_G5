import React, { useState, useEffect } from 'react';
import useUnis from '../hooks/useUni';
import gradoService from '../services/grado';
import type { Grado } from '../models/grado';
import type { Asignatura } from '../models/asignatura';
import './ExploreFilterModal.css';
import { useGlobalAlert } from '../context/AlertContext';
import { BrushCleaning } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  selected: string[];
  onApply: (selected: string[]) => void;
  onClose: () => void;
}

type FilterTab = 'universidades' | 'grados' | 'asignaturas';

const ExploreFilter: React.FC<Props> = ({ selected, onApply, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<FilterTab>('universidades');

  const [localSelected, setLocalSelected] = useState<string[]>(selected);

  // Data States
  const { universidades, loading: loadingUnis } = useUnis();

  const [grados, setGrados] = useState<Grado[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);

  const [loadingItems, setLoadingItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { showAlert } = useGlobalAlert();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoadingItems(true);

      try {
        const [gradosRes, asignaturasRes] = await Promise.all([
          gradoService.getAll(),
          gradoService.getAllAsignaturas(),
        ]);

        setGrados(gradosRes.data);
        setAsignaturas(asignaturasRes.data);
      } catch (error: any) {
        const msg =
          error.response?.data?.message || error.message || t('explore_filter.server_error');
        showAlert(t('explore_filter.error_title'), msg, 'error');
      } finally {
        setLoadingItems(false);
      }
    };

    fetchAllData();
  }, [t]);

  const toggleSelection = (id: string) => {
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const getFilteredList = () => {
    let list: any[] = [];

    if (activeTab === 'universidades') {
      list = universidades;
    }

    if (activeTab === 'grados') {
      list = grados;
    }

    if (activeTab === 'asignaturas') {
      list = asignaturas;
    }

    return list.filter((item) => item.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const currentFilteredList = getFilteredList();

  return (
    <div className="filter-overlay">
      <div className="filter-modal">
        <div className="filter-tabs">
          {(['universidades', 'grados', 'asignaturas'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab);
                setSearchTerm('');
              }}
            >
              {t(`explore_filter.tabs.${tab}`)}
            </button>
          ))}
        </div>

        <div className="filter-search-row">
          <div className="filter-search">
            <input
              type="text"
              placeholder={t(`explore_filter.search_placeholder.${activeTab}`)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="clear-btn"
            onClick={() => setLocalSelected([])}
            disabled={localSelected.length === 0}
          >
            <BrushCleaning size={20} className="btn-icon" />
          </button>
        </div>

        <div className="filter-content">
          {(loadingUnis || loadingItems) && <p className="loading-text">{t('navbar.loading')}</p>}

          <div className="uni-tags">
            {currentFilteredList.map((item) => (
              <button
                key={item._id}
                className={`uni-tag ${localSelected.includes(item._id) ? 'selected' : ''}`}
                onClick={() => toggleSelection(item._id)}
              >
                {item.nombre}

                {activeTab === 'grados' && item.universidad?.nombre && (
                  <span className="tag-subtext">{item.universidad.nombre}</span>
                )}
              </button>
            ))}
          </div>

          {!loadingItems && !loadingUnis && currentFilteredList.length === 0 && (
            <p className="no-results">{t('explore_filter.no_results')}</p>
          )}
        </div>

        <div className="filter-actions">
          <button className="cancel-btn" onClick={onClose}>
            {t('edit_profile.cancel')}
          </button>

          <button
            className="apply-btn"
            onClick={() => {
              onApply(localSelected);
              onClose();
            }}
          >
            {t('explore_filter.apply')} ({localSelected.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExploreFilter;
