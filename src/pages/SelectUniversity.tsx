import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import universidadService from '../services/universidad.service';
import usuarioService from '../services/usuario.service';
import type { Universidad } from '../models/universidad';
import type { Usuario } from '../models/usuario';
import './Register.css'; // Reusando el contenedor de Register por consistencia

const SelectUniversity = () => {
  const navigate = useNavigate();
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [selectedUni, setSelectedUni] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    // Recuperar usuario del localStorage
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      setUser(JSON.parse(userJson));
    } else {
      // Si no hay usuario, redirigir al login
      navigate('/login');
    }

    const fetchUniversidades = async () => {
      try {
        const data = await universidadService.getAll();
        setUniversidades(data);
      } catch (error) {
        console.error("Error fetching universities:", error);
      }
    };
    fetchUniversidades();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUni || !user) return;

    setLoading(true);
    try {
      // Realizar el PATCH al usuario
      const response = await usuarioService.updateSelf({ universidad: selectedUni });
      
      // Actualizar el usuario en localStorage con los nuevos datos recibidos
      localStorage.setItem('usuario', JSON.stringify(response.data));
      
      console.log("Universidad seleccionada y perfil actualizado.");
      navigate('/home');
    } catch (error: any) {
      console.error('Error updating university:', error);
      alert("Error al guardar la universidad. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Personaliza tu Perfil</h2>
        <p className="register-subtitle">Selecciona tu centro de estudios para conectar con tu comunidad</p>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="universidad">¿En qué universidad estudias?</label>
            <select
              id="universidad"
              name="universidad"
              value={selectedUni}
              onChange={(e) => setSelectedUni(e.target.value)}
              disabled={loading}
              className="select-input"
              required
            >
              <option value="" disabled>Selecciona tu universidad</option>
              {universidades.map((uni) => (
                <option key={uni._id} value={uni._id}>
                  {uni.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit" 
            className="register-btn" 
            disabled={loading || !selectedUni}
          >
            {loading ? "Guardando..." : "Finalizar Registro"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SelectUniversity;
