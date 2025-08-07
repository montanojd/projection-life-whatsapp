const axios = require('axios');
const config = require('../config/whatsapp');
const responseTemplates = require('./responseTemplates');
const conversationManager = require('./conversationManager');
const messageParser = require('../utils/messageParser');
const logger = require('../utils/logger');

class MessageHandler {
    constructor() {
        this.apiUrl = `${config.WHATSAPP_API_URL}/${config.PHONE_NUMBER_ID}/messages`;
        this.headers = {
            'Authorization': `Bearer ${config.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        };
    }

    async processMessage(webhookData) {
        try {
            const entry = webhookData.entry?.[0];
            const changes = entry?.changes?.[0];
            const messages = changes?.value?.messages;

            if (!messages || messages.length === 0) {
                logger.info('No messages found in webhook data');
                return;
            }

            for (const message of messages) {
                await this.handleSingleMessage(message, changes.value);
            }
        } catch (error) {
            logger.error('Error processing message:', error);
            throw error;
        }
    }

    async handleSingleMessage(message, webhookValue) {
        try {
            const from = message.from;
            const messageText = message.text?.body || '';
            const messageType = message.type;

            logger.info(`Received message from ${from}: ${messageText}`);

            // Get or create conversation context
            const conversation = conversationManager.getConversation(from);
            
            // Update conversation with new message
            conversation.messages.push({
                from: from,
                text: messageText,
                timestamp: new Date(),
                type: messageType
            });

            // Parse message intent
            const intent = messageParser.parseIntent(messageText, conversation.state);
            
            // Generate appropriate response
            const response = await this.generateResponse(intent, conversation, messageText);
            
            // Update conversation state
            conversationManager.updateConversation(from, intent, response);
            
            // Send response
            if (response) {
                await this.sendMessage(from, response);
            }

        } catch (error) {
            logger.error(`Error handling message from ${message.from}:`, error);
            // Send error response
            await this.sendMessage(message.from, responseTemplates.getErrorResponse());
        }
    }

    async generateResponse(intent, conversation, messageText) {
        try {
            switch (intent.type) {
                case 'GREETING':
                    return responseTemplates.getWelcomeMessage();
                
                case 'PAD_INQUIRY':
                    return responseTemplates.getPADInformation(intent.subtype);
                
                case 'NURSING_INQUIRY':
                    return responseTemplates.getNursingInformation(intent.subtype);
                
                case 'CONSULTATION_INQUIRY':
                    return responseTemplates.getConsultationInformation(intent.subtype);
                
                case 'HELP':
                    return responseTemplates.getHelpMenu();
                
                case 'CONTACT':
                    return responseTemplates.getContactInformation();
                
                case 'SCHEDULE_REQUEST':
                    return responseTemplates.getSchedulingInformation(intent.service);
                
                default:
                    return responseTemplates.getUnknownResponse(messageText);
            }
        } catch (error) {
            logger.error('Error generating response:', error);
            return responseTemplates.getErrorResponse();
        }
    }

    async sendMessage(to, messageData) {
        try {
            const payload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to,
                ...messageData
            };

            const response = await axios.post(this.apiUrl, payload, { headers: this.headers });
            
            logger.info(`Message sent to ${to}: ${response.status}`);
            return response.data;
            
        } catch (error) {
            logger.error(`Error sending message to ${to}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async markAsRead(messageId) {
        try {
            const payload = {
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId
            };

            await axios.post(this.apiUrl, payload, { headers: this.headers });
        } catch (error) {
            logger.error('Error marking message as read:', error);
        }
    }
}

module.exports = new MessageHandler();
