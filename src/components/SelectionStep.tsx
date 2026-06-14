import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import './SelectionStep.css';

interface SelectionItem {
  _id: string;
  nombre: string;
  [key: string]: any;
}

interface SelectionStepProps {
  title: string;
  subtitle?: string;
  items: SelectionItem[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  multiple?: boolean;
  loading?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
}

const SelectionStep: React.FC<SelectionStepProps> = ({
  title,
  subtitle,
  items,
  selectedIds,
  onSelect,
  multiple = false,
  loading = false,
  placeholder = 'Buscar...',
  icon,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Función para normalizar texto (quitar acentos)
  const normalize = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const filteredItems = useMemo(() => {
    const query = normalize(searchQuery);
    if (!query) return items;
    return items.filter((item) => normalize(item.nombre).includes(query));
  }, [items, searchQuery]);

  // Función para resaltar el texto coincidente
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const normalizedText = normalize(text);
    const normalizedQuery = normalize(query);
    const startIndex = normalizedText.indexOf(normalizedQuery);

    if (startIndex === -1) return text;

    const before = text.substring(0, startIndex);
    const match = text.substring(startIndex, startIndex + query.length);
    const after = text.substring(startIndex + query.length);

    return (
      <>
        {before}
        <span className="highlight-text">{match}</span>
        {after}
      </>
    );
  };

  return (
    <div className="selection-step-container">
      <div className="selection-step-header">
        <div className="step-icon-wrapper">
          {icon || <div className="step-default-icon">✨</div>}
        </div>
        <h3>{title}</h3>
        {subtitle && <p className="step-subtitle">{subtitle}</p>}
      </div>

      <div className="selection-search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="selection-input"
        />
      </div>

      <div className="selection-list-container custom-scrollbar">
        {loading ? (
          <div className="selection-loading">
            <div className="selection-spinner"></div>
            <p>Cargando opciones...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="selection-grid">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item._id);
              return (
                <div
                  key={item._id}
                  className={`selection-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelect(item._id)}
                >
                  <div className="card-content">
                    <span className="card-name">{highlightMatch(item.nombre, searchQuery)}</span>
                    {isSelected && <CheckCircle2 size={18} className="selection-check" />}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-results">
            <p>No se encontraron coincidencias para &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectionStep;
