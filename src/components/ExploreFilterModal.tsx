import React, {  useState } from "react";
import useUnis from "../hooks/useUni";
import "./ExploreFilterModal.css";

interface Props {
  selected: string[];
  onApply: (selected: string[]) => void;
  onClose: () => void;
}

const ExploreFilter: React.FC<Props> = ({ selected, onApply, onClose }) => {
    const { universidades, loading, error } = useUnis();
    const [localSelected, setLocalSelected] = useState<string[]>(selected);
  
    const toggleUni = (id: string) => {
      setLocalSelected((prev) =>
        prev.includes(id)
          ? prev.filter((u) => u !== id)
          : [...prev, id]
      );
    };
  
    return (
      <div className="filter-overlay">
        <div className="filter-modal">
          <h2>Filtrar por universidades</h2>
  
          {loading && <p>Cargando universidades...</p>}
          {error && <p>{error}</p>}
  
          <div className="uni-tags">
            {universidades.map((uni) => (
              <button
                key={uni._id}
                className={`uni-tag ${
                  localSelected.includes(uni._id) ? "selected" : ""
                }`}
                onClick={() => toggleUni(uni._id)}
              >
                {uni.nombre}
              </button>
            ))}
          </div>
  
          <div className="filter-actions">
            <button onClick={onClose}>Cancelar</button>
            <button
              onClick={() => {
                onApply(localSelected);
                onClose();
              }}
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default ExploreFilter;