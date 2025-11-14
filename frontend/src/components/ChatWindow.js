import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function ChatWindow({ open, onClose, cuentaId, onPuntosActualizados }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const listRef = useRef(null);

  // Cargar historial al abrir
  useEffect(() => {
    if (!open || historyLoaded) return;
    
    const loadHistory = async () => {
      if (cuentaId && cuentaId !== 'guest-user') {
        try {
          const response = await fetch(`http://localhost:5000/api/chat/history/${cuentaId}`);
          const data = await response.json();
          
          if (data.success && data.messages) {
            setMessages(data.messages);
          }
        } catch (err) {
          console.error('Error cargando historial:', err);
        }
      }
      setHistoryLoaded(true);
    };
    
    loadHistory();
  }, [open, cuentaId, historyLoaded]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input || input.trim() === '') return;
    const texto = input.trim();
    setInput('');
    setMessages(prev => [...prev, { autor: 'user', texto, fecha: new Date() }]);
    setLoading(true);
    setTyping(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuentaId, texto })
      });
      
      const res = await response.json();
      
      if (res && res.success && res.aiMessage) {
        setMessages(prev => [...prev, { 
          autor: 'ai', 
          texto: res.aiMessage.texto, 
          fecha: res.aiMessage.fecha 
        }]);
        
        // Si completó un reto, actualizar puntos en el Dashboard
        if (res.retoCompletado && res.puntosGanados && onPuntosActualizados) {
          onPuntosActualizados(res.puntosGanados);
        }
      } else {
        throw new Error(res.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error enviando mensaje', err);
      setMessages(prev => [...prev, { 
        autor: 'ai', 
        texto: `Error: ${err.message}`, 
        fecha: new Date() 
      }]);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  if (!open) return null;

  const content = (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 99999 }} className="w-[92vw] sm:w-[380px] md:w-[520px] max-w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-primaryBrand-400">
        <div className="font-semibold text-white">Jobbie</div>
        <button onClick={onClose} aria-label="Cerrar chat" className="p-1 rounded hover:bg-primaryBrand-500">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      <div ref={listRef} className="h-72 sm:h-80 md:h-96 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-8">👋 ¡Hola! Soy Jobbie, tu asistente de Magneto X NextStep. ¿En qué puedo ayudarte hoy?</div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.autor === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-[85%] ${m.autor === 'user' ? 'bg-secondaryBrand-500 text-white' : 'bg-white text-gray-800 border shadow-sm'}`}>
              <div className="text-sm whitespace-pre-wrap break-words">{m.texto}</div>
              <div className={`text-xs mt-1 ${m.autor === 'user' ? 'text-secondaryBrand-100' : 'text-gray-400'}`}>
                {new Date(m.fecha).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-white text-gray-600 border shadow-sm">
              <div className="flex items-center gap-2 text-sm">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                <span className="ml-2">Escribiendo...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t bg-white flex items-center gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !loading) handleSend(); }}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-3 py-3 border rounded-lg text-sm focus:border-secondaryBrand-400 focus:ring-1 focus:ring-secondaryBrand-400"
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading} className="px-4 py-2 bg-secondaryBrand-500 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-secondaryBrand-600">
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
