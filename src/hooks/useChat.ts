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
      // Solo añadir si es de la conversación activa o si yo soy el remitente (confirmación)
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
        
        // Limpiar el indicador automáticamente después de 3 segundos de inactividad
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

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
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
      // Error manejado en la página
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback((contenido: string) => {
    if (!activeContact || !socket || !contenido.trim()) return;
    socket.emit('send_message', {
      destinatarioId: activeContact._id,
      contenido: contenido.trim(),
    });
  }, [activeContact, socket]);

  // Emitir evento "typing"
  const emitTyping = useCallback(() => {
    if (!activeContact || !socket) return;
    socket.emit('typing', { destinatarioId: activeContact._id });
  }, [activeContact, socket]);

  return {
    contacts,
    activeContact,
    messages,
    loadingHistory,
    typingUserId,
    openConversation,
    sendMessage,
    emitTyping,
  };
}
