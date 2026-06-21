import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Universidad.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import useUser from '../hooks/useUser';
import universidadService from '../services/universidad';
import { getContacts } from '../services/chat';
import {
  GraduationCap,
  MapPin,
  Users,
  Search,
  MessageSquare,
  Plus,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGlobalAlert } from '../context/AlertContext';

const Universidad: React.FC = () => {
  const { t } = useTranslation();
  const { usuario } = useUser();
  const navigate = useNavigate();
  const [universidades, setUniversidades] = useState<any[]>([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUniId, setExpandedUniId] = useState<string | null>(null);
  const { showAlert } = useGlobalAlert();

  // Fetch universities and user's joined chats
  const fetchData = async () => {
    try {
      setLoading(true);
      const [uniRes, contactsRes] = await Promise.all([
        universidadService.getAll({ limit: 100 }).request,
        getContacts(),
      ]);
      setUniversidades(uniRes.data.docs || []);

      // Extract IDs of all group chats the user is currently in
      const groupIds = (contactsRes.data || [])
        .filter((c: any) => c.isGroup)
        .map((c: any) => c._id);
      setJoinedGroupIds(groupIds);
    } catch (err: any) {
      showAlert(
        t('common.error'),
        err.message || t('alerts.universities_page.error_loading'),
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter universities based on search term
  const filteredUnis = useMemo(() => {
    return universidades.filter(
      (uni) =>
        uni.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [universidades, searchTerm]);

  // Join University General Chat
  const handleJoinChat = async (e: React.MouseEvent, uniId: string) => {
    e.stopPropagation();
    try {
      await universidadService.joinChat(uniId);
      showAlert(
        t('alerts.universities_page.join_success_title'),
        t('alerts.universities_page.join_success_msg'),
        'success',
      );
      fetchData(); // reload
    } catch (err: any) {
      showAlert(
        t('common.error'),
        err.response?.data?.message || err.message || t('alerts.universities_page.join_error'),
        'error',
      );
    }
  };

  // Leave University General Chat
  const handleLeaveChat = async (e: React.MouseEvent, uniId: string) => {
    e.stopPropagation();
    try {
      await universidadService.leaveChat(uniId);
      showAlert(
        t('alerts.universities_page.leave_success_title'),
        t('alerts.universities_page.leave_success_msg'),
        'success',
      );
      fetchData();
    } catch (err: any) {
      showAlert(
        t('common.error'),
        err.response?.data?.message || err.message || t('alerts.universities_page.leave_error'),
        'error',
      );
    }
  };

  const handleGoToChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/messages');
  };

  return (
    <div className="uni-page-wrapper">
      <Navbar usuario={usuario || undefined} />

      <div className="uni-main-layout">
        <Sidebar />

        <div className="uni-content-area">
          <div className="uni-feed-container">
            <header className="uni-page-header">
              <h1>{t('universities_page.title')}</h1>
              <p>{t('universities_page.subtitle')}</p>
            </header>

            <div className="uni-search-section">
              <div className="uni-search-box">
                <Search size={20} className="uni-search-icon" />
                <input
                  type="text"
                  placeholder={t('universities_page.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="uni-loading-state">
                <div className="uni-spinner" />
                <p>{t('universities_page.loading_state')}</p>
              </div>
            ) : filteredUnis.length === 0 ? (
              <div className="uni-empty-state">
                <GraduationCap size={64} className="uni-empty-icon" />
                <p>{t('universities_page.empty_state')}</p>
              </div>
            ) : (
              <div className="uni-grid">
                {filteredUnis.map((uni) => {
                  const isJoined = uni.chatGeneral && joinedGroupIds.includes(uni.chatGeneral);
                  const isExpanded = expandedUniId === uni._id;

                  return (
                    <div
                      key={uni._id}
                      className={`uni-card ${isExpanded ? 'expanded' : ''} ${isJoined ? 'joined-state' : ''}`}
                      onClick={() => setExpandedUniId(isExpanded ? null : uni._id)}
                    >
                      <div className="uni-card-header-row">
                        <div className="uni-card-icon-container">
                          <GraduationCap size={28} />
                        </div>
                        {isJoined && (
                          <span className="uni-joined-tag">
                            {t('universities_page.member_tag')}
                          </span>
                        )}
                      </div>

                      <div className="uni-card-body">
                        <h2>{uni.nombre}</h2>
                        <div className="uni-card-meta">
                          <span className="uni-meta-item">
                            <MapPin size={14} />
                            {uni.ubicacion}
                          </span>
                          <span className="uni-meta-item">
                            <Users size={14} />
                            {t('universities_page.members_count', {
                              count: uni.numIntegrantes || 0,
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Expandable actions area using modern CSS transition trick */}
                      <div className="uni-card-expand-area">
                        <div>
                          {isJoined ? (
                            <div className="uni-card-buttons">
                              <button className="uni-btn-action primary" onClick={handleGoToChat}>
                                <MessageSquare size={16} />
                                <span>{t('universities_page.btn_go_to_chat')}</span>
                                <ArrowRight size={14} className="arrow-right-icon" />
                              </button>
                              <button
                                className="uni-btn-action danger"
                                onClick={(e) => handleLeaveChat(e, uni._id)}
                              >
                                <LogOut size={16} />
                                <span>{t('universities_page.btn_leave_chat')}</span>
                              </button>
                            </div>
                          ) : (
                            <div className="uni-card-buttons">
                              <button
                                className="uni-btn-action success"
                                onClick={(e) => handleJoinChat(e, uni._id)}
                              >
                                <Plus size={16} />
                                <span>{t('universities_page.btn_join_chat')}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Universidad;
