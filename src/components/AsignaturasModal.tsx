import React, { useState } from "react";
import useUser from "../hooks/useUser";
import useAsignatura from "../hooks/useAsignatura";
import usuarioService from "../services/usuario";
import type { Usuario } from "../models/usuario";

import "./ExploreFilterModal.css";

interface Props {
  gradoId: string;
  open: boolean;
  onClose: () => void;
  onUpdated: (u: Usuario) => void;
}

const AsignaturasModal: React.FC<Props> = ({
  gradoId,
  open,
  onClose,
  onUpdated
}) => {
  const { usuario } = useUser();

  const {
    asignaturas,
    selected,
    toggle,
    loading,
    error
  } = useAsignatura(gradoId, usuario);

  const [saving, setSaving] = useState(false);

  if (!open || !usuario) return null;

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await usuarioService.updateAsignaturas(
        usuario._id,
        selected
      );

      const updated = res.data;

      localStorage.setItem("usuario", JSON.stringify(updated));
      onUpdated(updated);
      onClose();

    } catch (err) {
      console.error("Error guardando asignaturas:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="filter-overlay">
      <div className="filter-modal">

        <h2>Selecciona tus asignaturas</h2>

        {loading && <p>Cargando...</p>}
        {error && <p className="error">{error}</p>}

        {/* TAGS */}
        <div className="uni-tags">
          {asignaturas.map((a) => (
            <button
              key={a._id}
              type="button"
              className={`uni-tag ${selected.includes(a._id) ? "selected" : ""}`}
              onClick={() => toggle(a._id)}
              disabled={saving}
            >
              {a.nombre}
            </button>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="filter-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AsignaturasModal;