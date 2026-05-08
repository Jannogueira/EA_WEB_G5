import React, { useState, useEffect } from "react";
import useUnis from "../hooks/useUni";
import gradoService from "../services/grado"; // Using your existing service
import type { Grado } from "../models/grado";
import type { Asignatura } from "../models/asignatura";
import "./ExploreFilterModal.css";

interface Props {
  selected: string[];
  onApply: (selected: string[]) => void;
  onClose: () => void;
}

type FilterTab = "universidades" | "grados" | "asignaturas";

const ExploreFilter: React.FC<Props> = ({ selected, onApply, onClose }) => {
  const [activeTab, setActiveTab] = useState<FilterTab>("universidades");
  const [localSelected, setLocalSelected] = useState<string[]>(selected);
  
  // Data States
  const { universidades, loading: loadingUnis, error: uniError } = useUnis();
  const [grados, setGrados] = useState<Grado[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all Grados and Asignaturas using your service methods
  useEffect(() => {
    const fetchAllData = async () => {
      setLoadingItems(true);
      try {
        // Use the getAll methods you just added to the service
        const [gradosRes, asignaturasRes] = await Promise.all([
          gradoService.getAll(),
          gradoService.getAllAsignaturas()
        ]);
        setGrados(gradosRes.data);
        setAsignaturas(asignaturasRes.data);
      } catch (err) {
        console.error("Error fetching filter data", err);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchAllData();
  }, []);

  const toggleSelection = (id: string) => {
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getFilteredList = () => {
    let list: any[] = [];
    if (activeTab === "universidades") list = universidades;
    if (activeTab === "grados") list = grados;
    if (activeTab === "asignaturas") list = asignaturas;

    return list.filter(item => 
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const currentFilteredList = getFilteredList();

  return (
    <div className="filter-overlay">
      <div className="filter-modal">
        <div className="filter-tabs">
          {(["universidades", "grados", "asignaturas"] as FilterTab[]).map((tab) => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setSearchTerm("");
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="filter-search">
          <input 
            type="text" 
            placeholder={`Buscar ${activeTab}...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-content">
          {(loadingUnis || loadingItems) && <p className="loading-text">Cargando...</p>}
          {(uniError) && <p className="error-text">Error al cargar datos</p>}
          
          <div className="uni-tags">
            {currentFilteredList.map((item) => (
              <button
                key={item._id}
                className={`uni-tag ${localSelected.includes(item._id) ? "selected" : ""}`}
                onClick={() => toggleSelection(item._id)}
              >
                {item.nombre}
                {activeTab === "grados" && item.universidad?.nombre && (
                  <span className="tag-subtext">{item.universidad.nombre}</span>
                )}
              </button>
            ))}
          </div>
          
          {!loadingItems && !loadingUnis && currentFilteredList.length === 0 && (
            <p className="no-results">No se encontraron resultados.</p>
          )}
        </div>

        <div className="filter-actions">
          <button className="cancel-btn" onClick={onClose}>Cancelar</button>
          <button
            className="apply-btn"
            onClick={() => {
              onApply(localSelected);
              onClose();
            }}
          >
            Aplicar ({localSelected.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExploreFilter;