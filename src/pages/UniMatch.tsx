import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import UniMatchWelcomeModal from '../components/UniMatchWelcomeModal';
import MatchModal from '../components/MatchModal';
import {
  discoverProfiles,
  recordSwipe,
  getMyPhotos,
  type DiscoverProfile,
} from '../services/unimatch';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUser from '../hooks/useUser';
import { useGlobalAlert } from '../context/AlertContext';
import './UniMatch.css';

const UniMatch: React.FC = () => {
  const { t } = useTranslation();
  const { usuario, refreshUser } = useUser();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { showAlert } = useGlobalAlert();

  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [swiping, setSwiping] = useState<'left' | 'right' | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [myFirstPhoto, setMyFirstPhoto] = useState<string>('');
  const [matchData, setMatchData] = useState<any>(null);
  const [dragOffset, setDragOffset] = useState(0);

  // Check if user has accepted terms
  useEffect(() => {
    if (usuario && !usuario.hasAcceptedUnimatchTerms) {
      setShowWelcome(true);
      setLoading(false);
    } else if (usuario) {
      loadProfiles();
      loadMyPhoto();
    }
  }, [usuario]);

  // Socket listener for real-time match
  useEffect(() => {
    if (!socket) return;

    const handleMatch = (data: any) => {
      setMatchData(data.matchedUser);
    };

    socket.on('unimatch_match', handleMatch);
    return () => {
      socket.off('unimatch_match', handleMatch);
    };
  }, [socket]);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showWelcome || matchData || swiping) return;
      if (currentIndex >= profiles.length) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipe('dislike');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipe('like');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showWelcome, matchData, swiping, currentIndex, profiles.length]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const res = await discoverProfiles(20);
      setProfiles(res.data);
      setCurrentIndex(0);
      setCurrentPhotoIndex(0);
    } catch (err: any) {
      showAlert(
        'Error',
        err.response?.data?.message || err.message || t('unimatch_page.error_loading_profiles'),
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMyPhoto = async () => {
    try {
      const res = await getMyPhotos();
      if (res.data.length > 0) {
        setMyFirstPhoto(res.data[0].imageUrl);
      } else if (usuario?.avatarUrl) {
        setMyFirstPhoto(usuario.avatarUrl);
      }
    } catch (err: any) {
      if (usuario?.avatarUrl) setMyFirstPhoto(usuario.avatarUrl);
    }
  };

  const handleSwipe = useCallback(
    async (type: 'like' | 'dislike') => {
      if (swiping || currentIndex >= profiles.length) return;

      const profile = profiles[currentIndex];
      setSwiping(type === 'like' ? 'right' : 'left');

      try {
        const res = await recordSwipe(profile._id, type);

        // If match detected from API response (in case socket doesn't fire)
        if (res.data.matched && !matchData) {
          setMatchData({
            _id: profile._id,
            nombre: profile.nombre,
            avatarUrl: profile.avatarUrl,
            unimatchPhoto: profile.unimatchPhotos?.[0]?.imageUrl || profile.avatarUrl,
          });
        }
      } catch (err: any) {
        showAlert(
          'Error',
          err.response?.data?.message || err.message || t('unimatch_page.error_swiping'),
          'error',
        );
      }

      // Wait for animation to finish
      setTimeout(() => {
        setSwiping(null);
        setDragOffset(0);
        setCurrentPhotoIndex(0);

        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          // If running low on profiles relative to the upcoming index, load more
          if (nextIndex >= profiles.length - 3) {
            loadProfiles();
          }
          return nextIndex;
        });
      }, 400);
    },
    [swiping, currentIndex, profiles, matchData, t, showAlert],
  );

  const handleWelcomeComplete = async () => {
    setShowWelcome(false);
    await refreshUser();
    loadProfiles();
    loadMyPhoto();
  };

  const handlePhotoNav = () => {
    if (currentIndex >= profiles.length) return;
    const totalPhotos = profiles[currentIndex].unimatchPhotos.length;
    if (totalPhotos <= 1) return;

    setCurrentPhotoIndex((prev) => (prev + 1) % totalPhotos);
  };

  // Touch/Drag handling
  const handlePointerDown = (e: React.PointerEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startTime = Date.now();
    const card = e.currentTarget as HTMLElement;

    card.setPointerCapture(e.pointerId);

    const handleMove = (moveEvent: PointerEvent) => {
      const diff = moveEvent.clientX - startX;
      setDragOffset(diff);
    };

    const handleUp = (upEvent: PointerEvent) => {
      card.removeEventListener('pointermove', handleMove);
      card.removeEventListener('pointerup', handleUp);
      card.releasePointerCapture(e.pointerId);

      const duration = Date.now() - startTime;
      const deltaX = upEvent.clientX - startX;
      const deltaY = upEvent.clientY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Si es un toque rápido y corto, es un cambio de foto
      if (distance < 10 && duration < 300) {
        setDragOffset(0);
        handlePhotoNav();
        return;
      }

      if (Math.abs(dragOffset) > 100) {
        handleSwipe(dragOffset > 0 ? 'like' : 'dislike');
      } else {
        setDragOffset(0);
      }
    };

    card.addEventListener('pointermove', handleMove);
    card.addEventListener('pointerup', handleUp);
  };

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];
  const thirdProfile = profiles[currentIndex + 2];

  const showFeedback = Math.abs(dragOffset) > 40;

  // Matching logic for highlights
  const myUniId =
    typeof usuario?.universidad === 'string'
      ? usuario.universidad
      : (usuario?.universidad as any)?._id;
  const isMatchingUni = currentProfile && myUniId === currentProfile.universidad?._id;

  const myGradoId =
    typeof usuario?.grado === 'string' ? usuario.grado : (usuario?.grado as any)?._id;
  const isMatchingDegree = currentProfile && myGradoId === currentProfile.grado?._id;

  const myAsigIds =
    usuario?.asignaturas?.map((a) => (typeof a === 'string' ? a : (a as any)._id)) || [];
  const commonSubjects =
    currentProfile?.asignaturas?.filter((a) => myAsigIds.includes(a._id)) || [];

  return (
    <>
      <Navbar />
      <div className="main-layout">
        <Sidebar />
        <div className="content-area">
          <div className="unimatch-page">
            <div className="unimatch-header">
              <h1>
                <span className="fire-icon">🔥</span>
                <span className="unimatch-gradient-text">UniMatch</span>
              </h1>
            </div>

            {loading ? (
              <div className="unimatch-loading">
                <div className="unimatch-loading-spinner" />
                <p>{t('unimatch_page.loading')}</p>
              </div>
            ) : !currentProfile ? (
              <div className="unimatch-empty">
                <div className="empty-icon">🎓</div>
                <h3>{t('unimatch_page.empty_title')}</h3>
                <p>
                  {t('unimatch_page.empty_subtitle')}
                  <br />
                  {t('unimatch_page.empty_sub_notice')}
                </p>
              </div>
            ) : (
              <>
                <div className="card-stack">
                  {/* Background cards for stack effect */}
                  {thirdProfile && (
                    <div className="swipe-card card-behind-2">
                      <div className="card-image-container">
                        <img
                          src={thirdProfile.unimatchPhotos[0]?.imageUrl || thirdProfile.avatarUrl}
                          alt=""
                          className="card-image"
                        />
                      </div>
                    </div>
                  )}

                  {nextProfile && (
                    <div className="swipe-card card-behind-1">
                      <div className="card-image-container">
                        <img
                          src={nextProfile.unimatchPhotos[0]?.imageUrl || nextProfile.avatarUrl}
                          alt=""
                          className="card-image"
                        />
                      </div>
                    </div>
                  )}

                  {/* Active card */}
                  <div
                    className={`swipe-card card-front ${swiping === 'left' ? 'swiping-left' : ''} ${swiping === 'right' ? 'swiping-right' : ''}`}
                    style={
                      !swiping
                        ? {
                            transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
                          }
                        : undefined
                    }
                    onPointerDown={handlePointerDown}
                  >
                    <div className="card-image-container">
                      {/* Photo indicators */}
                      {currentProfile.unimatchPhotos.length > 1 && (
                        <div className="photo-indicators">
                          {currentProfile.unimatchPhotos.map((_, i) => (
                            <div
                              key={i}
                              className={`photo-indicator ${i === currentPhotoIndex ? 'active' : ''}`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Photo nav zone (click anywhere to next) */}
                      <div className="photo-nav-zones">
                        <div className="photo-nav-zone full" onClick={handlePhotoNav} />
                      </div>

                      <img
                        src={
                          currentProfile.unimatchPhotos[currentPhotoIndex]?.imageUrl ||
                          currentProfile.avatarUrl
                        }
                        alt={currentProfile.nombre}
                        className="card-image"
                        draggable={false}
                      />

                      {/* Swipe feedback */}
                      <div
                        className={`swipe-feedback like-feedback ${showFeedback && dragOffset > 0 ? 'visible' : ''}`}
                      >
                        LIKE
                      </div>
                      <div
                        className={`swipe-feedback dislike-feedback ${showFeedback && dragOffset < 0 ? 'visible' : ''}`}
                      >
                        NOPE
                      </div>

                      <div className="card-image-overlay">
                        <div className="card-name">{currentProfile.nombre}</div>
                        {currentProfile.descripcion && (
                          <div
                            style={{
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.85rem',
                              marginTop: '4px',
                            }}
                          >
                            {currentProfile.descripcion}
                          </div>
                        )}
                        <div className="card-tags">
                          {currentProfile.universidad && (
                            <span
                              className={`card-tag uni ${isMatchingUni ? 'highlight-match' : ''}`}
                            >
                              🏫 {currentProfile.universidad.nombre}
                            </span>
                          )}
                          {currentProfile.grado && (
                            <span
                              className={`card-tag grado ${isMatchingDegree ? 'highlight-match' : ''}`}
                            >
                              📚 {currentProfile.grado.nombre}
                            </span>
                          )}
                          {commonSubjects.map((a) => (
                            <span key={a._id} className="card-tag asig highlight-match">
                              📖 {a.nombre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="swipe-buttons">
                  <button
                    className="swipe-btn dislike"
                    onClick={() => handleSwipe('dislike')}
                    disabled={!!swiping}
                  >
                    ✕
                  </button>
                  <button
                    className="swipe-btn like"
                    onClick={() => handleSwipe('like')}
                    disabled={!!swiping}
                  >
                    ❤️
                  </button>
                </div>

                <div className="keyboard-hint">
                  <span className="key-badge">←</span> {t('unimatch_page.hint_pass')}
                  <span style={{ margin: '0 0.5rem' }}>|</span>
                  <span className="key-badge">→</span> {t('unimatch_page.hint_like')}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showWelcome && (
        <UniMatchWelcomeModal
          onComplete={handleWelcomeComplete}
          onClose={() => navigate('/home')}
        />
      )}

      {matchData && (
        <MatchModal
          matchedUser={matchData}
          myPhoto={myFirstPhoto}
          onClose={() => setMatchData(null)}
        />
      )}
    </>
  );
};

export default UniMatch;
