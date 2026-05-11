import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Library, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

import universidadService from '../services/universidad';
import gradoService from '../services/grado';
import usuarioService from '../services/usuario';

import SelectionStep from '../components/SelectionStep';
import Alert from '../components/Alert';
import type { AlertState } from '../components/Alert';

import type { Universidad } from '../models/universidad';
import type { Grado } from '../models/grado';
import type { Asignatura } from '../models/asignatura';
import type { Usuario } from '../models/usuario';

import './Register.css';

const SelectUniversity = () => {
  const navigate = useNavigate();

  // Paso actual (1: Uni, 2: Grado, 3: Asignaturas)
  const [step, setStep] = useState(1);

  // Datos cargados
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);

  // Selecciones
  const [selectedUniId, setSelectedUniId] = useState('');
  const [selectedGradoId, setSelectedGradoId] = useState('');
  const [selectedAsigIds, setSelectedAsigIds] = useState<string[]>([]);

  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [user, setUser] = useState<Usuario | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem('usuario');
    if (!userJson) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userJson));

    // Cargar universidades al inicio
    fetchUniversidades();
  }, [navigate]);

  // Cargar grados cuando cambia la universidad
  useEffect(() => {
    if (selectedUniId && step === 2) {
      fetchGrados();
    }
  }, [selectedUniId, step]);

  // Cargar asignaturas cuando cambia el grado
  useEffect(() => {
    if (selectedGradoId && step === 3) {
      fetchAsignaturas();
    }
  }, [selectedGradoId, step]);

  const fetchUniversidades = async () => {
    setLoadingData(true);
    try {
      const { request } = universidadService.getAll({ limit: 1000 });
      const res = await request;
      setUniversidades(res.data.docs || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchGrados = async () => {
    setLoadingData(true);
    try {
      const res = await gradoService.getByUniversidad(selectedUniId);
      setGrados(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAsignaturas = async () => {
    setLoadingData(true);
    try {
      const res = await gradoService.getAsignaturas(selectedGradoId);
      setAsignaturas(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSelectUni = (id: string) => {
    setSelectedUniId(id);
    setSelectedGradoId('');
    setSelectedAsigIds([]);
  };

  const handleSelectGrado = (id: string) => {
    setSelectedGradoId(id);
    setSelectedAsigIds([]);
  };

  const handleToggleAsignatura = (id: string) => {
    setSelectedAsigIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!selectedUniId || !selectedGradoId || !user) return;

    setLoading(true);
    try {
      // 1. Actualizar Uni y Grado
      await usuarioService.updateSelf({
        universidad: selectedUniId,
        grado: selectedGradoId
      });

      // 2. Actualizar Asignaturas
      const response = await usuarioService.updateAsignaturas(user._id, selectedAsigIds);
      const updatedUser = response.data;

      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setAlert({
        type: 'success',
        title: '¡Registro completado!',
        message: 'Tu perfil académico se ha configurado correctamente.'
      });

      setTimeout(() => {
        navigate('/home');
      }, 1500);

    } catch (error: any) {
      setAlert({
        type: 'error',
        title: 'Error al guardar',
        message: error.response?.data?.message || "Error al conectar con el servidor"
      });
    } finally {
      setLoading(false);
    }
  };

  const isNextDisabled = () => {
    if (step === 1) return !selectedUniId;
    if (step === 2) return !selectedGradoId;
    if (step === 3) return selectedAsigIds.length === 0;
    return false;
  };

  return (
    <div className="register-page">
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="register-container selection-flow">
        {/* Progress Bar */}
        <div className="step-progress">
          <div className={`progress-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-dot ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        <div className="selection-step-wrapper">
          {step === 1 && (
            <SelectionStep
              title="¿Dónde estudias?"
              subtitle="Selecciona tu universidad para encontrar a tus compañeros"
              items={universidades}
              selectedIds={[selectedUniId]}
              onSelect={handleSelectUni}
              loading={loadingData}
              placeholder="Buscar universidad..."
              icon={<Library className="step-icon-main" />}
            />
          )}

          {step === 2 && (
            <SelectionStep
              title="¿Qué carrera cursas?"
              subtitle="Filtra por tu grado académico"
              items={grados}
              selectedIds={[selectedGradoId]}
              onSelect={handleSelectGrado}
              loading={loadingData}
              placeholder="Buscar grado..."
              icon={<GraduationCap className="step-icon-main" />}
            />
          )}

          {step === 3 && (
            <SelectionStep
              title="Tus asignaturas"
              subtitle="Selecciona las materias que estás cursando este semestre"
              items={asignaturas}
              selectedIds={selectedAsigIds}
              onSelect={handleToggleAsignatura}
              multiple={true}
              loading={loadingData}
              placeholder="Buscar asignatura..."
              icon={<BookOpen className="step-icon-main" />}
            />
          )}
        </div>

        <div className="step-navigation-footer">
          {step > 1 && (
            <button 
              className="btn-back" 
              onClick={handleBack}
              disabled={loading}
            >
              <ChevronLeft size={20} />
              Atrás
            </button>
          )}
          
          <div className="spacer"></div>

          {step < 3 ? (
            <button 
              className="btn-next" 
              onClick={handleNext}
              disabled={isNextDisabled() || loading}
            >
              Siguiente
              <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              className="btn-finish" 
              onClick={handleSubmit}
              disabled={isNextDisabled() || loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <div className="mini-spinner"></div>
                  Guardando...
                </span>
              ) : (
                <>
                  Finalizar Registro
                  <CheckCircle size={20} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectUniversity;