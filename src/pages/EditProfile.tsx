import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUser from "../hooks/useUser";
import { useTranslation } from "react-i18next";
import AsignaturasModal from "../components/AsignaturasModal";
import AcademicSelectorModal from "../components/AcademicSelectorModal";
import { uploadImage } from "../services/upload";
import { Loader2, Camera, GraduationCap, Library, AlertTriangle } from "lucide-react";
import Alert from "../components/Alert";
import type { AlertState } from "../components/Alert";
import type { Universidad } from "../models/universidad";
import type { Grado } from "../models/grado";

const EditProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { usuario, updateProfile, loading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [academicModalOpen, setAcademicModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const [selectedUni, setSelectedUni] = useState<Universidad | null>(null);
  const [selectedGrado, setSelectedGrado] = useState<Grado | null>(null);
  const [userAsignaturas, setUserAsignaturas] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    avatarUrl: "",
    descripcion: "",
    privado: false
  });

  useEffect(() => {
    if (usuario) {
      setFormData(prev => ({
        ...prev,
        nombre: usuario.nombre || "",
        email: usuario.email || "",
        avatarUrl: usuario.avatarUrl || "",
        descripcion: usuario.descripcion || "",
        privado: usuario.privado || false
      }));
      
      // Solo actualizamos si no hay una selección local activa o si es la primera carga
      if (!selectedUni || (typeof usuario.universidad === 'object' && usuario.universidad?._id !== selectedUni._id)) {
          if (usuario.universidad) {
            if (typeof usuario.universidad === 'object') {
              setSelectedUni(usuario.universidad as Universidad);
            } else {
              setSelectedUni({ _id: usuario.universidad, nombre: 'Universidad' } as any);
            }
          }
      }
      
      if (!selectedGrado || (typeof usuario.grado === 'object' && usuario.grado?._id !== selectedGrado._id)) {
          if (usuario.grado) {
            if (typeof usuario.grado === 'object') {
              setSelectedGrado(usuario.grado as Grado);
            } else {
              setSelectedGrado({ _id: usuario.grado, nombre: 'Grado' } as any);
            }
          }
      }

      if (usuario.asignaturas) {
        setUserAsignaturas(usuario.asignaturas);
      }
    }
  }, [usuario]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await uploadImage(file);
      setFormData(prev => ({ ...prev, avatarUrl: res.url }));

      } catch (error: any) {
          const msg =
          error.response?.data?.message ||
          error.message ||
          'Error al contactar con el servidor';

          setAlert({
              type: 'error',
              title: 'Error al subir imagen',
              message: msg
          });
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación: Solo bloqueamos si hay una universidad nueva seleccionada sin grado
    // Pero si el usuario ya tenía datos parciales o no quiere poner nada, dejamos pasar.
    if (selectedUni && !selectedGrado && selectedUni.nombre !== 'Universidad guardada') {
        setAlert({
            type: 'error',
            title: 'Información incompleta',
            message: 'Si seleccionas una nueva universidad, por favor selecciona también su grado correspondiente.'
        });
        return;
    }

    try {
      setSavingProfile(true);
      const dataToSave = {
        ...formData,
        universidad: selectedUni?._id,
        grado: selectedGrado?._id
      };
      
      const updatedUser = await updateProfile(dataToSave);
      
      // Sincronización forzada tras guardado exitoso
      if (updatedUser) {
        if (updatedUser.universidad) {
          setSelectedUni(typeof updatedUser.universidad === 'object' ? updatedUser.universidad : { _id: updatedUser.universidad, nombre: selectedUni?.nombre || 'Universidad' } as any);
        }
        if (updatedUser.grado) {
          setSelectedGrado(typeof updatedUser.grado === 'object' ? updatedUser.grado : { _id: updatedUser.grado, nombre: selectedGrado?.nombre || 'Grado' } as any);
        }
        setUserAsignaturas(updatedUser.asignaturas || []);
      }

      setAlert({
        type: 'success',
        title: t('edit_profile.save_success_title') || '¡Éxito!',
        message: t('edit_profile.save_success_msg') || 'Tu perfil se ha actualizado correctamente.'
      });

      setTimeout(() => {
        navigate("/profile");
      }, 1500);

      } catch (error: any) {
          const msg =
          error.response?.data?.message ||
          error.message ||
          'Error al contactar con el servidor';

          setAlert({
              type: 'error',
              title: 'Error al guardar cambios',
              message: msg
          });
    } finally {
        setSavingProfile(false);
    }
  };

  const handleAcademicSelect = (uni: Universidad, grado: Grado) => {
    console.log('Recibida selección académica en EditProfile:', uni, grado);
    setSelectedUni(uni);
    setSelectedGrado(grado);
    
    setAlert({
        type: 'info',
        title: 'Cambio Académico detectado',
        message: `Has seleccionado: ${uni.nombre} - ${grado.nombre}. Recuerda guardar los cambios para aplicarlos.`
    });
  };

  const handleUserUpdated = (updatedUser: any) => {
    // sincroniza UI tras editar asignaturas
    setUserAsignaturas(updatedUser.asignaturas || []);
    localStorage.setItem("usuario", JSON.stringify(updatedUser));
  };

  return (
    <div className="edit-profile-wrapper">
      {alert && (
        <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert(null)}
        />
      )}
      <Navbar usuario={usuario || undefined} />
      <div className="main-layout">
        <Sidebar aria-label="Navegación principal" />
        <div className="content-area">
          <main className="edit-form-container">
            <h1 className="page-title-modern">{t('edit_profile.title')}</h1>
            <form onSubmit={handleSubmit} className="univy-glass-form">
              {/* AVATAR */}
              <div className="avatar-preview-section">
                <div 
                  className="avatar-edit-circle clickable"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 size={32} className="animate-spin" />
                  ) : formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="avatar-img-full" />
                  ) : (
                    formData.nombre?.charAt(0).toUpperCase() || "?"
                  )}
                  <div className="avatar-overlay-icon">
                    <Camera size={20} />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                />
              </div>
              {/* NOMBRE */}
              <div className="form-group-modern">
                <label>{t('edit_profile.label_name')}</label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* EMAIL */}
              <div className="form-group-modern">
                <label>{t('edit_profile.label_email')}</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* DESCRIPCIÓN */}
              <div className="form-group-modern">
                <label>{t('edit_profile.label_bio')}</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  placeholder={t('edit_profile.placeholder_bio')}
                  style={{ resize: "vertical", minHeight: "80px" }}
                />
              </div>

              {/* SECCIÓN ACADÉMICA UNIFICADA */}
              <div className="academic-edit-section">
                <h2 className="section-title-modern">Información Académica</h2>
                
                <div className="academic-unified-card">
                    <div className="academic-details-grid">
                        <div className="academic-detail-item">
                            <div className="detail-icon"><Library size={20} /></div>
                            <div className="detail-info">
                                <label>Universidad</label>
                                <p>{selectedUni?.nombre || 'No seleccionada'}</p>
                            </div>
                        </div>

                        <div className="academic-detail-item">
                            <div className="detail-icon"><GraduationCap size={20} /></div>
                            <div className="detail-info">
                                <label>Grado</label>
                                <p className={!selectedGrado?.nombre || selectedGrado?.nombre === 'No seleccionado' ? 'text-error-highlight' : ''}>
                                    {selectedGrado?.nombre || 'No seleccionado'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="button" 
                        className="change-academic-btn-centered"
                        onClick={() => setAcademicModalOpen(true)}
                    >
                        Cambiar Universidad o Grado
                    </button>

                    <div className="academic-divider"></div>

                    <div className="subjects-section-inside">
                        <div className="subjects-header">
                            <label>Mis Asignaturas</label>
                            <button
                                type="button"
                                className="small-edit-link"
                                onClick={() => setModalOpen(true)}
                            >
                                Gestionar
                            </button>
                        </div>
                        
                        <div className="subjects-chips-container">
                            {userAsignaturas.length > 0 ? (
                                userAsignaturas.map((asig: any) => (
                                    <span key={asig._id || asig} className="subject-chip">
                                        {typeof asig === 'object' ? asig.nombre : 'Cargando...'}
                                    </span>
                                ))
                            ) : (
                                <p className="no-subjects-text">No has seleccionado ninguna asignatura aún.</p>
                            )}
                        </div>
                    </div>
                </div>
              </div>
              {/* BOTONES */}
              {/* Privacidad */}
              <div className="form-group-modern switch-group">
                <label className="switch-label">
                  <div className="switch-text">{t('edit_profile.label_privacy')}</div>
                  <div className="univy-switch">
                    <input
                      type="checkbox"
                      name="privado"
                      checked={formData.privado}
                      onChange={(e) => setFormData(prev => ({ ...prev, privado: e.target.checked }))}
                    />
                    <span className="slider round"></span>
                  </div>
                </label>
                <p className="field-help">{t('edit_profile.privacy_help')}</p>
              </div>
              {/* Buttons */}
              <div className="form-actions-modern">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate("/profile")}
                >
                  {t('edit_profile.cancel')}
                </button>
                <button
                  type="submit"
                  className="save-btn-premium"
                  disabled={loading || uploading || savingProfile}
                >
                  {loading || uploading || savingProfile ? (
                    <span className="btn-loading-flex">
                      <Loader2 size={18} className="animate-spin" />
                      {t('edit_profile.saving')}
                    </span>
                  ) : t('edit_profile.save')}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
      {/* MODAL ASIGNATURAS */}
      {usuario && (
        <AsignaturasModal
          gradoId={typeof selectedGrado === 'object' ? selectedGrado?._id : (selectedGrado || "")}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onUpdated={handleUserUpdated}
        />
      )}

      {/* MODAL ACADÉMICO */}
      <AcademicSelectorModal
        open={academicModalOpen}
        onClose={() => setAcademicModalOpen(false)}
        onSelect={handleAcademicSelect}
        initialUni={selectedUni}
        initialGrado={selectedGrado}
      />
    </div>
  );
};
export default EditProfile;
