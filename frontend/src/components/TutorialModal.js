import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Award, Star, CheckCircle } from 'lucide-react';
import { useTutorial } from './TutorialProvider';
import { useFeedback } from './FeedbackProvider';

const TutorialModal = () => {
  const {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    progress,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial
  } = useTutorial();

  const { celebrateAchievement } = useFeedback();
  const modalRef = useRef(null);

  // Efecto para manejar el foco y evitar scroll
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
      // Enfocar el modal para accesibilidad
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isActive]);

  // Si no está activo, no renderizar nada
  if (!isActive) return null;

  // Manejar teclado
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (currentStep < totalSteps - 1) {
          nextStep();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (currentStep > 0) {
          prevStep();
        }
        break;
      case 'Escape':
        e.preventDefault();
        // Mostrar confirmación antes de saltar
        if (window.confirm('¿Estás seguro de que quieres saltar el tutorial? No recibirás la insignia de bienvenida.')) {
          skipTutorial();
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (currentStep === totalSteps - 1) {
          completeTutorial();
        } else {
          nextStep();
        }
        break;
    }
  };

  // Renderizar overlay y highlight según el paso
  const renderOverlay = () => {
    if (!currentStepData?.target) return null;

    const targetElement = document.querySelector(`[data-tutorial="${currentStepData.target}"]`);
    if (!targetElement) return null;

    const rect = targetElement.getBoundingClientRect();
    
    return (
      <div className="fixed inset-0 pointer-events-none z-40">
        {/* Highlight del elemento objetivo */}
        <div
          className="absolute border-2 border-yellow-400 bg-yellow-400 bg-opacity-10 rounded-lg shadow-2xl animate-pulse-slow"
          style={{
            left: rect.left - 8,
            top: rect.top - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          }}
        />
        
        {/* Overlay oscuro alrededor */}
        <div className="absolute inset-0 bg-black bg-opacity-60">
          {/* "Agujero" para el elemento destacado */}
          <div
            className="absolute bg-transparent"
            style={{
              left: rect.left - 12,
              top: rect.top - 12,
              width: rect.width + 24,
              height: rect.height + 24,
            }}
          />
        </div>
      </div>
    );
  };

  // Contenido del modal según el paso
  const renderModalContent = () => {
    const step = currentStepData;

    // Paso de bienvenida
    if (step.action === 'welcome') {
      return (
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{step.title}</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {step.description}
          </p>
          <div className="bg-purple-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-purple-800 mb-3">🎮 Lo que aprenderás:</h3>
            <ul className="text-left text-purple-700 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Navegar por todas las secciones</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Completar tu perfil paso a paso</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Ganar puntos e insignias</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Subir en el ranking</span>
              </li>
            </ul>
          </div>
        </div>
      );
    }

    // Paso de finalización
    if (step.action === 'completion') {
      return (
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Star className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{step.title}</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {step.description}
          </p>
          
          {/* Recompensas */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-yellow-800 font-semibold">Insignia</div>
              <div className="text-yellow-600 text-sm">"Bienvenido a NextStep"</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-green-800 font-semibold">+50 Puntos</div>
              <div className="text-green-600 text-sm">Bonus inicial</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">🎯 Tu Primera Misión:</h3>
            <p className="text-green-100">
              Completa al menos un nivel de tu perfil para ganar más puntos y desbloquear nuevas insignias
            </p>
          </div>
        </div>
      );
    }

    // Pasos normales de highlight
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">{step.id}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{step.title}</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {step.description}
        </p>
        
        {/* Indicador visual del elemento destacado */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 inline-flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-700 text-sm">Mira el área destacada</span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay y highlight */}
      {renderOverlay()}

      {/* Modal principal */}
      <div
        ref={modalRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-70"
          onClick={skipTutorial}
        />
        
        {/* Contenido del modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 scale-100">
          
          {/* Header con progreso */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-gray-600">
                  Paso {currentStep + 1} de {totalSteps}
                </span>
              </div>
              
              <button
                onClick={skipTutorial}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                aria-label="Saltar tutorial"
              >
                <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
              </button>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Contenido */}
          <div className="px-6 pb-2">
            {renderModalContent()}
          </div>

          {/* Navegación */}
          <div className="px-6 pb-6 pt-4">
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition-all button-press"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              {currentStep === totalSteps - 1 ? (
                <button
                  onClick={completeTutorial}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 button-press"
                >
                  <CheckCircle className="w-4 h-4" />
                  ¡Comenzar Aventura!
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 button-press"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Atajos de teclado */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                💡 Usa las flechas ← → para navegar • Enter para continuar • ESC para saltar
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialModal;