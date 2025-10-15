import React, { useState, useEffect } from 'react';
import '../styles/animations.css';

const AchievementNotification = ({ 
  achievement, 
  visible, 
  onClose,
  type = 'achievement' // 'achievement', 'success', 'milestone'
}) => {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowParticles(true);
      const timer = setTimeout(() => {
        setShowParticles(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const getAchievementIcon = () => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'success':
        return '✅';
      case 'milestone':
        return '🌟';
      default:
        return '🎉';
    }
  };

  const getAchievementColor = () => {
    switch (type) {
      case 'achievement':
        return 'from-yellow-400 to-orange-500';
      case 'success':
        return 'from-green-400 to-emerald-500';
      case 'milestone':
        return 'from-purple-400 to-pink-500';
      default:
        return 'from-blue-400 to-indigo-500';
    }
  };

  if (!visible || !achievement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="animate-bounce-in">
        <div className={`
          relative bg-gradient-to-r ${getAchievementColor()} 
          text-white rounded-xl p-8 max-w-md mx-4 text-center
          shadow-2xl animate-pulse-glow
        `}>
          {/* Partículas de celebración */}
          {showParticles && (
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`particle animate-sparkle`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Contenido principal */}
          <div className="relative z-10">
            <div className="text-6xl mb-4 animate-heartbeat">
              {getAchievementIcon()}
            </div>
            
            <h2 className="text-2xl font-bold mb-2">
              ¡Logro Desbloqueado!
            </h2>
            
            <h3 className="text-xl font-semibold mb-3">
              {achievement.nombre || achievement.title}
            </h3>
            
            <p className="text-white/90 mb-6">
              {achievement.descripcion || achievement.description}
            </p>

            <button
              onClick={onClose}
              className="
                bg-white/20 hover:bg-white/30 
                text-white font-medium py-2 px-6 rounded-lg
                transition-all duration-200 button-press
                backdrop-blur-sm border border-white/30
              "
            >
              ¡Genial!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;