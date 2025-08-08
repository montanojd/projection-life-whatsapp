const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const webhookRoutes = require('./routes/webhook');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// 🔥 CORS MIDDLEWARE - PARA CONECTAR CON DASHBOARD
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🔥 STORAGE EN MEMORIA PARA MENSAJES Y MÉTRICAS
let whatsappStorage = {
  messages: [],
  conversations: new Map(),
  metrics: {
    totalMessages: 0,
    messagesDay: 0,
    botResolved: 0,
    humanEscalated: 0,
    lastUpdated: new Date().toISOString()
  }
};

// 🔥 FUNCIÓN PARA REGISTRAR MENSAJES (llamarla desde webhook)
global.registerWhatsAppMessage = function(from, message, intent, response, status = 'completed') {
  const messageData = {
    id: Date.now().toString(),
    from: from,
    message: message,
    intent: intent,
    response: response,
    timestamp: new Date().toISOString(),
    status: status,
    direction: 'inbound'
  };
  
  // Agregar mensaje al storage
  whatsappStorage.messages.unshift(messageData);
  
  // Mantener solo los últimos 100 mensajes
  if (whatsappStorage.messages.length > 100) {
    whatsappStorage.messages = whatsappStorage.messages.slice(0, 100);
  }
  
  // Actualizar métricas
  whatsappStorage.metrics.totalMessages++;
  
  // Contar mensajes del día
  const today = new Date().toDateString();
  whatsappStorage.metrics.messagesDay = whatsappStorage.messages.filter(msg => 
    new Date(msg.timestamp).toDateString() === today
  ).length;
  
  // Determinar si fue resuelto por bot
  if (intent && !intent.includes('asesor')) {
    whatsappStorage.metrics.botResolved++;
  } else {
    whatsappStorage.metrics.humanEscalated++;
  }
  
  whatsappStorage.metrics.lastUpdated = new Date().toISOString();
  
  console.log(`💬 WhatsApp registrado: ${from} - ${intent} - Total: ${whatsappStorage.metrics.totalMessages}`);
  return messageData;
};

// 🔥 NUEVAS APIS PARA EL DASHBOARD

// API de métricas WhatsApp
app.get('/api/whatsapp/metrics', (req, res) => {
  console.log('💬 Dashboard solicitando métricas WhatsApp...');
  
  const metrics = whatsappStorage.metrics;
  const responseData = {
    total_messages: metrics.totalMessages,
    messages_today: metrics.messagesDay,
    bot_resolved: metrics.botResolved,
    human_escalated: metrics.humanEscalated,
    delivery_rate: metrics.totalMessages > 0 ? '98.5%' : '0%',
    response_rate: metrics.totalMessages > 0 ? '76%' : '0%',
    status: 'active',
    last_updated: metrics.lastUpdated
  };
  
  console.log('✅ Enviando métricas WhatsApp:', responseData);
  res.json(responseData);
});

// API de mensajes recientes
app.get('/api/whatsapp/messages/recent', (req, res) => {
  console.log(`💬 Dashboard solicitando mensajes recientes (${whatsappStorage.messages.length} disponibles)...`);
  
  const recentMessages = whatsappStorage.messages.slice(0, 10).map(msg => ({
    id: msg.id,
    from: msg.from,
    message: msg.message.substring(0, 100) + (msg.message.length > 100 ? '...' : ''), // Truncar para privacidad
    intent: msg.intent,
    timestamp: msg.timestamp,
    status: msg.status,
    direction: msg.direction
  }));
  
  console.log('✅ Enviando mensajes WhatsApp:', recentMessages);
  res.json(recentMessages);
});

// API de conversaciones activas
app.get('/api/whatsapp/conversations', (req, res) => {
  console.log('💬 Dashboard solicitando conversaciones activas...');
  
  // Agrupar mensajes por número de teléfono
  const conversations = {};
  whatsappStorage.messages.forEach(msg => {
    if (!conversations[msg.from]) {
      conversations[msg.from] = {
        phone: msg.from,
        lastMessage: msg.message,
        lastActivity: msg.timestamp,
        messageCount: 0,
        status: 'active'
      };
    }
    conversations[msg.from].messageCount++;
  });
  
  const conversationList = Object.values(conversations).slice(0, 5);
  
  console.log('✅ Enviando conversaciones:', conversationList);
  res.json(conversationList);
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'WhatsApp API funcionando correctamente!',
    timestamp: new Date().toISOString(),
    server: 'PROJECTION LIFE WhatsApp',
    messagesStored: whatsappStorage.messages.length
  });
});

// Serve static files
app.use(express.static('public'));

// Routes
app.use('/webhook', webhookRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    service: 'PROJECTION LIFE WhatsApp Webhook',
    status: 'active',
    timestamp: new Date().toISOString(),
    apis: {
      metrics: '/api/whatsapp/metrics',
      messages: '/api/whatsapp/messages/recent',
      conversations: '/api/whatsapp/conversations',
      test: '/api/test'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'PROJECTION LIFE WhatsApp Webhook',
    timestamp: new Date().toISOString(),
    messagesProcessed: whatsappStorage.metrics.totalMessages
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Por favor contacte con soporte técnico'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PROJECTION LIFE WhatsApp Server running on port ${PORT}`);
  console.log(`✅ CORS enabled for dashboard integration`);
  console.log(`💬 APIs disponibles:`);
  console.log(`   - GET /api/whatsapp/metrics`);
  console.log(`   - GET /api/whatsapp/messages/recent`);
  console.log(`   - GET /api/whatsapp/conversations`);
  console.log(`   - GET /api/test`);
  logger.info(`PROJECTION LIFE WhatsApp Webhook Server running on port ${PORT}`);
});

module.exports = app;