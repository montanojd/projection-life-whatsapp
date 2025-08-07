const config = require('../config/whatsapp');
const logger = require('./logger');

class MessageParser {
    constructor() {
        this.emergencyKeywords = [
            'emergencia', 'urgente', 'dolor fuerte', 'no puedo respirar', 
            'dolor pecho', 'infarto', 'ataque', 'mareo severo', 'desmayo',
            'sangrado', 'accidente', 'inconsciente', 'convulsión'
        ];
        
        this.appointmentKeywords = [
            'agendar', 'cita', 'reservar', 'programar', 'fecha', 'hora',
            'disponibilidad', 'cupo', 'turno'
        ];
    }

    parseIntent(message, conversationState = 'INITIAL') {
        const normalizedMessage = this.normalizeMessage(message);
        
        // Check for emergency first (highest priority)
        if (this.isEmergency(normalizedMessage)) {
            return {
                type: 'EMERGENCY',
                confidence: 1.0,
                urgency: 'HIGH',
                keywords: this.extractEmergencyKeywords(normalizedMessage)
            };
        }

        // Check for appointment/scheduling requests
        if (this.isSchedulingRequest(normalizedMessage)) {
            return {
                type: 'SCHEDULE_REQUEST',
                service: this.extractServiceType(normalizedMessage),
                confidence: 0.9
            };
        }

        // Parse based on keywords and context
        const intent = this.parseByKeywords(normalizedMessage, conversationState);
        
        // Add entities extraction
        intent.entities = this.extractEntities(normalizedMessage);
        
        return intent;
    }

    normalizeMessage(message) {
        return message
            .toLowerCase()
            .trim()
            .replace(/[^\w\sáéíóúñü]/g, ' ')
            .replace(/\s+/g, ' ');
    }

    isEmergency(normalizedMessage) {
        return this.emergencyKeywords.some(keyword => 
            normalizedMessage.includes(keyword)
        );
    }

    isSchedulingRequest(normalizedMessage) {
        return this.appointmentKeywords.some(keyword => 
            normalizedMessage.includes(keyword)
        );
    }

    extractEmergencyKeywords(message) {
        return this.emergencyKeywords.filter(keyword => 
            message.includes(keyword)
        );
    }

    extractServiceType(message) {
        if (this.containsKeywords(message, config.KEYWORDS.PAD)) {
            return 'pad';
        } else if (this.containsKeywords(message, config.KEYWORDS.NURSING)) {
            return 'nursing';
        } else if (this.containsKeywords(message, config.KEYWORDS.CONSULTATION)) {
            return 'consultation';
        }
        return 'general';
    }

    parseByKeywords(message, conversationState) {
        // Greeting detection
        if (this.containsKeywords(message, config.KEYWORDS.GREETING) || 
            conversationState === 'INITIAL') {
            return {
                type: 'GREETING',
                confidence: 0.9
            };
        }

        // Help menu
        if (this.containsKeywords(message, config.KEYWORDS.HELP) ||
            message.includes('menu') || message.includes('opciones')) {
            return {
                type: 'HELP',
                confidence: 0.95
            };
        }

        // PAD inquiries
        if (this.containsKeywords(message, config.KEYWORDS.PAD)) {
            return {
                type: 'PAD_INQUIRY',
                subtype: this.getPADSubtype(message),
                confidence: 0.9
            };
        }

        // Nursing services
        if (this.containsKeywords(message, config.KEYWORDS.NURSING)) {
            return {
                type: 'NURSING_INQUIRY',
                subtype: this.getNursingSubtype(message),
                confidence: 0.9
            };
        }

        // Medical consultations
        if (this.containsKeywords(message, config.KEYWORDS.CONSULTATION)) {
            return {
                type: 'CONSULTATION_INQUIRY',
                subtype: this.getConsultationSubtype(message),
                confidence: 0.9
            };
        }

        // Contact information
        if (message.includes('contacto') || message.includes('teléfono') || 
            message.includes('dirección') || message.includes('ubicación')) {
            return {
                type: 'CONTACT',
                confidence: 0.95
            };
        }

        // Interactive button responses
        const buttonResponse = this.parseButtonResponse(message);
        if (buttonResponse) {
            return buttonResponse;
        }

        // Default unknown intent
        return {
            type: 'UNKNOWN',
            confidence: 0.1,
            originalMessage: message
        };
    }

    containsKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    getPADSubtype(message) {
        if (message.includes('síntomas') || message.includes('dolor') || 
            message.includes('caminar')) {
            return 'symptoms';
        } else if (message.includes('tratamiento') || message.includes('cura') || 
                   message.includes('medicamento')) {
            return 'treatment';
        } else if (message.includes('qué es') || message.includes('información')) {
            return 'general';
        }
        return 'general';
    }

    getNursingSubtype(message) {
        if (message.includes('domicilio') || message.includes('casa')) {
            return 'home';
        } else if (message.includes('procedimiento') || message.includes('inyección') || 
                   message.includes('curación')) {
            return 'procedures';
        } else if (message.includes('agendar') || message.includes('programar')) {
            return 'schedule';
        }
        return 'general';
    }

    getConsultationSubtype(message) {
        if (message.includes('especialista') || message.includes('cardiología') || 
            message.includes('vascular')) {
            return 'specialist';
        } else if (message.includes('general') || message.includes('medicina general')) {
            return 'general';
        } else if (message.includes('agendar') || message.includes('cita')) {
            return 'book';
        }
        return 'general';
    }

