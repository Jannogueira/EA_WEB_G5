import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { getContacts, getConversation } from '../services/chat';
import type { Message, ChatContact } from '../models/message';

export default function useChat(currentUserId: string) {
  const { socket } = useSocket();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [typingUserName, setTypingUserName] = useState<string | null>(null);

  // Cargar contactos mutuos y grupales
  useEffect(() => {
    getContacts().then((res) => setContacts(res.data));
  }, []);

  // Escuchar eventos del socket global
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: Message) => {
      if (!activeContact) return;
      const msgGroupId = msg.grupo
        ? typeof msg.grupo === 'string'
          ? msg.grupo
          : (msg.grupo as any)._id
        : null;
      const senderId = msg.remitente
        ? typeof msg.remitente === 'string'
          ? msg.remitente
          : msg.remitente._id
        : '';

      if (activeContact.isGroup) {
        if (msgGroupId === activeContact._id) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        }
      } else {
        if (!msgGroupId && (senderId === activeContact._id || senderId === currentUserId)) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        }
      }
    };

    const handleMessageSent = (msg: Message) => {
      if (activeContact && !activeContact.isGroup) {
        const destId = msg.destinatario
          ? typeof msg.destinatario === 'string'
            ? msg.destinatario
            : msg.destinatario._id
          : '';
        if (destId === activeContact._id) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        }
      }
    };

    let typingTimeout: any;

    const handleTyping = ({
      userId,
      userName,
      grupoId,
    }: {
      userId: string;
      userName?: string;
      grupoId?: string;
    }) => {
      if (activeContact) {
        if (activeContact.isGroup) {
          if (grupoId === activeContact._id) {
            setTypingUserId(userId);
            setTypingUserName(userName || null);
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
              setTypingUserId(null);
              setTypingUserName(null);
            }, 3000);
          }
        } else {
          if (userId === activeContact._id) {
            setTypingUserId(userId);
            setTypingUserName(null);
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
              setTypingUserId(null);
              setTypingUserName(null);
            }, 3000);
          }
        }
      }
    };

    const handleStopTyping = ({ userId, grupoId }: { userId: string; grupoId?: string }) => {
      if (activeContact) {
        if (activeContact.isGroup) {
          if (grupoId === activeContact._id && typingUserId === userId) {
            setTypingUserId(null);
            setTypingUserName(null);
          }
        } else {
          if (userId === activeContact._id) {
            setTypingUserId(null);
            setTypingUserName(null);
          }
        }
      }
      clearTimeout(typingTimeout);
    };

    const handleMessagesDeleted = ({
      messageIds,
      type,
      grupoId,
    }: {
      messageIds: string[];
      type: 'me' | 'everyone';
      grupoId?: string;
    }) => {
      if (activeContact) {
        if (activeContact.isGroup && grupoId !== activeContact._id) return;
      }
      setMessages((prev) =>
        prev
          .map((msg) => {
            if (messageIds.includes(msg._id)) {
              if (type === 'everyone') {
                return {
                  ...msg,
                  contenido: 'El mensaje ha sido eliminado',
                  eliminadoParaTodos: true,
                };
              }
              return { ...msg, _hidden: true };
            }
            return msg;
          })
          .filter((msg) => !(msg as any)._hidden),
      );
    };

    const handleMessageUpdated = (msg: Message) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    socket.on('messages_deleted', handleMessagesDeleted);
    socket.on('message_updated', handleMessageUpdated);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
      socket.off('messages_deleted', handleMessagesDeleted);
      socket.off('message_updated', handleMessageUpdated);
      clearTimeout(typingTimeout);
    };
  }, [socket, activeContact, currentUserId, typingUserId]);

  // Cargar historial al cambiar de contacto
  const openConversation = useCallback(async (contact: ChatContact | null) => {
    setActiveContact(contact);
    if (!contact) {
      setMessages([]);
      return;
    }
    setMessages([]);
    setLoadingHistory(true);
    try {
      const res = await getConversation(contact._id);
      setMessages(res.data);
    } catch (err) {
      // Error
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(
    (contenido: string, parentMessageId?: string) => {
      if (!activeContact || !socket || (!contenido.trim() && !parentMessageId)) return;
      socket.emit('send_message', {
        destinatarioId: activeContact._id,
        contenido: contenido.trim(),
        parentMessageId,
        isGroup: activeContact.isGroup,
      });
    },
    [activeContact, socket],
  );

  // Emitir evento "typing"
  const emitTyping = useCallback(() => {
    if (!activeContact || !socket) return;
    socket.emit('typing', { destinatarioId: activeContact._id, isGroup: activeContact.isGroup });
  }, [activeContact, socket]);

  // Emitir evento "stop_typing"
  const emitStopTyping = useCallback(() => {
    if (!activeContact || !socket) return;
    socket.emit('stop_typing', {
      destinatarioId: activeContact._id,
      isGroup: activeContact.isGroup,
    });
  }, [activeContact, socket]);

  // Eliminar mensaje
  const deleteMessage = useCallback(
    (messageId: string, type: 'me' | 'everyone') => {
      if (!socket || !activeContact) return;
      socket.emit('delete_messages', {
        messageIds: [messageId],
        type,
        destinatarioId: activeContact._id,
        isGroup: activeContact.isGroup,
      });
    },
    [socket, activeContact],
  );

  // Reaccionar a un mensaje
  const reactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      if (!socket || !activeContact) return;
      socket.emit('react_message', {
        messageId,
        emoji,
        destinatarioId: activeContact._id,
        isGroup: activeContact.isGroup,
      });
    },
    [socket, activeContact],
  );

  return {
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
    emitStopTyping,
    deleteMessage,
    reactToMessage,
  };
}
