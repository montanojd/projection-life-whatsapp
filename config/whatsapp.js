const config = {
    // WhatsApp Business API Configuration
    PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || '',
    VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || 'projection_life_verify_token',
    
    // API Endpoints
    WHATSAPP_API_URL: 'https://graph.facebook.com/v17.0',
    
    // Message limits and settings
    MAX_MESSAGE_LENGTH: 4096,
    CONVERSATION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    
    // Medical service keywords in Spanish
    KEYWORDS: {
        PAD: ['pad', 'arterial', 'periférica', 'piernas', 'dolor', 'caminar', 'claudicación'],
        NURSING: ['enfermería', 'cuidados', 'domicilio', 'enfermera', 'inyección', 'curaciones'],
        CONSULTATION: ['consulta', 'cita', 'médico', 'doctor', 'especialista', 'agendar'],
        GREETING: ['hola', 'buenos', 'buenas', 'saludos', 'inicio'],
        HELP: ['ayuda', 'información', 'menu', 'opciones', 'servicios']
    },
    
    // Company information
    COMPANY: {
        name: 'PROJECTION LIFE',
        type: 'IPS Médica',
        phone: '+57 300 123 4567',
        email: 'info@projectionlife.com',
        address: 'Carrera 15 #93-47, Bogotá, Colombia'
    }
};

module.exports = config;