    parseButtonResponse(message) {
        // Map interactive button IDs to intents
        const buttonMappings = {
            'pad_info': { type: 'PAD_INQUIRY', subtype: 'general' },
            'nursing_services': { type: 'NURSING_INQUIRY', subtype: 'general' },
            'consultations': { type: 'CONSULTATION_INQUIRY', subtype: 'general' },
            'nursing_home': { type: 'NURSING_INQUIRY', subtype: 'home' },
            'nursing_procedures': { type: 'NURSING_INQUIRY', subtype: 'procedures' },
            'nursing_schedule': { type: 'SCHEDULE_REQUEST', service: 'nursing' },
            'consultation_general': { type: 'CONSULTATION_INQUIRY', subtype: 'general' },
            'consultation_specialist': { type: 'CONSULTATION_INQUIRY', subtype: 'specialist' },
            'consultation_book': { type: 'SCHEDULE_REQUEST', service: 'consultation' },
            'contact_info': { type: 'CONTACT' },
            'schedule_info': { type: 'CONTACT' },
            'emergency_info': { type: 'CONTACT' }
        };

        // Check if message matches any button ID
        for (const [buttonId, intent] of Object.entries(buttonMappings)) {
            if (message.includes(buttonId) || message === buttonId) {
                return {
                    ...intent,
                    confidence: 1.0,
                    source: 'button_interaction'
                };
            }
        }

        return null;
    }

    extractEntities(message) {
        const entities = {};

        // Extract phone numbers
        const phoneRegex = /(?:\+57|57)?\s*[3][0-9]{9}|\b[3][0-9]{9}\b/g;
        const phones = message.match(phoneRegex);
        if (phones) {
            entities.phoneNumbers = phones;
        }

        // Extract names (simple pattern for Spanish names)
        const nameRegex = /(?:me llamo|soy|mi nombre es)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/gi;
        const nameMatch = message.match(nameRegex);
        if (nameMatch) {
            entities.name = nameMatch[0].replace(/(?:me llamo|soy|mi nombre es)\s+/i, '');
        }

        // Extract dates and times
        const dateRegex = /\b(?:hoy|mañana|pasado mañana|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2} de \w+)/gi;
        const dates = message.match(dateRegex);
        if (dates) {
            entities.dates = dates;
        }

        // Extract symptoms (for PAD)
        const symptomKeywords = [
            'dolor', 'calambres', 'hormigueo', 'entumecimiento', 'frialdad',
            'palidez', 'heridas', 'úlceras', 'claudicación'
        ];
        const symptoms = symptomKeywords.filter(symptom => message.includes(symptom));
        if (symptoms.length > 0) {
            entities.symptoms = symptoms;
        }

        // Extract urgency indicators
        const urgencyKeywords = ['urgente', 'rápido', 'inmediato', 'ya', 'ahora'];
        const urgency = urgencyKeywords.find(keyword => message.includes(keyword));
        if (urgency) {
            entities.urgency = urgency;
        }

        return entities;
    }

    // Sentiment analysis for patient communication
    analyzeSentiment(message) {
        const positiveWords = ['bien', 'mejor', 'bueno', 'excelente', 'gracias', 'perfecto'];
        const negativeWords = ['mal', 'dolor', 'preocupado', 'terrible', 'horrible', 'peor'];
        const concernWords = ['preocupado', 'nervioso', 'ansioso', 'miedo', 'temor'];

        const words = message.toLowerCase().split(/\s+/);
        
        let positiveScore = 0;
        let negativeScore = 0;
        let concernScore = 0;

        words.forEach(word => {
            if (positiveWords.includes(word)) positiveScore++;
            if (negativeWords.includes(word)) negativeScore++;
            if (concernWords.includes(word)) concernScore++;
        });

        let sentiment = 'neutral';
        if (positiveScore > negativeScore + concernScore) {
            sentiment = 'positive';
        } else if (negativeScore > positiveScore || concernScore > 0) {
            sentiment = 'negative';
        }

        return {
            sentiment: sentiment,
            scores: {
                positive: positiveScore,
                negative: negativeScore,
                concern: concernScore
            }
        };
    }

    // Extract medical context for better responses
    extractMedicalContext(message) {
        const context = {};

        // Age mentions
        const ageRegex = /(?:tengo|edad|años?)\s*(\d{1,3})\s*años?/i;
        const ageMatch = message.match(ageRegex);
        if (ageMatch) {
            context.age = parseInt(ageMatch[1]);
        }

        // Gender mentions
        if (message.includes('soy hombre') || message.includes('masculino')) {
            context.gender = 'male';
        } else if (message.includes('soy mujer') || message.includes('femenino')) {
            context.gender = 'female';
        }

        // Medical history indicators
        const medicalHistory = [];
        if (message.includes('diabetes')) medicalHistory.push('diabetes');
        if (message.includes('hipertensión') || message.includes('presión alta')) medicalHistory.push('hypertension');
        if (message.includes('corazón') || message.includes('cardíaco')) medicalHistory.push('cardiac');
        if (message.includes('cirugía')) medicalHistory.push('surgery');

        if (medicalHistory.length > 0) {
            context.medicalHistory = medicalHistory;
        }

        return context;
    }
}

module.exports = new MessageParser();
