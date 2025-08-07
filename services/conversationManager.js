const config = require('../config/whatsapp');
const logger = require('../utils/logger');

class ConversationManager {
    constructor() {
        this.conversations = new Map();
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredConversations();
        }, 5 * 60 * 1000); // Cleanup every 5 minutes
    }

    getConversation(phoneNumber) {
        if (!this.conversations.has(phoneNumber)) {
            this.createNewConversation(phoneNumber);
        }
        
        const conversation = this.conversations.get(phoneNumber);
        conversation.lastActivity = new Date();
        return conversation;
    }

    createNewConversation(phoneNumber) {
        const conversation = {
            phoneNumber: phoneNumber,
            state: 'INITIAL',
            context: {},
            messages: [],
            createdAt: new Date(),
            lastActivity: new Date(),
            sessionData: {
                preferredLanguage: 'es',
                userType: 'unknown', // patient, family_member, healthcare_provider
                currentService: null, // pad, nursing, consultation
                appointmentData: {}
            }
        };

        this.conversations.set(phoneNumber, conversation);
        logger.info(`New conversation created for ${phoneNumber}`);
        return conversation;
    }

    updateConversation(phoneNumber, intent, response) {
        const conversation = this.getConversation(phoneNumber);
        
        // Update conversation state based on intent
        this.updateConversationState(conversation, intent);
        
        // Store the interaction
        conversation.messages.push({
            intent: intent,
            response: response,
            timestamp: new Date()
        });

        // Update context based on intent
        this.updateContext(conversation, intent);

        logger.info(`Conversation updated for ${phoneNumber}, new state: ${conversation.state}`);
    }

    updateConversationState(conversation, intent) {
        const currentState = conversation.state;
        const intentType = intent.type;

        switch (intentType) {
            case 'GREETING':
                conversation.state = 'WELCOMED';
                break;
                
            case 'PAD_INQUIRY':
                conversation.state = 'PAD_DISCUSSION';
                conversation.sessionData.currentService = 'pad';
                break;
                
            case 'NURSING_INQUIRY':
                conversation.state = 'NURSING_DISCUSSION';
                conversation.sessionData.currentService = 'nursing';
                break;
                
            case 'CONSULTATION_INQUIRY':
                conversation.state = 'CONSULTATION_DISCUSSION';
                conversation.sessionData.currentService = 'consultation';
                break;
                
            case 'SCHEDULE_REQUEST':
                conversation.state = 'SCHEDULING';
                break;
                
            case 'CONTACT':
                conversation.state = 'CONTACT_PROVIDED';
                break;
                
            case 'EMERGENCY':
                conversation.state = 'EMERGENCY_HANDLED';
                break;
                
            default:
                // Keep current state for unknown intents
                break;
        }
    }

    updateContext(conversation, intent) {
        // Update context with relevant information from the intent
        if (intent.entities) {
            Object.assign(conversation.context, intent.entities);
        }

        // Update service-specific context
        if (intent.service) {
            conversation.sessionData.currentService = intent.service;
        }

        // Track user preferences
        if (intent.preferences) {
            conversation.sessionData = {
                ...conversation.sessionData,
                ...intent.preferences
            };
        }
    }

    getConversationHistory(phoneNumber, limit = 10) {
        const conversation = this.conversations.get(phoneNumber);
        if (!conversation) {
            return [];
        }

        return conversation.messages
            .slice(-limit)
            .map(msg => ({
                text: msg.text,
                intent: msg.intent?.type,
                timestamp: msg.timestamp
            }));
    }

    isNewUser(phoneNumber) {
        const conversation = this.conversations.get(phoneNumber);
        return !conversation || conversation.messages.length <= 1;
    }

    getUserContext(phoneNumber) {
        const conversation = this.conversations.get(phoneNumber);
        return conversation ? conversation.context : {};
    }

    setUserContext(phoneNumber, contextData) {
        const conversation = this.getConversation(phoneNumber);
        conversation.context = { ...conversation.context, ...contextData };
    }

    cleanupExpiredConversations() {
        const now = new Date();
        let cleanedCount = 0;

        for (const [phoneNumber, conversation] of this.conversations.entries()) {
            const timeSinceLastActivity = now - conversation.lastActivity;
            
            if (timeSinceLastActivity > config.CONVERSATION_TIMEOUT) {
                this.conversations.delete(phoneNumber);
                cleanedCount++;
                logger.info(`Cleaned up expired conversation for ${phoneNumber}`);
            }
        }

        if (cleanedCount > 0) {
            logger.info(`Cleaned up ${cleanedCount} expired conversations`);
        }
    }

    getConversationStats() {
        return {
            totalConversations: this.conversations.size,
            activeConversations: Array.from(this.conversations.values()).filter(
                conv => (new Date() - conv.lastActivity) < (30 * 60 * 1000) // Active in last 30 minutes
            ).length
        };
    }

    exportConversationData(phoneNumber) {
        const conversation = this.conversations.get(phoneNumber);
        if (!conversation) {
            return null;
        }

        // Remove sensitive data and return sanitized version
        return {
            phoneNumber: phoneNumber.substring(0, 5) + '***', // Masked phone number
            state: conversation.state,
            messageCount: conversation.messages.length,
            createdAt: conversation.createdAt,
            lastActivity: conversation.lastActivity,
            currentService: conversation.sessionData.currentService
        };
    }
}

module.exports = new ConversationManager();
