import React, { useState, useEffect } from 'react';
import { CheckCircle, Star, Trophy, Heart, Zap, Target } from 'lucide-react';
import '../styles/animations.css';

const MotivationalFeedback = ({ 
  visible, 
  message, 
  type = 'success', // 'success', 'progress', 'encouragement', 'milestone'
  onClose,
  autoClose = true,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300); // Esperar a que termine la animación
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [visible, autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8" />;
      case 'progress':
        return <Zap className="w-8 h-8" />;
      case 'encouragement':
        return <Heart className="w-8 h-8" />;
      case 'milestone':
        return <Trophy className="w-8 h-8" />;
      default:
        return <Star className="w-8 h-8" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'progress':
        return 'from-blue-500 to-indigo-600';
      case 'encouragement':
        return 'from-pink-500 to-rose-600';
      case 'milestone':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-purple-500 to-indigo-600';
    }
  };

  const getMotivationalMessage = () => {
    const messages = {
      success: [
        '¡Excelente trabajo! 🎉',
        '¡Lo lograste! 💪',
        '¡Fantástico! ✨',
        '¡Bien hecho! 🌟',
        '¡Increíble! 🚀'
      ],
      progress: [
        '¡Vas por buen camino! 📈',
        '¡Sigue así! 💫',
        '¡Progreso fantástico! ⚡',
        '¡Cada paso cuenta! 👣',
        '¡No te detengas! 🔥'
      ],
      encouragement: [
        '¡Tú puedes! 💙',
        '¡Sigue adelante! 🌈',
        '¡Eres increíble! ⭐',
        '¡Confía en ti! 💝',
        '¡Nunca te rindas! 🦋'
      ],
      milestone: [
        '¡Hito alcanzado! 🏆',
        '¡Gran logro! 🎯',
        '¡Meta cumplida! 🎊',
        '¡Objetivo logrado! 🏁',
        '¡Éxito total! 👑'
      ]
    };

    const typeMessages = messages[type] || messages.success;
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  };

  if (!visible) return null;

  return (
    <div className={`
      fixed top-20 right-4 z-40 transform transition-all duration-300 ease-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        bg-gradient-to-r ${getColor()} text-white
        rounded-lg shadow-2xl p-4 max-w-sm
        animate-slide-in-top
      `}>
        <div className="flex items-center space-x-3">
          <div className="animate-bounce-in">
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {getMotivationalMessage()}
            </p>
            {message && (
              <p className="text-white/90 text-xs mt-1">
                {message}
              </p>
            )}
          </div>
          
          {!autoClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MotivationalFeedback;