import React, { useEffect, useState } from "react";
import "./Notifications.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUser from "../hooks/useUser";
import notificationService from "../services/notification";
import type { Notification } from "../services/notification";
import { acceptFollowRequest, rejectFollowRequest } from "../services/usuario";
import { useSocket } from "../context/SocketContext";
import { Heart, MessageCircle, UserPlus, Clock, Check, X, Bell, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import Alert from '../components/Alert';
import type { AlertState } from '../components/Alert';
import { es, ca } from "date-fns/locale";

const Notifications: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { usuario } = useUser();
    const { setNotificationCount } = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [alert, setAlert] = useState<AlertState | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await notificationService.getNotifications(1, 50);
                // Prevenir duplicados (validación requerida)
                const uniqueNotifications = res.data.docs.filter(
                    (notif: Notification, index: number, self: Notification[]) =>
                        index === self.findIndex((n) => n._id === notif._id)
                );
                setNotifications(uniqueNotifications);
                setNotificationCount(0); // Reset count when viewing
                await notificationService.markAllAsRead();
            } catch (error: any) {
                const errorMsg = 
                error.response?.data?.message ||
                "Error al conectar con el servidor";
                
                setAlert({
                    type: 'error',
                    title: 'Error al cargar notificaciones',
                    message: errorMsg
                });

            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []); // Ejecutar solo al montar el componente

    const handleAccept = async (followerId: string, notificationId: string) => {
        if (processingId) return;
        setProcessingId(notificationId);
        
        try {
            await acceptFollowRequest(followerId);
            // Sincronización tras 200 OK
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        } catch (error: any) {
                const errorMsg = 
                error.response?.data?.message ||
                "Error al conectar con el servidor";
                
                setAlert({
                    type: 'error',
                    title: 'Acción fallida',
                    message: errorMsg
                });

        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (followerId: string, notificationId: string) => {
        if (processingId) return;
        setProcessingId(notificationId);

        try {
            await rejectFollowRequest(followerId);
            // Sincronización tras 200 OK
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        } catch (error: any) {
                const errorMsg = 
                error.response?.data?.message ||
                "Error al conectar con el servidor";
                
                setAlert({
                    type: 'error',
                    title: 'Acción fallida',
                    message: errorMsg
                });
        } finally {
            setProcessingId(null);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "like": return <Heart size={16} fill="#ef4444" color="#ef4444" />;
            case "comment": return <MessageCircle size={16} fill="#3b82f6" color="#3b82f6" />;
            case "follow":
            case "follow_request": return <UserPlus size={16} color="#a78bfa" />;
            case "follow_accepted": return <Check size={16} color="#10b981" />;
            default: return null;
        }
    };

    const getMessage = (n: Notification) => {
        switch (n.type) {
            case "like": return t('notifications.type.like');
            case "comment": return t('notifications.type.comment') + (n.post?.caption || "");
            case "follow": return t('notifications.type.follow');
            case "follow_request": return t('notifications.type.follow_request');
            case "follow_accepted": return t('notifications.type.follow_accepted');
            default: return "";
        }
    };

    return (
        <div className="notifications-wrapper">

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
                                    <div key={n._id} className={`notification-item ${n.isRead ? "" : "unread"} ${processingId === n._id ? "processing" : ""}`}>
                                        <div className="notification-avatar">
                                            {n.sender.avatarUrl ? (
                                                <img src={n.sender.avatarUrl} alt={n.sender.nombre} />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {n.sender.nombre.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="notification-type-badge">
                                                {getIcon(n.type)}
                                            </div>
                                        </div>

                                        <div className="notification-content">
                                            <p>
                                                <span className="sender-name">{n.sender.nombre}</span>{" "}
                                                {getMessage(n)}
                                            </p>
                                            <span className="notification-time">
                                                <Clock size={12} />
                                                {formatDistanceToNow(new Date(n.createdAt), { 
                                                    addSuffix: true, 
                                                    locale: i18n.language.startsWith('ca') ? ca : es 
                                                })}
                                            </span>
                                        </div>

                                        {n.type === "follow_request" ? (
                                            <div className="notification-actions">
                                                {processingId === n._id ? (
                                                    <Loader2 className="animate-spin" size={20} />
                                                ) : (
                                                    <>
                                                        <button 
                                                            className="accept-btn"
                                                            onClick={() => handleAccept(n.sender._id, n._id)}
                                                            disabled={!!processingId}
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button 
                                                            className="reject-btn"
                                                            onClick={() => handleReject(n.sender._id, n._id)}
                                                            disabled={!!processingId}
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ) : n.post && (
                                            <div className="notification-post-preview">
                                                <img src={n.post.imageUrl} alt="Preview" />
                                            </div>
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
