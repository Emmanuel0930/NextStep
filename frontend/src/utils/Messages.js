// Mensajes de bienvenida centralizados
const messages = [
  "¡Bienvenid@ a NextStep! 🎉",
  "Registrate para seguir mejorando tus interacciones",
  "Oferta de empleo recomendada: " + "Auxiliar Administrativo - Postobón",
];

// En el futuro aquí irá la lógica para elegir el mensaje
export function getWelcomeMessage() {
  // Por ahora, retorna el mensaje 1
  return messages[2];
}

export { messages };