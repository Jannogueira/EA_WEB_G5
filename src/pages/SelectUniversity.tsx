import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import universidadService from '../services/universidad';
import gradoService from '../services/grado';
import usuarioService from '../services/usuario';

import AsignaturasModal from '../components/AsignaturasModal';

import type { Universidad } from '../models/universidad';
import type { Grado } from '../models/grado';
import type { Usuario } from '../models/usuario';

import './Register.css';

const SelectUniversity = () => {
  const navigate = useNavigate();

  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);

  const [selectedUni, setSelectedUni] = useState('');
  const [selectedGrado, setSelectedGrado] = useState('');

  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState<Usuario | null>(null);

  // modal asignaturas
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem('usuario');

    if (!userJson) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userJson);
    setUser(parsedUser);

    const fetchUniversidades = async () => {
      try {
        const { request } = universidadService.getAll({ limit: 100 });
        const res = await request;
        setUniversidades(res.data.docs || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUniversidades();
  }, [navigate]);

  useEffect(() => {
    if (!selectedUni) {
      setGrados([]);
      setSelectedGrado('');
      return;
    }

    const fetchGrados = async () => {
      try {
        const res = await gradoService.getByUniversidad(selectedUni);
        setGrados(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGrados();
  }, [selectedUni]);

  const handleUserUpdated = (updatedUser: Usuario) => {
    setUser(updatedUser);
    localStorage.setItem('usuario', JSON.stringify(updatedUser));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUni || !selectedGrado || !user) return;

    setLoading(true);

    try {
      const response = await usuarioService.updateSelf({
        universidad: selectedUni,
        grado: selectedGrado
      });

      const updatedUser = response.data;

      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      setUser(updatedUser);

      navigate('/home');

    } catch (error) {
      console.error(error);
      alert("Error al guardar la información");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">

        <h2 className="register-title">
          Personaliza tu Perfil
        </h2>

        <p className="register-subtitle">
          Selecciona tu centro de estudios
        </p>

        <form onSubmit={handleSubmit} className="register-form">

          {/* UNIVERSIDAD */}
          <div className="form-group">
            <label>Universidad</label>
            <select
              className="select-input"
              value={selectedUni}
              onChange={(e) => setSelectedUni(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Selecciona universidad</option>
              {universidades.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* GRADO */}
          <div className="form-group">
            <label>Grado</label>
            <select
              className="select-input"
              value={selectedGrado}
              onChange={(e) => setSelectedGrado(e.target.value)}
              disabled={!selectedUni || loading}
              required
            >
              <option value="">Selecciona grado</option>
              {grados.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* BOTÓN ASIGNATURAS */}
          <div className="form-group">
            <label>Asignaturas</label>
          <button
            type="button"
            className="edit-btn-premium secondary"
            disabled={!selectedGrado || loading}
            onClick={() => setModalOpen(true)}
          >
            Selecciona asignaturas
          </button>
          </div>

          {/* SUBMIT FINAL */}
          <button
            type="submit"
            className="register-btn"
            disabled={loading || !selectedUni || !selectedGrado}
          >
            {loading ? "Guardando..." : "Finalizar Registro"}
          </button>

        </form>
      </div>

      {/* MODAL ASIGNATURAS */}
      <AsignaturasModal
        gradoId={selectedGrado}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdated={handleUserUpdated}
      />
    </div>
  );
};

export default SelectUniversity;