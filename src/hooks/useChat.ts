import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { getContacts, getConversation } from '../services/chat.service';
import type { Message, ChatContact } from '../models/message';

export default function useChat(currentUserId: string) {
  const { socket } = useSocket();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);

  // Cargar contactos mutuos
  useEffect(() => {
    getContacts().then(res => setContacts(res.data));
  }, []);

  // Escuchar eventos del socket global
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: Message) => {
      if (activeContact && (msg.remitente._id === activeContact._id || msg.remitente._id === currentUserId)) {
        setMessages(prev => [...prev, msg]);
      }
    };

    const handleMessageSent = (msg: Message) => {
      if (activeContact && msg.destinatario._id === activeContact._id) {
        setMessages(prev => [...prev, msg]);
      }
    };

    let typingTimeout: any;

    const handleTyping = ({ userId }: { userId: string }) => {
      if (activeContact && userId === activeContact._id) {
        setTypingUserId(userId);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          setTypingUserId(null);
        }, 3000);
      }
    };

    const handleStopTyping = () => {
      setTypingUserId(null);
      clearTimeout(typingTimeout);
    };

    const handleMessagesDeleted = ({ messageIds, type }: { messageIds: string[], type: 'me' | 'everyone' }) => {
      setMessages(prev => prev.map(msg => {
        if (messageIds.includes(msg._id)) {
          if (type === 'everyone') {
            return { ...msg, contenido: 'El mensaje ha sido eliminado', eliminadoParaTodos: true };
          }
          return { ...msg, _hidden: true };
        }
        return msg;
      }).filter(msg => !(msg as any)._hidden));
    };

    const handleMessageUpdated = (msg: Message) => {
      setMessages(prev => prev.map(m => m._id === msg._id ? msg : m));
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
  }, [socket, activeContact, currentUserId]);

  // Cargar historial al cambiar de contacto
  const openConversation = useCallback(async (contact: ChatContact) => {
    setActiveContact(contact);
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
  const sendMessage = useCallback((contenido: string, parentMessageId?: string) => {
    if (!activeContact || !socket || (!contenido.trim() && !parentMessageId)) return;
    socket.emit('send_message', {
      destinatarioId: activeContact._id,
      contenido: contenido.trim(),
      parentMessageId
    });
  }, [activeContact, socket]);

  // Emitir evento "typing"
  const emitTyping = useCallback(() => {
    if (!activeContact || !socket) return;
    socket.emit('typing', { destinatarioId: activeContact._id });
  }, [activeContact, socket]);

  // Eliminar mensaje
  const deleteMessage = useCallback((messageId: string, type: 'me' | 'everyone') => {
    if (!socket || !activeContact) return;
    socket.emit('delete_messages', {
      messageIds: [messageId],
      type,
      destinatarioId: activeContact._id
    });
  }, [socket, activeContact]);

  // Reaccionar a un mensaje
  const reactToMessage = useCallback((messageId: string, emoji: string) => {
    if (!socket || !activeContact) return;
    socket.emit('react_message', {
      messageId,
      emoji,
      destinatarioId: activeContact._id
    });
  }, [socket, activeContact]);

  return {
    contacts,
    activeContact,
    messages,
    loadingHistory,
    typingUserId,
    openConversation,
    sendMessage,
    emitTyping,
    deleteMessage,
    reactToMessage,
  };
}
