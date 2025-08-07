const crypto = require('crypto');
const config = require('../config/whatsapp');
const logger = require('../utils/logger');

class WebhookVerification {
    verifyWebhook(req, res, next) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        logger.info(`Webhook verification attempt: mode=${mode}, token=${token}`);

        if (mode && token) {
            if (mode === 'subscribe' && token === config.VERIFY_TOKEN) {
                logger.info('Webhook verification successful');
                res.status(200).send(challenge);
                return;
            } else {
                logger.warn('Webhook verification failed: invalid token');
                res.sendStatus(403);
                return;
            }
        }

        next();
    }

    verifySignature(req, res, next) {
        // Skip signature verification in development if no app secret is provided
        const appSecret = process.env.WHATSAPP_APP_SECRET;
        if (!appSecret) {
            logger.warn('No WhatsApp App Secret provided, skipping signature verification');
            return next();
        }

        const signature = req.get('X-Hub-Signature-256');
        if (!signature) {
            logger.warn('No signature provided in webhook request');
            return res.sendStatus(401);
        }

        const expectedSignature = 'sha256=' + crypto
            .createHmac('sha256', appSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (signature !== expectedSignature) {
            logger.error('Invalid signature in webhook request');
            return res.sendStatus(401);
        }

        logger.info('Webhook signature verified successfully');
        next();
    }

    validateWebhookPayload(req, res, next) {
        const body = req.body;

        // Basic payload validation
        if (!body || typeof body !== 'object') {
            logger.error('Invalid webhook payload: not an object');
            return res.status(400).json({ error: 'Invalid payload format' });
        }

        // Check for required WhatsApp webhook structure
        if (body.object !== 'whatsapp_business_account') {
            logger.error('Invalid webhook payload: incorrect object type');
            return res.status(400).json({ error: 'Invalid webhook object type' });
        }

        if (!body.entry || !Array.isArray(body.entry)) {
            logger.error('Invalid webhook payload: missing entry array');
            return res.status(400).json({ error: 'Missing entry data' });
        }

        logger.info('Webhook payload validation successful');
        next();
    }

    rateLimitCheck(req, res, next) {
        const clientIp = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        // Simple in-memory rate limiting (in production, use Redis)
        if (!this.rateLimitStore) {
            this.rateLimitStore = new Map();
        }

        const clientData = this.rateLimitStore.get(clientIp) || { 
            requests: [], 
            blocked: false, 
            blockUntil: 0 
        };

        // Check if client is currently blocked
        if (clientData.blocked && now < clientData.blockUntil) {
            logger.warn(`Rate limit exceeded for IP ${clientIp}`);
            return res.status(429).json({ 
                error: 'Rate limit exceeded',
                retryAfter: Math.ceil((clientData.blockUntil - now) / 1000)
            });
        }

        // Clean old requests (keep only last hour)
        clientData.requests = clientData.requests.filter(
            timestamp => now - timestamp < 60 * 60 * 1000
        );

        // Add current request
        clientData.requests.push(now);

        // Check rate limit (max 100 requests per hour)
        if (clientData.requests.length > 100) {
            clientData.blocked = true;
            clientData.blockUntil = now + (60 * 60 * 1000); // Block for 1 hour
            
            logger.warn(`IP ${clientIp} blocked due to rate limit violation`);
            return res.status(429).json({ 
                error: 'Rate limit exceeded',
                retryAfter: 3600
            });
        }

        // Reset block status if applicable
        if (clientData.blocked && now >= clientData.blockUntil) {
            clientData.blocked = false;
            clientData.blockUntil = 0;
        }

        this.rateLimitStore.set(clientIp, clientData);
        next();
    }

    logWebhookActivity(req, res, next) {
        const startTime = Date.now();
        
        // Log incoming request
        logger.info('Webhook request received', {
            method: req.method,
            url: req.url,
            userAgent: req.get('User-Agent'),
            contentLength: req.get('Content-Length'),
            timestamp: new Date().toISOString()
        });

        // Override res.end to log response
        const originalEnd = res.end;
        res.end = function(chunk, encoding) {
            const duration = Date.now() - startTime;
            
            logger.info('Webhook response sent', {
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                timestamp: new Date().toISOString()
            });

            originalEnd.call(this, chunk, encoding);
        };

        next();
    }
}

module.exports = new WebhookVerification();
