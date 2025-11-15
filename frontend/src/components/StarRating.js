import React, { useState, useEffect } from 'react';
import { Star, MessageCircle } from 'lucide-react';

const StarRating = ({ empleoId, calificacionUsuario, onCalificar, readonly = false }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [showComentario, setShowComentario] = useState(false);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (calificacionUsuario) {
      setRating(calificacionUsuario.calificacion || 0);
      setComentario(calificacionUsuario.comentario || '');
    }
  }, [calificacionUsuario]);

  const handleRating = (value) => {
    if (readonly) return;
    
    setRating(value);
    if (value > 0) {
      setShowComentario(true);
    }
  };

  const handleConfirmar = async () => {
    if (enviando) return;
    
    setEnviando(true);
    try {
      await onCalificar(empleoId, rating, comentario);
      setShowComentario(false);
    } catch (error) {
      console.error('Error confirmando calificación:', error);
    } finally {
      setEnviando(false);
    }
  };

  const handleCancelar = () => {
    setShowComentario(false);
    setRating(0);
    setComentario('');
  };

  const opcionesComentario = [
    { value: 'nada', label: '💭 Nada - Sin comentarios adicionales', emoji: '💭' },
    { value: 'excelente', label: '⭐ Excelente - Oportunidad excepcional', emoji: '⭐' },
    { value: 'bueno', label: '👍 Bueno - Buena oferta laboral', emoji: '👍' },
    { value: 'regular', label: '➖ Regular - Oferta promedio', emoji: '➖' },
    { value: 'malo', label: '👎 Malo - Podría mejorar', emoji: '👎' },
    { value: 'pésimo', label: '❌ Pésimo - No recomendado', emoji: '❌' }
  ];

  const getLabelComentario = (valor) => {
    return opcionesComentario.find(op => op.value === valor)?.label || valor;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500" />
        <span className="font-medium text-gray-900">
          {readonly ? 'Tu Calificación' : 'Calificar Oportunidad'}
        </span>
      </div>

      {/* Estrellas - SIN LABELS "Muy mala/Excelente" */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly || enviando}
            onClick={() => handleRating(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={`p-1 transition-all duration-200 ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } ${
              (hover || rating) >= star 
                ? 'text-yellow-400 transform scale-110' 
                : 'text-gray-300'
            } ${enviando ? 'opacity-50' : ''}`}
          >
            <Star 
              className={`w-8 h-8 ${
                (hover || rating) >= star ? 'fill-current' : ''
              }`}
            />
          </button>
        ))}
        
        {rating > 0 && (
          <span className="ml-3 text-lg font-semibold text-gray-700">
            {rating}/5
          </span>
        )}
      </div>

      {/* Selector de comentario */}
      {showComentario && !readonly && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <label className="block text-sm font-medium text-blue-700">
              ¿Cómo calificarías esta oportunidad?
            </label>
          </div>
          
          <select
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={enviando}
            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="">Selecciona un comentario...</option>
            {opcionesComentario.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleConfirmar}
              disabled={enviando}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {enviando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                'Confirmar Calificación'
              )}
            </button>
            <button
              onClick={handleCancelar}
              disabled={enviando}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Comentario actual */}
      {readonly && comentario && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">Tu comentario:</span>
          </div>
          <p className="text-green-700 mt-1 text-sm">
            {getLabelComentario(comentario)}
          </p>
          {calificacionUsuario?.fechaCalificacion && (
            <p className="text-green-600 text-xs mt-2">
              Calificado el {new Date(calificacionUsuario.fechaCalificacion).toLocaleDateString('es-ES')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;