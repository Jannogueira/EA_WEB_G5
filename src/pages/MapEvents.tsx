import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUser from "../hooks/useUser";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapEvents.css";
import { MapPin, Calendar, Users, Plus, Trash2, X, Navigation, Award, PlusCircle } from "lucide-react";
import type { Evento } from "../models/evento";
import type { Usuario } from "../models/usuario";
import eventoService from "../services/evento";

// Helper para calcular la distancia en metros entre dos puntos
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const MapEvents: React.FC = () => {
  const { t } = useTranslation();
  const { usuario } = useUser();
  const { theme } = useTheme();

  // Estados
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Ubicación del usuario
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  // Evento seleccionado para ver detalles
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  
  // Modo creación
  const [isCreating, setIsCreating] = useState(false);
  const [tempCoords, setTempCoords] = useState<[number, number] | null>(null);
  
  // Formulario de creación
  const [formTitulo, setFormTitulo] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formFecha, setFormFecha] = useState("");
  const [formUbicacionNombre, setFormUbicacionNombre] = useState("");
  const [formMaxAsistentes, setFormMaxAsistentes] = useState<number | "">("");

  // Refs de Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const tempMarkerRef = useRef<L.Marker | null>(null);

  // 1. Obtener ubicación del usuario al cargar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
        },
        (error) => {
          console.warn("Error getting geolocation:", error);
          // Fallback a Barcelona (UPC FIB)
          setUserLocation([41.3892, 2.1130]);
          setErrorMsg(t("map_events.error_location"));
          setTimeout(() => setErrorMsg(null), 5000);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserLocation([41.3892, 2.1130]);
    }
  }, [t]);

  // 2. Cargar eventos de la API real filtrando por proximidad
  const fetchEventos = async (coords?: [number, number]) => {
    setLoading(true);
    const center = coords || userLocation || [41.3892, 2.1130];
    
    try {
      const { request } = eventoService.getAll({ lat: center[0], lng: center[1] });
      const response = await request;
      setEventos(response.data);
    } catch (err) {
      console.error("Error loading events from backend API:", err);
      setErrorMsg("Error al conectar con el servidor para cargar los eventos");
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      fetchEventos(userLocation);
    }
  }, [userLocation]);

  // 3. Inicializar Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || !userLocation) return;

    if (!mapRef.current) {
      // Inicializar mapa
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false // Quitamos los botones por defecto para posicionar los nuestros
      }).setView(userLocation, 15);

      // Añadir control de zoom premium abajo a la derecha
      L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

      // Evento de clic en el mapa para marcar coordenadas
      mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        // Solo si estamos en modo creación
        setIsCreating((prevIsCreating) => {
          if (prevIsCreating) {
            setTempCoords([lat, lng]);
          }
          return prevIsCreating;
        });
      });
    } else {
      // Si la ubicación cambia, reposicionar mapa
      mapRef.current.setView(userLocation);
    }

    return () => {
      // Limpieza no requerida para el ciclo normal a menos que se desmonte completamente
    };
  }, [userLocation]);

  // 4. Actualizar capas de mapa (tiles) según el tema (Claro / Oscuro)
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const tileUrl =
      theme === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(mapRef.current);
  }, [theme, userLocation]);

  // 5. Renderizar Marcador de Ubicación del Usuario
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userLocation);
    } else {
      const userIcon = L.divIcon({
        html: `
          <div class="user-location-marker">
            <div class="marker-dot"></div>
            <div class="marker-pulse-glow"></div>
          </div>
        `,
        className: "custom-div-icon",
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      userMarkerRef.current = L.marker(userLocation, { icon: userIcon })
        .addTo(mapRef.current)
        .bindTooltip(t("sidebar.home") || "Tú estás aquí", { permanent: false, direction: "top" });
    }
  }, [userLocation, t]);

  // 6. Renderizar Marcadores de Eventos
  useEffect(() => {
    if (!mapRef.current) return;

    // Limpiar marcadores obsoletos
    Object.keys(markersRef.current).forEach((id) => {
      if (!eventos.some((ev) => ev._id === id)) {
        mapRef.current?.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    // Añadir o actualizar marcadores
    eventos.forEach((ev) => {
      const lat = ev.location.coordinates[1];
      const lng = ev.location.coordinates[0];
      const isSelected = selectedEvento?._id === ev._id;

      const eventIcon = L.divIcon({
        html: `
          <div class="custom-event-marker ${isSelected ? "selected-marker" : ""}">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <div class="pulse-ring"></div>
          </div>
        `,
        className: "custom-div-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      if (markersRef.current[ev._id]) {
        markersRef.current[ev._id].setLatLng([lat, lng]);
        markersRef.current[ev._id].setIcon(eventIcon);
      } else {
        const marker = L.marker([lat, lng], { icon: eventIcon })
          .addTo(mapRef.current!)
          .on("click", () => {
            setSelectedEvento(ev);
            setIsCreating(false);
          });
        markersRef.current[ev._id] = marker;
      }
    });
  }, [eventos, selectedEvento]);

  // 7. Renderizar Marcador Temporal de Creación
  useEffect(() => {
    if (!mapRef.current) return;

    if (tempMarkerRef.current) {
      mapRef.current.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }

    if (isCreating && tempCoords) {
      const tempIcon = L.divIcon({
        html: `
          <div class="temp-event-marker">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
        `,
        className: "custom-div-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      tempMarkerRef.current = L.marker(tempCoords, { icon: tempIcon }).addTo(mapRef.current);
      mapRef.current.panTo(tempCoords);
    }
  }, [isCreating, tempCoords]);

  // Funciones de acción del usuario
  const handleMapClickPrompt = () => {
    setIsCreating(true);
    setSelectedEvento(null);
    if (userLocation) {
      setTempCoords([userLocation[0] + 0.0005, userLocation[1] + 0.0005]);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempCoords || !formTitulo || !formDesc || !formFecha || !formUbicacionNombre) return;

    const [lat, lng] = tempCoords;

    const nuevoEventoData = {
      titulo: formTitulo,
      descripcion: formDesc,
      fecha: new Date(formFecha).toISOString(),
      ubicacionNombre: formUbicacionNombre,
      lat,
      lng,
      maxAsistentes: formMaxAsistentes === "" ? null : Number(formMaxAsistentes)
    };

    try {
      const response = await eventoService.createEvento(nuevoEventoData);
      setEventos((prev) => [...prev, response.data]);
      setSelectedEvento(response.data);
      
      // Resetear formulario
      setFormTitulo("");
      setFormDesc("");
      setFormFecha("");
      setFormUbicacionNombre("");
      setFormMaxAsistentes("");
      setIsCreating(false);
      setTempCoords(null);
    } catch (err: any) {
      console.error("Error creating event:", err);
      const errMsg = err.response?.data?.message || "Error al crear el evento en el servidor";
      setErrorMsg(errMsg);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const handleAsistir = async (evento: Evento) => {
    try {
      const response = await eventoService.asistirEvento(evento._id);
      
      // Actualizar estado local
      setEventos((prev) =>
        prev.map((ev) => (ev._id === evento._id ? response.data : ev))
      );
      setSelectedEvento(response.data);
    } catch (err: any) {
      console.error("Error toggling attendance:", err);
      const errMsg = err.response?.data?.message || "Error al actualizar la asistencia al evento";
      setErrorMsg(errMsg);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const handleDeleteEvento = async (eventoId: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar este evento?")) return;

    try {
      await eventoService.deleteEvento(eventoId);
      setEventos((prev) => prev.filter((ev) => ev._id !== eventoId));
      setSelectedEvento(null);
    } catch (err: any) {
      console.error("Error deleting event:", err);
      const errMsg = err.response?.data?.message || "Error al eliminar el evento";
      setErrorMsg(errMsg);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  // Ayudantes de visualización
  const centerOnEvent = (ev: Evento) => {
    const lat = ev.location.coordinates[1];
    const lng = ev.location.coordinates[0];
    mapRef.current?.setView([lat, lng], 16);
    setSelectedEvento(ev);
    setIsCreating(false);
  };

  const sortedEventos = [...eventos]
    .map((ev) => {
      const distance = userLocation
        ? getDistance(
            userLocation[0],
            userLocation[1],
            ev.location.coordinates[1],
            ev.location.coordinates[0]
          )
        : 999999;
      return { ...ev, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  const getCreatorName = (creador: any) => {
    if (!creador) return "Anónimo";
    return typeof creador === "string" ? creador : creador.nombre || "Usuario";
  };

  const getCreatorAvatar = (creador: any) => {
    if (!creador || typeof creador === "string") {
      return "https://api.dicebear.com/7.x/avataaars/png?seed=anonymous";
    }
    return creador.avatarUrl || "https://api.dicebear.com/7.x/avataaars/png?seed=avatar";
  };

  const currentUserId = usuario?._id || "local-user";
  const isJoined = (evento: Evento) => {
    return evento.asistentes.some(
      (asist) => (typeof asist === "string" ? asist : asist._id) === currentUserId
    );
  };

  return (
    <div className="map-events-wrapper">
      <Navbar usuario={usuario || undefined} />

      <div className="main-layout">
        <Sidebar />

        <div className="content-area">
          <div className="map-dashboard-container">
            {errorMsg && (
              <div className="map-toast-error">
                <Navigation size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* MAP SECTION (LEFT) */}
            <div className="map-view-section">
              <div ref={mapContainerRef} className="leaflet-map-element" />
              
              <button 
                className={`floating-create-trigger ${isCreating ? "active" : ""}`}
                onClick={isCreating ? () => { setIsCreating(false); setTempCoords(null); } : handleMapClickPrompt}
                title={isCreating ? t("map_events.form_cancel") : t("map_events.create_btn")}
              >
                {isCreating ? <X size={24} /> : <Plus size={24} />}
              </button>
            </div>

            {/* DETAILS & LIST SECTION (RIGHT) */}
            <div className="map-side-panel">
              {/* Cargar datos */}
              {loading && eventos.length === 0 ? (
                <div className="side-panel-loader">
                  <div className="spinner"></div>
                  <p>{t("map_events.loading")}</p>
                </div>
              ) : isCreating ? (
                /* FORMULARIO CREAR EVENTO */
                <div className="side-panel-card creation-card-form">
                  <div className="card-header">
                    <h2>{t("map_events.form_title")}</h2>
                    <button className="close-btn" onClick={() => { setIsCreating(false); setTempCoords(null); }}>
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="form-helper-alert">
                    <Navigation size={16} />
                    <p>{t("map_events.form_click_map")}</p>
                  </div>

                  <form onSubmit={handleCreateSubmit} className="premium-form-element">
                    <div className="form-group-item">
                      <label>{t("map_events.form_title_label")} *</label>
                      <input
                        type="text"
                        required
                        value={formTitulo}
                        onChange={(e) => setFormTitulo(e.target.value)}
                        placeholder="Ej: Repaso de Álgebra"
                      />
                    </div>

                    <div className="form-group-item">
                      <label>{t("map_events.form_desc_label")} *</label>
                      <textarea
                        required
                        rows={3}
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        placeholder="Describe de qué tratará el evento, qué hay que llevar..."
                      />
                    </div>

                    <div className="form-group-row">
                      <div className="form-group-item">
                        <label>{t("map_events.form_date_label")} *</label>
                        <input
                          type="datetime-local"
                          required
                          value={formFecha}
                          onChange={(e) => setFormFecha(e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group-item">
                        <label>{t("map_events.form_max_attendees")}</label>
                        <input
                          type="number"
                          min={1}
                          value={formMaxAsistentes}
                          onChange={(e) => setFormMaxAsistentes(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="Sin límite"
                        />
                      </div>
                    </div>

                    <div className="form-group-item">
                      <label>{t("map_events.form_loc_label")} *</label>
                      <input
                        type="text"
                        required
                        value={formUbicacionNombre}
                        onChange={(e) => setFormUbicacionNombre(e.target.value)}
                        placeholder="Ej: Biblioteca 2º piso / Parque Ciutadella"
                      />
                    </div>

                    <div className="form-group-item">
                      <label>Coordenadas del evento</label>
                      <div className="coords-display">
                        <MapPin size={16} />
                        <span>
                          {tempCoords
                            ? `${tempCoords[0].toFixed(5)}, ${tempCoords[1].toFixed(5)}`
                            : "Haz clic en el mapa para marcar"}
                        </span>
                      </div>
                    </div>

                    <div className="form-actions-buttons">
                      <button type="button" className="cancel-form-btn" onClick={() => { setIsCreating(false); setTempCoords(null); }}>
                        {t("map_events.form_cancel")}
                      </button>
                      <button type="submit" className="submit-form-btn" disabled={!tempCoords}>
                        {t("map_events.form_submit")}
                      </button>
                    </div>
                  </form>
                </div>
              ) : selectedEvento ? (
                /* DETALLE EVENTO SELECCIONADO */
                <div className="side-panel-card event-details-card">
                  <div className="card-header">
                    <span className="event-badge">Evento</span>
                    <button className="close-btn" onClick={() => setSelectedEvento(null)}>
                      <X size={18} />
                    </button>
                  </div>

                  <h2 className="detail-event-title">{selectedEvento.titulo}</h2>
                  
                  <div className="detail-meta-list">
                    <div className="detail-meta-item">
                      <Calendar size={18} className="meta-icon" />
                      <span>{new Date(selectedEvento.fecha).toLocaleString()}</span>
                    </div>

                    <div className="detail-meta-item">
                      <MapPin size={18} className="meta-icon" />
                      <span>{selectedEvento.ubicacionNombre}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <p className="detail-description">{selectedEvento.descripcion}</p>
                  </div>

                  <div className="detail-separator"></div>

                  <div className="creator-profile-info">
                    <img 
                      src={getCreatorAvatar(selectedEvento.creador)} 
                      alt="Creador" 
                      className="creator-avatar"
                    />
                    <div className="creator-text">
                      <span className="creator-label">{t("map_events.details_created_by")}</span>
                      <span className="creator-name">{getCreatorName(selectedEvento.creador)}</span>
                    </div>
                  </div>

                  <div className="attendees-section">
                    <div className="attendees-header-count">
                      <Users size={18} />
                      <h3>
                        {t("map_events.details_attendees")} ({selectedEvento.asistentes.length}
                        {selectedEvento.maxAsistentes ? ` / ${selectedEvento.maxAsistentes}` : ""})
                      </h3>
                    </div>

                    {selectedEvento.asistentes.length === 0 ? (
                      <p className="no-attendees-text">Nadie se ha apuntado todavía. ¡Sé el primero!</p>
                    ) : (
                      <div className="attendees-avatars-grid">
                        {selectedEvento.asistentes.map((asist, idx) => {
                          const name = typeof asist === "string" ? "Usuario" : asist.nombre;
                          const avatar = typeof asist === "string" ? "https://api.dicebear.com/7.x/avataaars/png?seed=user" : asist.avatarUrl;
                          return (
                            <div key={idx} className="attendee-avatar-wrapper" title={name}>
                              <img src={avatar} alt={name} className="attendee-small-avatar" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="event-action-buttons">
                    <button
                      className={`join-toggle-btn ${isJoined(selectedEvento) ? "joined" : ""}`}
                      onClick={() => handleAsistir(selectedEvento)}
                      disabled={
                        !isJoined(selectedEvento) &&
                        !!selectedEvento.maxAsistentes &&
                        selectedEvento.asistentes.length >= selectedEvento.maxAsistentes
                      }
                    >
                      {isJoined(selectedEvento) ? t("map_events.details_leave") : t("map_events.details_join")}
                    </button>

                    {((typeof selectedEvento.creador === "string"
                      ? selectedEvento.creador === currentUserId
                      : selectedEvento.creador?._id === currentUserId) ||
                      usuario?.rol === "admin") && (
                      <button className="delete-event-btn" onClick={() => handleDeleteEvento(selectedEvento._id)}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* LISTA DE EVENTOS ORDENADOS POR CERCANÍA */
                <div className="side-panel-card list-events-card">
                  <div className="card-header-with-action">
                    <div>
                      <h2>{t("map_events.list_title")}</h2>
                      <span className="events-count-pill">{eventos.length}</span>
                    </div>
                    <button className="inline-create-btn" onClick={handleMapClickPrompt}>
                      <PlusCircle size={18} />
                      <span>{t("map_events.create_btn")}</span>
                    </button>
                  </div>

                  <div className="events-list-scrollable">
                    {sortedEventos.length === 0 ? (
                      <div className="empty-list-display">
                        <MapPin size={40} className="empty-icon" />
                        <p>{t("map_events.list_empty")}</p>
                      </div>
                    ) : (
                      sortedEventos.map((ev) => {
                        const joined = isJoined(ev);
                        const isCreator = typeof ev.creador === "string"
                          ? ev.creador === currentUserId
                          : ev.creador?._id === currentUserId;
                        
                        return (
                          <div 
                            key={ev._id} 
                            className={`event-list-item ${selectedEvento?._id === ev._id ? "active" : ""}`}
                            onClick={() => centerOnEvent(ev)}
                          >
                            <div className="item-main-content">
                              <h3 className="item-title">{ev.titulo}</h3>
                              <p className="item-desc">{ev.descripcion}</p>
                              
                              <div className="item-metadata">
                                <span className="item-distance">
                                  <Navigation size={12} />
                                  {ev.distance < 1000 ? `${ev.distance}m` : `${(ev.distance / 1000).toFixed(1)}km`}
                                </span>
                                <span className="item-date">
                                  <Calendar size={12} />
                                  {new Date(ev.fecha).toLocaleDateString()}
                                </span>
                                <span className="item-attendees">
                                  <Users size={12} />
                                  {ev.asistentes.length}
                                </span>
                              </div>
                            </div>

                            <div className="item-indicators">
                              {joined && <span className="joined-indicator" title="Asistirás">✓</span>}
                              {isCreator && <span className="creator-indicator" title="Tú lo creaste">★</span>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapEvents;
