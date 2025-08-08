const express = require('express');
const router = express.Router();

// Respuestas para PROJECTION LIFE
const responses = {
  greeting: `¡Hola! 👋 Bienvenido a PROJECTION LIFE COLOMBIA

Somos su aliado en servicios de salud domiciliaria con más de 15 años de experiencia.

Para ayudarle mejor, seleccione:
1️⃣ PAD - Atención Domiciliaria
2️⃣ Enfermería Domiciliaria  
3️⃣ Consulta Externa
4️⃣ Hablar con asesor

Responda con el número de su opción.`,

  pad: `🏥 *PAD - Programa Atención Domiciliaria*

✅ Medicina general en casa
✅ Seguimiento personalizado  
✅ Atención especializada
✅ Cobertura: Santander, Casanare, Tolima

📋 Para agendar necesitamos:
- Nombre del paciente
- Teléfono de contacto
- Dirección completa

¿Puede proporcionarnos estos datos?`,

  enfermeria: `👩‍⚕️ *Enfermería Domiciliaria*

Servicios disponibles:
- Curaciones especializadas
- Procedimientos médicos
- Cuidados post-operatorios
- Administración de medicamentos

🕐 Horarios: Lunes a Viernes 7AM-6PM
🚨 Urgencias: 24 horas

¿Qué procedimiento necesita?`
};

// Webhook POST para mensajes de Twilio
router.post('/', (req, res) => {
  console.log('Mensaje recibido:', req.body);

  const message = req.body.Body ? req.body.Body.toLowerCase().trim() : '';
  const from = req.body.From || '';

  let response = '';

  if (message.includes('hola') || message.includes('hello') || message.includes('buenos')) {
    response = responses.greeting;
  } else if (message === '1' || message.includes('pad')) {
    response = responses.pad;
  } else if (message === '2' || message.includes('enfermeria')) {
    response = responses.enfermeria;
  } else if (message === '3' || message.includes('consulta')) {
    response = `🩺 *Consulta Externa*\n\nEspecialidades:\n🧠 Neurología\n👴 Geriatría\n🦴 Fisiatría\n\n📍 Sedes disponibles en Bucaramanga, Barranca, Tolima y Casanare.\n\n¿Para cuál especialidad necesita cita?`;
  } else if (message === '4' || message.includes('asesor')) {
    response = `👨‍⚕️ *Conectando con Asesor*\n\nUn momento por favor, lo conectamos con nuestro equipo especializado.\n\n¿Puede contarnos más detalles de su consulta?`;
  } else {
    response = `Gracias por contactarnos. Para mejor atención, responda con:\n\n1️⃣ PAD\n2️⃣ Enfermería\n3️⃣ Consulta\n4️⃣ Asesor\n\nO escriba "menu" para ver opciones.`;
  }

  // Respuesta en formato TwiML
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${response}</Message>
</Response>`);
});

module.exports = router;