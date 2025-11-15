const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const ChatMessage = require('../../datos/modelos/ChatMessage');
const Cuenta = require('../../datos/modelos/Cuenta');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

console.log('🤖 Jobbie (Chatbot) con Groq iniciado');

const userLastRequest = new Map();
const userState = new Map(); // Nuevo: estados de conversación
const RATE_LIMIT_MS = 2000;

// Habilidades sugeridas (opcionales)
const HABILIDADES_SUGERIDAS = [
  "Entrevistas de Trabajo",
  "Comunicación Profesional", 
  "Liderazgo y Gestión",
  "Programación y Tecnología",
  "Ventas y Atención al Cliente",
  "Gestión de Proyectos",
  "Análisis de Datos",
  "Marketing Digital"
];

// GET /api/chat/history/:cuentaId
router.get('/history/:cuentaId', async (req, res) => {
  try {
    const { cuentaId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const mensajes = await ChatMessage
      .find({ cuentaId })
      .sort({ fecha: -1 })
      .limit(limit)
      .lean();
    
    mensajes.reverse();
    
    res.json({
      success: true,
      messages: mensajes
    });
  } catch (err) {
    console.error('❌ Error obteniendo historial:', err);
    res.json({ success: true, messages: [] });
  }
});

// POST /api/chat/send
router.post('/send', async (req, res) => {
  try {
    const { texto, cuentaId } = req.body;
    
    // Rate limiting
    if (cuentaId && cuentaId !== 'guest-user') {
      const lastRequest = userLastRequest.get(cuentaId);
      const now = Date.now();
      
      if (lastRequest && (now - lastRequest) < RATE_LIMIT_MS) {
        return res.json({
          success: true,
          aiMessage: {
            texto: '⏱️ Espera un momento antes de enviar otro mensaje.',
            fecha: new Date()
          }
        });
      }
      userLastRequest.set(cuentaId, now);
    }
    
    if (!texto) {
      return res.json({
        success: true,
        aiMessage: {
          texto: '⚠️ Por favor escribe un mensaje.',
          fecha: new Date()
        }
      });
    }

    const textoLower = texto.toLowerCase().trim();
    const estadoUsuario = userState.get(cuentaId) || {};

    // Guardar mensaje del usuario (siempre)
    if (cuentaId && cuentaId !== 'guest-user') {
      try {
        await ChatMessage.create({
          cuentaId,
          autor: 'user',
          texto
        });
      } catch (dbErr) {
        console.error('⚠️ Error guardando mensaje usuario:', dbErr.message);
      }
    }

    let respuestaBot = '';

    // FLUJO 1: Comando inicial - practicar retos
    if (textoLower.includes('reto') || textoLower.includes('practicar') || textoLower.includes('entrenar')) {
      if (!cuentaId || cuentaId === 'guest-user') {
        respuestaBot = '⚠️ Debes iniciar sesión para participar en los retos.';
      } else {
        userState.set(cuentaId, { estado: 'seleccionando_habilidad' });
        respuestaBot = `🎯 ¡Perfecto! Te ayudo a practicar cualquier habilidad laboral.

📝 ¿Qué habilidad quieres practicar?

💡 Algunas sugerencias:
• Entrevistas de Trabajo
• Comunicación Profesional  
• Liderazgo y Gestión
• Programación y Tecnología
• Ventas y Atención al Cliente

✍️ **O escribe cualquier otra habilidad** que quieras mejorar (ej: "Negociación", "Presentaciones", "Excel", etc.)`;
      }
    }
    
    // FLUJO 2: Usuario escribió una habilidad (flexible)
    else if (estadoUsuario.estado === 'seleccionando_habilidad') {
      // Aceptar cualquier texto como habilidad
      const habilidadUsuario = texto.trim();
      
      if (habilidadUsuario.length < 3) {
        respuestaBot = '❌ Por favor escribe una habilidad válida (mínimo 3 caracteres).';
      } else {
        userState.set(cuentaId, { 
          estado: 'seleccionando_cantidad', 
          habilidad: habilidadUsuario 
        });
        
        respuestaBot = `✅ Perfecto! Vamos a practicar: ${habilidadUsuario}

🔢 ¿Cuántas preguntas quieres practicar?

• Escribe un número del 1 al 5
• Cada respuesta puede darte hasta 50 puntos
• Generaré preguntas específicas sobre esta habilidad`;
      }
    }
    
    // FLUJO 3: Usuario seleccionó cantidad
    else if (estadoUsuario.estado === 'seleccionando_cantidad') {
      const cantidad = parseInt(textoLower);
      
      if (cantidad >= 1 && cantidad <= 5) {
        const { habilidad } = estadoUsuario;
        
        if (!process.env.GROQ_API_KEY) {
          respuestaBot = '⚠️ API Key no configurada.';
        } else {
          // Generar preguntas dinámicamente con IA
          const generadorPreguntas = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `Genera ${cantidad} preguntas específicas para practicar la habilidad: "${habilidad}"

Las preguntas deben ser:
- Prácticas y profesionales
- Orientadas a situaciones laborales reales  
- Variadas en dificultad
- Que permitan evaluar conocimiento y experiencia

Responde SOLO un JSON válido sin markdown, con este formato exacto:
{"preguntas": ["pregunta 1", "pregunta 2"]}`
              }
            ],
            temperature: 0.7,
            max_tokens: 300
          });

          try {
            let respuestaIA = generadorPreguntas.choices[0].message.content.trim();
            
            // Limpiar markdown si existe
            respuestaIA = respuestaIA.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            
            // Extraer JSON
            const jsonMatch = respuestaIA.match(/\{[\s\S]*\}/);
            const jsonContent = jsonMatch ? jsonMatch[0] : respuestaIA;
            
            const resultadoPreguntas = JSON.parse(jsonContent);
            const preguntasGeneradas = resultadoPreguntas.preguntas || [];
            
            if (preguntasGeneradas.length > 0) {
              userState.set(cuentaId, {
                estado: 'respondiendo_pregunta',
                habilidad,
                preguntas: preguntasGeneradas.slice(0, cantidad),
                preguntaActual: 0,
                puntosAcumulados: 0
              });
              
              respuestaBot = `🎯 ¡Comenzamos! Tienes ${cantidad} pregunta(s) sobre ${habilidad}

Pregunta 1/${cantidad}:
${preguntasGeneradas[0]}

💡 Responde de forma profesional y detallada.`;
            } else {
              respuestaBot = '❌ Error generando preguntas. Intenta con otra habilidad.';
            }
          } catch (parseErr) {
            console.error('Error generando preguntas:', parseErr);
            // Fallback: preguntas genéricas
            const preguntasFallback = [
              `Describe tu experiencia con ${habilidad}`,
              `¿Cuáles son los principales desafíos en ${habilidad}?`,
              `¿Cómo mejorarías tus habilidades en ${habilidad}?`,
              `Explica una situación donde aplicaste ${habilidad}`,
              `¿Qué herramientas usas para ${habilidad}?`
            ].slice(0, cantidad);
            
            userState.set(cuentaId, {
              estado: 'respondiendo_pregunta',
              habilidad,
              preguntas: preguntasFallback,
              preguntaActual: 0,
              puntosAcumulados: 0
            });
            
            respuestaBot = `🎯 ¡Comenzamos! Tienes ${cantidad} pregunta(s) sobre ${habilidad}

Pregunta 1/${cantidad}:
${preguntasFallback[0]}

💡 Responde de forma profesional y detallada.`;
          }
        }
      } else {
        respuestaBot = '❌ Por favor escribe un número del 1 al 5.';
      }
    }
    
    // FLUJO 4: Usuario está respondiendo preguntas
    else if (estadoUsuario.estado === 'respondiendo_pregunta') {
      if (!process.env.GROQ_API_KEY) {
        respuestaBot = '⚠️ API Key no configurada.';
      } else {
        const { habilidad, preguntas, preguntaActual, puntosAcumulados } = estadoUsuario;
        
        // Evaluar respuesta actual con formato más simple
        const evaluacion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Evalúa esta respuesta sobre "${habilidad}":

Pregunta: "${preguntas[preguntaActual]}"
Respuesta del usuario: "${texto}"

Evalúa según profesionalismo, claridad, conocimiento y aplicabilidad práctica.

Responde EXACTAMENTE en este formato:
Tu puntuación fue: [número del 0 al 50]

[Aquí tu retroalimentación constructiva en 1-2 líneas]`
            }
          ],
          temperature: 0.3,
          max_tokens: 100
        });

        try {
          const respuestaIA = evaluacion.choices[0].message.content.trim();
          
          // Extraer puntuación del formato "Tu puntuación fue: X"
          const puntuacionMatch = respuestaIA.match(/Tu puntuación fue:\s*(\d+)/i);
          const puntosGanados = puntuacionMatch ? 
            Math.min(50, Math.max(0, parseInt(puntuacionMatch[1]))) : 25;
          
          // Retroalimentación
          const lineas = respuestaIA.split('\n');
          const retroalimentacion = lineas.slice(1).join('\n').trim() || 
            "Respuesta evaluada correctamente.";
          
          const nuevosAcumulados = puntosAcumulados + puntosGanados;
          
          // sumar puntos al usuario
          await Cuenta.findOneAndUpdate(
            { _id: cuentaId }, 
            { $inc: { puntos: puntosGanados } },
            { upsert: true }
          );
          
          const siguientePregunta = preguntaActual + 1;
          
          if (siguientePregunta < preguntas.length) {
            // Continuar con siguiente pregunta
            userState.set(cuentaId, {
              ...estadoUsuario,
              preguntaActual: siguientePregunta,
              puntosAcumulados: nuevosAcumulados
            });
            
            respuestaBot = ` Tu puntuación: ${puntosGanados}/50 puntos
💰 +${puntosGanados} puntos añadidos

💬 ${retroalimentacion}

📝 Pregunta ${siguientePregunta + 1}/${preguntas.length}:
${preguntas[siguientePregunta]}`;
          } else {
            // Terminar sesión
            userState.delete(cuentaId);
            
            respuestaBot = `🎉 ¡Sesión de ${habilidad} completada!

📊 Tu puntuación: ${puntosGanados}/50 puntos
💰 +${puntosGanados} puntos añadidos

💬 ${retroalimentacion}

🏆 Total ganado en esta sesión: ${nuevosAcumulados} puntos

¿Quieres practicar otra habilidad? Escribe "reto" para empezar de nuevo.`;
          }
        } catch (parseErr) {
          console.error('Error evaluando:', parseErr);
          // Fallback: dar puntos por defecto
          const puntosDefault = 25;
          const nuevosAcumulados = puntosAcumulados + puntosDefault;
          
          await Cuenta.findOneAndUpdate(
            { _id: cuentaId }, 
            { $inc: { puntos: puntosDefault } },
            { upsert: true }
          );
          
          const siguientePregunta = preguntaActual + 1;
          
          if (siguientePregunta < preguntas.length) {
            userState.set(cuentaId, {
              ...estadoUsuario,
              preguntaActual: siguientePregunta,
              puntosAcumulados: nuevosAcumulados
            });
            
            respuestaBot = `✅ Tu puntuación: ${puntosDefault}/50 puntos
💰 +${puntosDefault} puntos añadidos

💬 Respuesta evaluada correctamente.

📝 Pregunta ${siguientePregunta + 1}/${preguntas.length}:
${preguntas[siguientePregunta]}`;
          } else {
            userState.delete(cuentaId);
            
            respuestaBot = `🎉 ¡Sesión completada!

🏆 Total ganado: ${nuevosAcumulados} puntos
💰 ¡Puntos añadidos a tu cuenta!

¿Quieres practicar otra habilidad? Escribe "reto" para empezar de nuevo.`;
          }
        }
      }
    }
    
    // FLUJO 5: Comando puntos (simplificado)
    else if (textoLower.includes('puntos') || textoLower.includes('mi cuenta')) {
      if (!cuentaId || cuentaId === 'guest-user') {
        respuestaBot = '⚠️ Debes iniciar sesión para ver tus puntos.';
      } else {
        try {
          const cuenta = await Cuenta.findById(cuentaId);
          const puntosActuales = cuenta ? cuenta.puntos : 0;
          
          respuestaBot = `📊 Tu Cuenta:

💰 Puntos actuales: ${puntosActuales}
⭐ Nivel: ${cuenta ? cuenta.nivel : 1}

💡 ¡Practica más habilidades para ganar puntos!
Escribe "reto" para empezar.`;
        } catch (err) {
          respuestaBot = `📊 Tu Cuenta:

💰 Puntos actuales: 0
⭐ Nivel: 1

💡 ¡Practica habilidades para ganar puntos!
Escribe "reto" para empezar.`;
        }
      }
    }
    
    // FLUJO 6: Respuesta normal del chatbot
    else {
      if (!process.env.GROQ_API_KEY) {
        respuestaBot = '⚠️ API Key no configurada.';
      } else {
        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Eres Jobbie, el asistente virtual de Magneto X NextStep que ayuda con empleos. 

Conocimiento de la plataforma:
- Magneto X NextStep tiene sistemas de insignias que los usuarios pueden ganar
- Hay sistema de rachas para mantener a los usuarios activos
- Existen retos iniciales para nuevos usuarios
- Los usuarios pueden ganar puntos completando retos de habilidades (0-50 puntos por respuesta)
- Ayudas con búsqueda de empleos, desarrollo de habilidades y gamificación

Instrucciones importantes:
- Siempre preséntate como "Soy Jobbie" cuando sea apropiado (saludos iniciales)
- Responde en máximo 150 palabras
- NO uses ** para formato, usa texto normal
- Sé amigable y directo
- Menciona los sistemas de gamificación cuando sea relevante
- Siempre menciona que pueden escribir "reto" para practicar habilidades y ganar puntos
- Responde en español

Si es un saludo inicial, responde algo como: "¡Hola! Soy Jobbie y me alegra conocerte. Estoy aquí para ayudarte con empleos, habilidades laborales y nuestros sistemas de gamificación como insignias, rachas y retos. Si deseas practicar tus habilidades y ganar puntos, puedes escribir 'reto' para acceder a nuestros ejercicios interactivos. ¿En qué puedo ayudarte hoy?"`
            },
            {
              role: 'user',
              content: texto
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        });

        respuestaBot = completion.choices[0].message.content;
      }
    }

    // Guardar respuesta del bot
    if (cuentaId && cuentaId !== 'guest-user') {
      try {
        await ChatMessage.create({
          cuentaId,
          autor: 'ai',
          texto: respuestaBot
        });
      } catch (dbErr) {
        console.error('⚠️ Error guardando respuesta bot:', dbErr.message);
      }
    }

    res.json({
      success: true,
      aiMessage: {
        texto: respuestaBot,
        fecha: new Date()
      }
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.json({
      success: true,
      aiMessage: {
        texto: '❌ Error temporal. Intenta de nuevo.',
        fecha: new Date()
      }
    });
  }
});

module.exports = router;