import React, { useState, useCallback, createContext, useContext } from 'react';
import AchievementNotification from './AchievementNotification';
import MotivationalFeedback from './MotivationalFeedback';
import { useNotification } from './NotificationProvider';

// Crear contexto para el feedback
const FeedbackContext = createContext();

const FeedbackProvider = ({ children }) => {
  const [achievementVisible, setAchievementVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [motivationalVisible, setMotivationalVisible] = useState(false);
  const [motivationalData, setMotivationalData] = useState(null);
  const { showNotification } = useNotification();

  // Mostrar logro con animación completa
  const showAchievement = useCallback((achievement, type = 'achievement') => {
    setCurrentAchievement({ ...achievement, type });
    setAchievementVisible(true);
  }, []);

  // Cerrar logro
  const closeAchievement = useCallback(() => {
    setAchievementVisible(false);
    setCurrentAchievement(null);
  }, []);

  // Mostrar feedback motivacional
  const showMotivationalFeedback = useCallback((message, type = 'success', options = {}) => {
    const data = {
      message,
      type,
      autoClose: options.autoClose !== false,
      duration: options.duration || 3000
    };
    
    setMotivationalData(data);
    setMotivationalVisible(true);
  }, []);

  // Cerrar feedback motivacional
  const closeMotivationalFeedback = useCallback(() => {
    setMotivationalVisible(false);
    setMotivationalData(null);
  }, []);

  // Feedback para acciones exitosas
  const showSuccessFeedback = useCallback((message, options = {}) => {
    // Mostrar feedback motivacional
    showMotivationalFeedback(message, 'success', options);
    
    // También mostrar notificación si se especifica
    if (options.showNotification) {
      showNotification(message, options.notificationDuration || 3000);
    }
  }, [showMotivationalFeedback, showNotification]);

  // Feedback para progreso
  const showProgressFeedback = useCallback((message, options = {}) => {
    showMotivationalFeedback(message, 'progress', options);
  }, [showMotivationalFeedback]);

  // Feedback de ánimo
  const showEncouragementFeedback = useCallback((message, options = {}) => {
    showMotivationalFeedback(message, 'encouragement', options);
  }, [showMotivationalFeedback]);

  // Feedback para hitos
  const showMilestoneFeedback = useCallback((message, options = {}) => {
    showMotivationalFeedback(message, 'milestone', options);
  }, [showMotivationalFeedback]);

  // Feedback completo para cuando se desbloquea un logro
  const celebrateAchievement = useCallback((achievement, options = {}) => {
    // Primero mostrar el logro con animación
    showAchievement(achievement, options.type || 'achievement');
    
    // Luego mostrar notificación de backup
    const celebrationMessage = `🎉 ¡${achievement.nombre || achievement.title}! ${achievement.descripcion || achievement.description}`;
    
    setTimeout(() => {
      showNotification(celebrationMessage, options.notificationDuration || 5000);
    }, 2000); // Esperar a que termine la animación del logro
  }, [showAchievement, showNotification]);

  // Feedback para acciones de trabajo/empleo
  const showJobActionFeedback = useCallback((action, jobTitle) => {
    const messages = {
      applied: `¡Aplicación enviada a ${jobTitle}! 📧`,
      saved: `${jobTitle} guardado en favoritos 💾`,
      viewed: `Empleo visualizado ✓`,
      shared: `¡Empleo compartido! 🔗`
    };

    const message = messages[action] || '¡Acción completada!';
    showSuccessFeedback(message, { duration: 2500 });
  }, [showSuccessFeedback]);

  // Feedback para acciones de perfil
  const showProfileActionFeedback = useCallback((action) => {
    const messages = {
      updated: '¡Perfil actualizado correctamente! ✨',
      completed: '¡Perfil completado al 100%! 🌟',
      photo_uploaded: '¡Foto de perfil actualizada! 📸',
      skills_added: '¡Nuevas habilidades agregadas! 💪'
    };

    const message = messages[action] || '¡Acción completada!';
    showSuccessFeedback(message, { showNotification: true });
  }, [showSuccessFeedback]);

  // Feedback para eventos de racha
  const showStreakFeedback = useCallback((rachaInfo) => {
    const { tipoEvento, racha, rachaAnterior, mensaje } = rachaInfo;
    
    if (tipoEvento === 'incrementada') {
      // Racha incrementada - celebración
      const achievement = {
        title: `¡${racha.rachaActual} días seguidos! 🔥`,
        description: mensaje,
        icon: '🔥',
        type: 'streak'
      };
      
      // Mostrar logro para rachas especiales
      if (racha.rachaActual === 1 || racha.rachaActual === 3 || racha.rachaActual === 7 || 
          racha.rachaActual === 14 || racha.rachaActual === 30 || racha.rachaActual % 50 === 0) {
        celebrateAchievement(achievement);
      } else {
        showSuccessFeedback(mensaje, { duration: 3000, showNotification: true });
      }
    } else if (tipoEvento === 'reiniciada') {
      // Racha reiniciada - mensaje de ánimo
      showEncouragementFeedback(mensaje, { duration: 4000 });
    } else if (tipoEvento === 'nueva') {
      // Primera racha - bienvenida
      const achievement = {
        title: '¡Primera racha iniciada! 🌟',
        description: mensaje,
        icon: '🔥',
        type: 'first_streak'
      };
      celebrateAchievement(achievement);
    } else {
      // Racha mantenida
      showProgressFeedback(mensaje, { duration: 2000 });
    }
  }, [celebrateAchievement, showSuccessFeedback, showEncouragementFeedback, showProgressFeedback]);

  // Feedback para recordatorios de racha
  const showStreakReminderFeedback = useCallback((rachaActual) => {
    const mensajes = [
      `¡Tu racha de ${rachaActual} días te está esperando! 🔥`,
      `¡No pierdas tu racha de ${rachaActual} días! ⚡`,
      `¡Mantén viva tu racha de ${rachaActual} días! 💪`
    ];
    
    const mensaje = rachaActual > 0 
      ? mensajes[Math.floor(Math.random() * mensajes.length)]
      : '¡Es hora de comenzar una nueva racha! 🌟';
    
    showMotivationalFeedback(mensaje, 'encouragement', { 
      duration: 4000, 
      autoClose: true 
    });
  }, [showMotivationalFeedback]);

  // Animación para elementos de la UI
  const animateElement = useCallback((elementId, animationClass, duration = 1000) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add(animationClass);
      
      setTimeout(() => {
        element.classList.remove(animationClass);
      }, duration);
    }
  }, []);

  // Efecto de éxito para botones
  const triggerButtonSuccess = useCallback((buttonRef) => {
    if (buttonRef?.current) {
      buttonRef.current.classList.add('success-feedback', 'triggered');
      
      setTimeout(() => {
        buttonRef.current?.classList.remove('success-feedback', 'triggered');
      }, 600);
    }
  }, []);

  const contextValue = {
    // Estados
    achievementVisible,
    currentAchievement,
    motivationalVisible,
    motivationalData,
    
    // Funciones de logros
    showAchievement,
    closeAchievement,
    celebrateAchievement,
    
    // Funciones de feedback motivacional
    showMotivationalFeedback,
    closeMotivationalFeedback,
    showSuccessFeedback,
    showProgressFeedback,
    showEncouragementFeedback,
    showMilestoneFeedback,
    
    // Funciones específicas de dominio
    showJobActionFeedback,
    showProfileActionFeedback,
    showStreakFeedback,
    showStreakReminderFeedback,
    
    // Utilidades de animación
    animateElement,
    triggerButtonSuccess
  };

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      
      {/* Notificación de logros */}
      <AchievementNotification
        achievement={currentAchievement}
        visible={achievementVisible}
        onClose={closeAchievement}
        type={currentAchievement?.type}
      />
      
      {/* Feedback motivacional */}
      <MotivationalFeedback
        visible={motivationalVisible}
        message={motivationalData?.message}
        type={motivationalData?.type}
        onClose={closeMotivationalFeedback}
        autoClose={motivationalData?.autoClose}
        duration={motivationalData?.duration}
      />
    </FeedbackContext.Provider>
  );
};

// Hook para usar el feedback en cualquier componente
export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export default FeedbackProvider;