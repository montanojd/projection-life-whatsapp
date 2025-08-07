const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const webhookRoutes = require('./routes/webhook');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Routes
app.use('/webhook', webhookRoutes);

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'PROJECTION LIFE WhatsApp Webhook',
        timestamp: new Date().toISOString()
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
    logger.info(`PROJECTION LIFE WhatsApp Webhook Server running on port ${PORT}`);
});

module.exports = app;
