const express = require('express');
const router = express.Router();
const messageHandler = require('../services/messageHandler');
const webhookVerification = require('../middleware/webhookVerification');
const logger = require('../utils/logger');

// Apply middleware
router.use(webhookVerification.logWebhookActivity.bind(webhookVerification));
router.use(webhookVerification.rateLimitCheck.bind(webhookVerification));

// Webhook verification endpoint (GET)
router.get('/', webhookVerification.verifyWebhook.bind(webhookVerification));

// Webhook message endpoint (POST)
router.post('/', 
    webhookVerification.verifySignature.bind(webhookVerification),
    webhookVerification.validateWebhookPayload.bind(webhookVerification),
    async (req, res) => {
        try {
            logger.info('Processing webhook message', {
                entries: req.body.entry?.length || 0,
                timestamp: new Date().toISOString()
            });

            // Process the webhook data
            await messageHandler.processMessage(req.body);

            // Send success response immediately
            res.status(200).json({
                status: 'success',
                message: 'Message processed successfully'
            });

            logger.info('Webhook message processed successfully');

        } catch (error) {
            logger.error('Error processing webhook message:', error);
            
            // Send error response
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Status endpoint for monitoring
router.get('/status', (req, res) => {
    res.status(200).json({
        status: 'active',
        service: 'PROJECTION LIFE WhatsApp Webhook',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
            verification: 'GET /webhook',
            messages: 'POST /webhook',
            status: 'GET /webhook/status'
        }
    });
});

// Test endpoint for development
router.post('/test', (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ error: 'Endpoint not available' });
    }

    logger.info('Test webhook called', req.body);
    
    res.status(200).json({
        status: 'test_success',
        received: req.body,
        timestamp: new Date().toISOString()
    });
});

// Error handling for webhook routes
router.use((error, req, res, next) => {
    logger.error('Webhook route error:', error);
    
    res.status(500).json({
        status: 'error',
        message: 'Webhook processing error',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
