import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Messages.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import useUser from '../hooks/useUser';
import useChat from '../hooks/useChat';
import { useSocket } from '../context/SocketContext';
import { Send, User, MessageCircle, Search, X, Trash2, Smile, Reply, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChatContact } from '../models/message';
import { getFollowing } from '../services/usuario';
import { createGroupChat } from '../services/chat';

const Messages: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { usuario } = useUser();

  // Helpers safe for remitente checks
  const getSenderId = (msg: any) => {
    if (!msg || !msg.remitente) return '';
    return typeof msg.remitente === 'string' ? msg.remitente : msg.remitente._id || '';
  };

  const getSenderName = (msg: any) => {
    if (!msg || !msg.remitente) return '';
    return typeof msg.remitente === 'string' ? '' : msg.remitente.nombre || '';
  };

  const getSenderAvatar = (msg: any) => {
    if (!msg || !msg.remitente) return '';
    return typeof msg.remitente === 'string' ? '' : msg.remitente.avatarUrl || '';
  };

  const getParentSenderName = (msg: any) => {
    if (!msg || !msg.parentMessage || !msg.parentMessage.remitente) return '';
    return typeof msg.parentMessage.remitente === 'string'
      ? ''
      : msg.parentMessage.remitente.nombre || '';
  };

  const { unreadCounts, markAsRead } = useSocket();
  const {
    contacts,
    setContacts,
    activeContact,
    messages,
    loadingHistory,
    typingUserId,
    typingUserName,
    openConversation,
    sendMessage,
    emitTyping,
    deleteMessage,
    reactToMessage,
  } = useChat(usuario?._id || '');

  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    messageId: string;
    isOwn: boolean;
  }>({
    isOpen: false,
    messageId: '',
    isOwn: false,
  });

  // States for group creation
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [followedUsers, setFollowedUsers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loadingFollowed, setLoadingFollowed] = useState(false);
  const [groupError, setGroupError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Al abrir una conversación, marcar como leído
  useEffect(() => {
    if (activeContact) {
      markAsRead(activeContact._id);
    }
  }, [activeContact, markAsRead]);

  // Cargar seguidos para el modal de grupo
  useEffect(() => {
    if (isGroupModalOpen && usuario?._id) {
      setLoadingFollowed(true);
      setGroupError('');
      getFollowing(usuario._id)
        .then((res) => {
          setFollowedUsers(res.data.seguidos || []);
        })
        .catch(() => {
          setGroupError(t('messages.group.error_loading_followed'));
        })
        .finally(() => {
          setLoadingFollowed(false);
        });
    } else {
      setFollowedUsers([]);
      setSelectedMembers([]);
      setGroupName('');
      setGroupError('');
    }
  }, [isGroupModalOpen, usuario?._id, t]);

  const handleToggleMember = (userId: string) => {
    setSelectedMembers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        if (prev.length >= 7) {
          return prev;
        }
        return [...prev, userId];
      }
    });
  };

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGroupError('');
    if (!groupName.trim()) {
      setGroupError(t('messages.group.error_name_required'));
      return;
    }
    const totalMiembros = selectedMembers.length + 1;
    if (totalMiembros < 3 || totalMiembros > 8) {
      setGroupError(t('messages.group.error_members_limit'));
      return;
    }

    try {
      const res = await createGroupChat(groupName.trim(), selectedMembers);
      const newGroup = {
        ...res.data,
        isGroup: true,
        unreadCount: 0,
      };
      setContacts((prev) => [newGroup, ...prev]);
      openConversation(newGroup);
      setIsGroupModalOpen(false);
    } catch (err: any) {
      setGroupError(err.response?.data?.message || t('messages.group.error_create'));
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage, replyingTo?._id);
    setInputMessage('');
    setReplyingTo(null);
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [contacts, searchTerm]);

  const handleDeleteClick = (msgId: string, isOwn: boolean) => {
    setDeleteModal({ isOpen: true, messageId: msgId, isOwn });
  };

  const confirmDelete = (type: 'me' | 'everyone') => {
    deleteMessage(deleteModal.messageId, type);
    setDeleteModal({ isOpen: false, messageId: '', isOwn: false });
  };

  return (
    <div className="messages-page-wrapper">
      <Navbar usuario={usuario || undefined} />

      <div className="chat-layout">
        <aside className="contacts-sidebar">
          <header className="contacts-header-search">
            <div className="search-container-premium">
              <Search size={18} className="search-icon-dim" />
              <input
                type="text"
                placeholder={t('messages.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </header>

          <div className="create-group-btn-container">
            <button
              type="button"
              className="create-group-trigger-btn"
              onClick={() => setIsGroupModalOpen(true)}
            >
              <Users size={16} />
              {t('messages.new_group')}
            </button>
          </div>

          <div className="contacts-list">
            {filteredContacts.map((contact) => (
              <div
                key={contact._id}
                className={`contact-item ${activeContact?._id === contact._id ? 'active' : ''}`}
                onClick={() => openConversation(contact)}
              >
                {contact.isGroup ? (
                  <div className="contact-avatar group-avatar-icon">
                    <Users size={22} />
                  </div>
                ) : (
                  <div
                    className="contact-avatar"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${contact._id}`);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={contact.avatarUrl} alt={contact.nombre} />
                  </div>
                )}

                <div className="contact-info">
                  <span className="contact-name">{contact.nombre}</span>
                  {contact.isGroup && (
                    <span className="group-subtitle-sidebar">
                      {contact.miembros?.length} {t('messages.members')}
                    </span>
                  )}
                </div>
                {unreadCounts[contact._id] > 0 && (
                  <div className="unread-badge">{unreadCounts[contact._id]}</div>
                )}
              </div>
            ))}
          </div>
        </aside>

        <main className={`chat-window ${activeContact ? 'active-on-mobile' : ''}`}>
          {activeContact ? (
            <>
              <header className="chat-header">
                <button className="mobile-back-btn" onClick={() => openConversation(null)}>
                  <X size={20} />
                </button>
                <div
                  className="active-contact-info"
                  onClick={() =>
                    !activeContact.isGroup && navigate(`/profile/${activeContact._id}`)
                  }
                  style={{ cursor: activeContact.isGroup ? 'default' : 'pointer' }}
                >
                  {activeContact.isGroup ? (
                    <div className="contact-avatar-small group-avatar-icon">
                      <Users size={20} />
                    </div>
                  ) : (
                    <div className="contact-avatar-small">
                      <img src={activeContact.avatarUrl} alt={activeContact.nombre} />
                    </div>
                  )}
                  <div>
                    <h3>{activeContact.nombre}</h3>
                    {activeContact.isGroup && (
                      <span className="group-badge">{t('messages.group_badge')}</span>
                    )}
                  </div>
                </div>
              </header>

              <div className="messages-list">
                {loadingHistory ? (
                  <div className="modal-empty">{t('messages.loading')}</div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg._id} id={msg._id} className="message-row">
                      <div
                        className={`message-wrapper ${getSenderId(msg) === usuario?._id ? 'own' : 'received'}`}
                      >
                        {getSenderId(msg) !== usuario?._id && (
                          <div
                            className="msg-sender-avatar"
                            onClick={() => navigate(`/profile/${getSenderId(msg)}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            <img src={getSenderAvatar(msg)} alt="" />
                          </div>
                        )}
                        <div
                          className={`message-bubble ${getSenderId(msg) === usuario?._id ? 'own' : 'received'} ${msg.eliminadoParaTodos ? 'deleted-msg' : ''} ${msg.post ? 'post-msg' : ''}`}
                        >
                          {activeContact.isGroup && getSenderId(msg) !== usuario?._id && (
                            <span className="group-member-name-chat">{getSenderName(msg)}</span>
                          )}
                          {msg.parentMessage && !msg.eliminadoParaTodos && (
                            <div
                              className="quoted-message-preview"
                              onClick={() => {
                                const el = document.getElementById(msg.parentMessage?._id);
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  el.classList.add('highlight-message');
                                  setTimeout(() => el.classList.remove('highlight-message'), 2000);
                                }
                              }}
                            >
                              <span className="quoted-author">{getParentSenderName(msg)}</span>
                              <p className="quoted-text">
                                {msg.parentMessage.eliminadoParaTodos
                                  ? t('messages.deleted')
                                  : msg.parentMessage.post
                                    ? '📷 ' +
                                      (msg.parentMessage.post.caption ||
                                        t('messages.shared_post_fallback'))
                                    : msg.parentMessage.contenido}
                              </p>
                            </div>
                          )}
                          {msg.eliminadoParaTodos ? (
                            t('messages.deleted')
                          ) : msg.post ? (
                            <div
                              className="shared-post-card"
                              onClick={() =>
                                navigate(
                                  `/profile/${msg.post?.usuario?._id}?postId=${msg.post?._id}`,
                                )
                              }
                            >
                              <div className="shared-post-header">
                                <img
                                  src={msg.post.usuario?.avatarUrl}
                                  alt=""
                                  className="shared-post-avatar"
                                />
                                <span>{msg.post.usuario?.nombre}</span>
                              </div>
                              {msg.post.imageUrl && (
                                <div className="shared-post-image">
                                  <img src={msg.post.imageUrl} alt="" />
                                </div>
                              )}
                              <div className="shared-post-caption">{msg.post.caption}</div>
                            </div>
                          ) : (
                            <div
                              className={
                                msg.contenido.includes('privada') ? 'private-msg-text' : ''
                              }
                            >
                              {msg.contenido}
                            </div>
                          )}

                          {/* REACCIONES ACTIVAS */}
                          {msg.reactions && msg.reactions.length > 0 && !msg.eliminadoParaTodos && (
                            <div className="message-reactions-container">
                              {Object.entries(
                                msg.reactions.reduce((acc: any, curr) => {
                                  acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                                  return acc;
                                }, {}),
                              ).map(([emoji, count]: any) => (
                                <div
                                  key={emoji}
                                  className={`reaction-badge ${msg.reactions?.some((r) => (typeof r.usuario === 'string' ? r.usuario : r.usuario._id) === usuario?._id && r.emoji === emoji) ? 'user-reacted' : ''}`}
                                  onClick={() => reactToMessage(msg._id, emoji)}
                                >
                                  <span>{emoji}</span>
                                  {count > 1 && <span className="reaction-count">{count}</span>}
                                </div>
                              ))}
                            </div>
                          )}

                          {!msg.eliminadoParaTodos && (
                            <div className="message-hover-actions">
                              <button className="msg-action-btn" onClick={() => setReplyingTo(msg)}>
                                <Reply size={14} />
                              </button>
                              <button
                                className="msg-action-btn"
                                onClick={() =>
                                  setActiveReactionPicker(
                                    activeReactionPicker === msg._id ? null : msg._id,
                                  )
                                }
                              >
                                <Smile size={14} />
                              </button>

                              <button
                                className="msg-action-btn"
                                onClick={() =>
                                  handleDeleteClick(msg._id, getSenderId(msg) === usuario?._id)
                                }
                              >
                                <Trash2 size={14} />
                              </button>

                              {/* PICKER DE EMOJIS */}
                              {activeReactionPicker === msg._id && (
                                <div className="emoji-mini-picker">
                                  {['❤️', '😂', '😮', '😢', '🔥', '👍'].map((emoji) => (
                                    <span
                                      key={emoji}
                                      onClick={() => {
                                        reactToMessage(msg._id, emoji);
                                        setActiveReactionPicker(null);
                                      }}
                                    >
                                      {emoji}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Indicador de escribiendo flotante */}
              {typingUserId && typingUserId !== usuario?._id && (
                <div className="typing-indicator-chat">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>
                    {activeContact.isGroup
                      ? t('messages.typing_group', {
                          name: typingUserName || t('messages.someone'),
                        })
                      : t('messages.typing_direct', { name: activeContact.nombre })}
                  </span>
                </div>
              )}

              {/* PREVIEW DE RESPUESTA */}
              {replyingTo && (
                <div className="reply-preview-container">
                  <div className="reply-preview-content">
                    <span className="reply-author">{getSenderName(replyingTo)}</span>
                    <p className="reply-text">{replyingTo.contenido}</p>
                  </div>
                  <button className="cancel-reply-btn" onClick={() => setReplyingTo(null)}>
                    <X size={18} />
                  </button>
                </div>
              )}

              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <div className="input-wrapper-premium">
                  <input
                    type="text"
                    placeholder={t('messages.placeholder')}
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      emitTyping();
                    }}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="send-btn-premium"
                    disabled={!inputMessage.trim()}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <MessageCircle size={100} color="rgba(167, 139, 250, 0.1)" />
              <h2>{t('messages.title')}</h2>
              <p>{t('messages.empty')}</p>
            </div>
          )}
        </main>
      </div>

      {/* Sidebar al final para asegurar que sus eventos de clic siempre tengan prioridad */}
      <Sidebar />

      {/* MODAL DE ELIMINACIÓN */}
      {deleteModal.isOpen && (
        <div
          className="delete-modal-overlay"
          onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        >
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('messages.delete_title')}</h3>
            <div className="delete-modal-actions">
              <button className="delete-option me" onClick={() => confirmDelete('me')}>
                {t('messages.delete_me')}
              </button>
              {deleteModal.isOwn && (
                <button
                  className="delete-option everyone"
                  onClick={() => confirmDelete('everyone')}
                >
                  {t('messages.delete_everyone')}
                </button>
              )}
              <button
                className="delete-option cancel"
                onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
              >
                {t('messages.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isGroupModalOpen && (
        <div className="group-modal-overlay" onClick={() => setIsGroupModalOpen(false)}>
          <div className="group-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="group-modal-header">
              <h3>{t('messages.group.create_title')}</h3>
              <span className="group-members-count">{selectedMembers.length + 1}/8</span>
            </div>

            <form onSubmit={handleCreateGroupSubmit}>
              <div className="group-form-group">
                <input
                  type="text"
                  id="group-name"
                  className="group-input"
                  placeholder={t('messages.group.name_placeholder')}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="group-form-group" style={{ marginTop: '8px' }}>
                {loadingFollowed ? (
                  <div className="group-loading">{t('messages.group.loading_followed')}</div>
                ) : followedUsers.length === 0 ? (
                  <div className="group-empty-state">{t('messages.group.no_followed')}</div>
                ) : (
                  <div className="member-selection-list">
                    {followedUsers.map((user) => {
                      const isSelected = selectedMembers.includes(user._id);
                      return (
                        <div
                          key={user._id}
                          className={`member-select-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleToggleMember(user._id)}
                        >
                          <div className="member-select-avatar">
                            <img src={user.avatarUrl} alt="" />
                          </div>
                          <span className="member-select-name">{user.nombre}</span>
                          <div className="member-select-checkbox" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {groupError && (
                <div className="group-rules-hint" style={{ marginTop: '8px' }}>
                  {groupError}
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="group-btn cancel"
                  onClick={() => setIsGroupModalOpen(false)}
                >
                  {t('messages.group.btn_cancel')}
                </button>
                <button
                  type="submit"
                  className="group-btn create"
                  disabled={
                    !groupName.trim() || selectedMembers.length < 2 || selectedMembers.length > 7
                  }
                >
                  {t('messages.group.btn_create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
