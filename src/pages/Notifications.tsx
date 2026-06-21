import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import useUser from '../hooks/useUser';
import notificationService from '../services/notification';
import type { Notification } from '../services/notification';
import { acceptFollowRequest, rejectFollowRequest, toggleFollow } from '../services/usuario';
import { useSocket } from '../context/SocketContext';
import { Heart, MessageCircle, UserPlus, Clock, Check, X, Bell, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { useGlobalAlert } from '../context/AlertContext';
import { es, ca, enUS } from 'date-fns/locale';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { usuario, refreshUser } = useUser();
  const { setNotificationCount } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { showAlert } = useGlobalAlert();
  const [followStatuses, setFollowStatuses] = useState<Record<string, string>>({});

  const getDateLocale = () => {
    if (i18n.language.startsWith('ca')) return ca;
    if (i18n.language.startsWith('en')) return enUS;
    return es;
  };

  const handleNotificationClick = (n: Notification) => {
    if (n.type.startsWith('follow')) {
      navigate(`/profile/${n.sender._id}`);
    } else if (n.post) {
      const ownerId = n.post.usuario;
      navigate(`/profile/${ownerId}?post=${n.post._id}`);
    }
  };

  useEffect(() => {
    if (usuario?.seguidos) {
      const initial: Record<string, string> = {};
      usuario.seguidos.forEach((id: any) => {
        const idStr = typeof id === 'string' ? id : id._id;
        initial[idStr] = 'ACCEPTED';
      });
      setFollowStatuses(initial);
    }
  }, [usuario]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications(1, 50);
      const uniqueNotifications = res.data.docs.filter(
        (notif: Notification, index: number, self: Notification[]) =>
          index === self.findIndex((n) => n._id === notif._id),
      );
      setNotifications(uniqueNotifications);
      setNotificationCount(0);
      await notificationService.markAllAsRead();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || t('notifications.server_error');
      showAlert(t('notifications.error_title'), errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    refreshUser();
  }, []);

  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;

    socket.on('new_notification', () => {
      fetchNotifications();
    });

    return () => {
      socket.off('new_notification');
    };
  }, [socket]);

  const handleAccept = async (followerId: string, notificationId: string) => {
    if (processingId) return;
    setProcessingId(notificationId);

    try {
      await acceptFollowRequest(followerId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, type: 'follow' as any } : n)),
      );
      await refreshUser();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || t('notifications.server_error');
      showAlert(t('notifications.error_title'), errorMsg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (followerId: string, notificationId: string) => {
    if (processingId) return;
    setProcessingId(notificationId);

    try {
      await rejectFollowRequest(followerId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || t('notifications.server_error');
      showAlert(t('notifications.error_title'), errorMsg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleFollowBack = async (targetId: string, notificationId: string) => {
    if (processingId) return;
    setProcessingId(notificationId);

    try {
      const res = await toggleFollow(targetId);
      const newStatus = res.data.status;

      setFollowStatuses((prev) => ({
        ...prev,
        [targetId]: newStatus || 'NONE',
      }));

      await refreshUser();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || t('notifications.server_error');
      showAlert(t('notifications.error_title'), errorMsg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
      case 'like_comment':
        return <Heart size={16} fill="#ef4444" color="#ef4444" />;
      case 'comment':
        return <MessageCircle size={16} fill="#3b82f6" color="#3b82f6" />;
      case 'follow':
      case 'follow_request':
        return <UserPlus size={16} color="#a78bfa" />;
      case 'follow_accepted':
        return <Check size={16} color="#10b981" />;
      case 'match':
        return <Heart size={16} fill="#f59e0b" color="#f59e0b" />;
      default:
        return null;
    }
  };

  const getMessage = (n: Notification) => {
    switch (n.type) {
      case 'like':
        return t('notifications.type.like');
      case 'like_comment':
        return t('notifications.type.like_comment');
      case 'comment':
        return t('notifications.type.comment') + (n.post?.caption || '');
      case 'follow':
        return t('notifications.type.follow');
      case 'follow_request':
        return t('notifications.type.follow_request');
      case 'follow_accepted':
        return t('notifications.type.follow_accepted');
      case 'match':
        return t('notifications.type.match');
      default:
        return '';
    }
  };

  return (
    <div className="notifications-wrapper">
      <Navbar usuario={usuario || undefined} />

      <div className="main-layout">
        <Sidebar />

        <div className="content-area">
          <main className="notifications-container">
            <header className="notifications-header">
              <h1>{t('notifications.title')}</h1>
            </header>

            {loading ? (
              <div className="state-message">{t('notifications.loading')}</div>
            ) : notifications.length > 0 ? (
              <div className="notifications-list">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`notification-item ${n.isRead ? '' : 'unread'} ${processingId === n._id ? 'processing' : ''} ${n.type === 'match' ? 'match' : ''}`}
                    onClick={() => handleNotificationClick(n)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="notification-avatar">
                      {n.sender.avatarUrl ? (
                        <img src={n.sender.avatarUrl} alt={n.sender.nombre} />
                      ) : (
                        <div className="avatar-placeholder">
                          {n.sender.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="notification-type-badge">{getIcon(n.type)}</div>
                    </div>

                    <div className="notification-content">
                      <p>
                        <span className="sender-name">{n.sender.nombre}</span> {getMessage(n)}
                      </p>
                      <span className="notification-time">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                          locale: getDateLocale(), // Utiliza el helper corregido aquí
                        })}
                      </span>
                    </div>

                    {n.type === 'follow_request' ? (
                      <div className="notification-actions">
                        {processingId === n._id ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <>
                            <button
                              className="accept-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccept(n.sender._id, n._id);
                              }}
                              disabled={!!processingId}
                            >
                              <Check size={18} />
                              <span>{t('notifications.confirm')}</span>
                            </button>
                            <button
                              className="reject-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(n.sender._id, n._id);
                              }}
                              disabled={!!processingId}
                            >
                              <X size={18} />
                              <span>{t('notifications.reject')}</span>
                            </button>
                          </>
                        )}
                      </div>
                    ) : n.type === 'follow' ? (
                      <div className="notification-actions">
                        {processingId === n._id ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <button
                            className={`follow-back-btn ${
                              followStatuses[n.sender._id] === 'ACCEPTED'
                                ? 'following'
                                : followStatuses[n.sender._id] === 'PENDING'
                                  ? 'pending'
                                  : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowBack(n.sender._id, n._id);
                            }}
                            disabled={!!processingId}
                          >
                            {followStatuses[n.sender._id] === 'ACCEPTED' ? (
                              <>
                                <Check size={16} />
                                <span>{t('profile.following')}</span>
                              </>
                            ) : followStatuses[n.sender._id] === 'PENDING' ? (
                              <>
                                <Clock size={16} />
                                <span>{t('profile.pending')}</span>
                              </>
                            ) : (
                              <>
                                <UserPlus size={16} />
                                <span>{t('notifications.follow_back')}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      n.post && (
                        <div className="notification-post-preview">
                          <img src={n.post.imageUrl} alt="Preview" />
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-notifications">
                <Bell size={48} opacity={0.3} />
                <h3>{t('notifications.empty_title')}</h3>
                <p>{t('notifications.empty_subtitle')}</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
