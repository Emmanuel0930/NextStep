import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationProvider';
import { useFeedback } from './FeedbackProvider';

// Crear el Context
const TutorialContext = createContext();

// Hook personalizado para usar el contexto
export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial debe ser usado dentro de TutorialProvider');
  }
  return context;
};

export const TutorialProvider = ({ children }) => {
  const [tutorialState, setTutorialState] = useState({
    isActive: false,
    currentStep: 0,
    isCompleted: false,
    isLoading: true
  });
  
  const { showNotification } = useNotification();
  const { celebrateAchievement } = useFeedback();

  // Pasos del tutorial
  const tutorialSteps = [
    {
      id: 1,
      title: "🎉 ¡Bienvenido a NextStep!",
      description: "Tu plataforma para encontrar empleo de manera gamificada. Te guiaremos en un rápido recorrido.",
      target: null,
      position: "center",
      action: "welcome"
    },
    {
      id: 2,
      title: "📊 Tu Dashboard",
      description: "Aquí verás tu progreso, estadísticas y retos diarios. Es tu centro de control principal.",
      target: "dashboard-section",
      position: "bottom",
      action: "highlight"
    },
    {
      id: 3,
      title: "👤 Completa tu Perfil",
      description: "Tienes 4 niveles para completar. Cada nivel te da puntos y acerca a tu primera insignia.",
      target: "profile-section", 
      position: "bottom",
      action: "highlight"
    },
    {
      id: 4,
      title: "💼 Explora Empleos",
      description: "Busca ofertas, marca favoritos y postúlate. Cada postulación te da puntos de experiencia.",
      target: "jobs-section",
      position: "bottom",
      action: "highlight"
    },
    {
      id: 5,
      title: "🏆 Gana Insignias",
      description: "Completa retos y desbloquea insignias especiales. ¡Colecciónalas todas!",
      target: "badges-section",
      position: "bottom",
      action: "highlight"
    },
    {
      id: 6,
      title: "📈 Sube en el Ranking",
      description: "Compite con otros usuarios. Tu posición depende de puntos, racha y nivel.",
      target: "ranking-section",
      position: "bottom",
      action: "highlight"
    },
    {
      id: 7,
      title: "🔥 Mantén tu Racha",
      description: "Entra diariamente para mantener tu racha activa. ¡Las rachas largas dan bonus!",
      target: "streak-section",
      position: "bottom",
      action: "highlight"
    },
    {
      id: 8,
      title: "🚀 ¡Comienza tu Aventura!",
      description: "Has completado el tutorial. ¡Recibe tu insignia de bienvenida y comienza a ganar puntos!",
      target: null,
      position: "center",
      action: "completion"
    }
  ];

  // Verificar estado del tutorial al cargar
  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = () => {
    try {
      const userId = localStorage.getItem('userId');
      const tutorialCompleted = localStorage.getItem(`tutorialCompleted_${userId}`);
      const isNewUser = !tutorialCompleted && userId;

      setTutorialState(prev => ({
        ...prev,
        isCompleted: !!tutorialCompleted,
        isActive: isNewUser,
        isLoading: false
      }));

      // Si es usuario nuevo, iniciar tutorial automáticamente
      if (isNewUser) {
        setTimeout(() => {
          startTutorial();
        }, 1000);
      }
    } catch (error) {
      console.error('Error verificando estado del tutorial:', error);
      setTutorialState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Iniciar tutorial
  const startTutorial = () => {
    setTutorialState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 0,
      isCompleted: false
    }));
    
    showNotification("¡Bienvenido! Comenzando tutorial guiado 🎯");
  };

  // Avanzar al siguiente paso
  const nextStep = () => {
    setTutorialState(prev => {
      const nextStep = prev.currentStep + 1;
      
      // Si es el último paso, completar tutorial
      if (nextStep >= tutorialSteps.length) {
        completeTutorial();
        return prev;
      }
      
      return {
        ...prev,
        currentStep: nextStep
      };
    });
  };

  // Retroceder al paso anterior
  const prevStep = () => {
    setTutorialState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  };

  // Saltar tutorial
  const skipTutorial = () => {
    setTutorialState(prev => ({
      ...prev,
      isActive: false,
      isCompleted: true
    }));
    
    // Marcar como completado sin insignia
    const userId = localStorage.getItem('userId');
    if (userId) {
      localStorage.setItem(`tutorialCompleted_${userId}`, 'true');
    }
    
    showNotification("Puedes volver a ver el tutorial desde tu perfil");
  };

  // Completar tutorial y dar insignia
  const completeTutorial = async () => {
    try {
      const userId = localStorage.getItem('userId');
      
      // 1. Marcar tutorial como completado
      localStorage.setItem(`tutorialCompleted_${userId}`, 'true');
      
      // 2. Otorgar insignia de bienvenida
      await grantWelcomeBadge(userId);
      
      // 3. Actualizar estado
      setTutorialState(prev => ({
        ...prev,
        isActive: false,
        isCompleted: true,
        currentStep: 0
      }));
      
      // 4. Mostrar celebración
      celebrateAchievement({
        nombre: "¡Bienvenido a NextStep!",
        descripcion: "Has completado el tutorial inicial y estás listo para comenzar tu aventura",
        icono: "🎉"
      }, { type: 'achievement' });
      
      showNotification("¡Tutorial completado! +50 puntos de bienvenida 🎉");
      
    } catch (error) {
      console.error('Error completando tutorial:', error);
      showNotification("Error al completar el tutorial");
    }
  };

  // Otorgar insignia de bienvenida
  const grantWelcomeBadge = async (userId) => {
    try {
      const response = await fetch('http://localhost:5000/api/insignias/welcome-badge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cuentaId: userId })
      });

      if (!response.ok) {
        throw new Error('Error otorgando insignia de bienvenida');
      }

      const data = await response.json();
      
      // Forzar recarga de insignias
      setTimeout(() => {
        window.dispatchEvent(new Event('badgesUpdated'));
      }, 1000);
      
      return data;
    } catch (error) {
      console.error('Error granting welcome badge:', error);
      // En caso de error, al menos marcar el tutorial como completado
      return { success: false };
    }
  };

  // Obtener paso actual
  const getCurrentStep = () => {
    return tutorialSteps[tutorialState.currentStep];
  };

  // Valor del contexto
  const contextValue = {
    // Estado
    ...tutorialState,
    tutorialSteps,
    
    // Métodos
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    getCurrentStep,
    
    // Información
    totalSteps: tutorialSteps.length,
    currentStepData: getCurrentStep(),
    progress: ((tutorialState.currentStep + 1) / tutorialSteps.length) * 100
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
    </TutorialContext.Provider>
  );
};

export default TutorialProvider;
