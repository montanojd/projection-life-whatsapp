const config = require('../config/whatsapp');

class ResponseTemplates {
    getWelcomeMessage() {
        return {
            type: 'interactive',
            interactive: {
                type: 'button',
                header: {
                    type: 'text',
                    text: '🏥 PROJECTION LIFE - IPS Médica'
                },
                body: {
                    text: '¡Hola! Bienvenido(a) a PROJECTION LIFE.\n\n' +
                          'Somos su IPS médica especializada en servicios de salud integrales.\n\n' +
                          '¿En qué podemos ayudarle hoy?'
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: {
                                id: 'pad_info',
                                title: '🩺 Información PAD'
                            }
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'nursing_services',
                                title: '👩‍⚕️ Servicios Enfermería'
                            }
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'consultations',
                                title: '📅 Consultas Médicas'
                            }
                        }
                    ]
                }
            }
        };
    }

    getPADInformation(subtype = 'general') {
        const responses = {
            general: {
                type: 'text',
                text: '🩺 *ENFERMEDAD ARTERIAL PERIFÉRICA (PAD)*\n\n' +
                      '✅ *¿Qué es la PAD?*\n' +
                      'La Enfermedad Arterial Periférica es una condición donde las arterias que llevan sangre a las extremidades se estrechan o bloquean.\n\n' +
                      '⚠️ *Síntomas comunes:*\n' +
                      '• Dolor en piernas al caminar\n' +
                      '• Calambres musculares\n' +
                      '• Heridas que sanan lentamente\n' +
                      '• Frialdad en extremidades\n\n' +
                      '🏥 *Nuestros servicios PAD:*\n' +
                      '• Diagnóstico especializado\n' +
                      '• Tratamiento personalizado\n' +
                      '• Seguimiento continuo\n' +
                      '• Rehabilitación vascular\n\n' +
                      '📞 Para agendar una evaluación, escriba "agendar PAD"'
            },
            symptoms: {
                type: 'text',
                text: '⚠️ *SÍNTOMAS DE PAD - BUSQUE ATENCIÓN MÉDICA SI PRESENTA:*\n\n' +
                      '🚨 *Síntomas de emergencia:*\n' +
                      '• Dolor severo y súbito en pierna\n' +
                      '• Pérdida completa de sensación\n' +
                      '• Palidez extrema en extremidad\n' +
                      '• Ausencia total de pulso\n\n' +
                      '⚠️ *Síntomas para evaluación:*\n' +
                      '• Dolor al caminar que mejora en reposo\n' +
                      '• Heridas que no cicatrizan\n' +
                      '• Frialdad persistente en pies\n' +
                      '• Cambios de color en la piel\n\n' +
                      '📱 *EMERGENCIA:* Llame al 123\n' +
                      '📞 *Consulta:* ' + config.COMPANY.phone
            },
            treatment: {
                type: 'text',
                text: '🏥 *TRATAMIENTOS PAD EN PROJECTION LIFE*\n\n' +
                      '💊 *Tratamiento médico:*\n' +
                      '• Medicamentos anticoagulantes\n' +
                      '• Control de factores de riesgo\n' +
                      '• Terapia antiplaquetaria\n\n' +
                      '🔬 *Procedimientos especializados:*\n' +
                      '• Angioplastia\n' +
                      '• Colocación de stents\n' +
                      '• Cirugía de bypass\n\n' +
                      '🏃‍♂️ *Rehabilitación:*\n' +
                      '• Programa de ejercicios supervisado\n' +
                      '• Fisioterapia vascular\n' +
                      '• Educación en autocuidado\n\n' +
                      '📅 ¿Desea agendar una consulta especializada?'
            }
        };

        return responses[subtype] || responses.general;
    }

    getNursingInformation(subtype = 'general') {
        const responses = {
            general: {
                type: 'interactive',
                interactive: {
                    type: 'button',
                    header: {
                        type: 'text',
                        text: '👩‍⚕️ Servicios de Enfermería'
                    },
                    body: {
                        text: '*SERVICIOS DE ENFERMERÍA PROJECTION LIFE*\n\n' +
                              '🏠 *Enfermería a domicilio 24/7*\n' +
                              '• Cuidados post-operatorios\n' +
                              '• Administración de medicamentos\n' +
                              '• Curaciones y vendajes\n' +
                              '• Toma de signos vitales\n' +
                              '• Cuidados paliativos\n\n' +
                              '🏥 *Servicios institucionales*\n' +
                              '• Procedimientos especializados\n' +
                              '• Educación en salud\n' +
                              '• Acompañamiento familiar'
                    },
                    action: {
                        buttons: [
                            {
                                type: 'reply',
                                reply: {
                                    id: 'nursing_home',
                                    title: '🏠 Enfermería Domicilio'
                                }
                            },
                            {
                                type: 'reply',
                                reply: {
                                    id: 'nursing_procedures',
                                    title: '💉 Procedimientos'
                                }
                            },
                            {
                                type: 'reply',
                                reply: {
                                    id: 'nursing_schedule',
                                    title: '📅 Agendar Servicio'
                                }
                            }
                        ]
                    }
                }
            },
            home: {
                type: 'text',
                text: '🏠 *ENFERMERÍA A DOMICILIO - 24 HORAS*\n\n' +
                      '👩‍⚕️ *Servicios disponibles:*\n' +
                      '• Aplicación de inyecciones\n' +
                      '• Curaciones de heridas\n' +
                      '• Toma de presión arterial\n' +
                      '• Control de glucemia\n' +
                      '• Cuidados post-quirúrgicos\n' +
                      '• Sondajes vesicales\n' +
                      '• Administración de sueros\n\n' +
                      '⏰ *Horarios de atención:*\n' +
                      '• Lunes a Domingo 24/7\n' +
                      '• Servicios de emergencia\n' +
                      '• Citas programadas\n\n' +
                      '💰 *Tarifas desde $45.000*\n' +
                      '📞 Solicitar servicio: ' + config.COMPANY.phone
            },
            procedures: {
                type: 'text',
                text: '💉 *PROCEDIMIENTOS DE ENFERMERÍA*\n\n' +
                      '🔹 *Procedimientos básicos:*\n' +
                      '• Inyecciones intramusculares\n' +
                      '• Inyecciones subcutáneas\n' +
                      '• Inyecciones endovenosas\n' +
                      '• Toma de muestras de sangre\n\n' +
                      '🔹 *Curaciones:*\n' +
                      '• Heridas quirúrgicas\n' +
                      '• Úlceras por presión\n' +
                      '• Quemaduras menores\n' +
                      '• Pie diabético\n\n' +
                      '🔹 *Procedimientos especializados:*\n' +
                      '• Sondaje vesical\n' +
                      '• Lavado gástrico\n' +
                      '• Nebulizaciones\n' +
                      '• Oxigenoterapia\n\n' +
                      '📋 Todos los procedimientos con enfermeras licenciadas'
            }
        };

        return responses[subtype] || responses.general;
    }

    getConsultationInformation(subtype = 'general') {
        const responses = {
            general: {
                type: 'interactive',
                interactive: {
                    type: 'button',
                    header: {
                        type: 'text',
                        text: '👨‍⚕️ Consultas Médicas'
                    },
                    body: {
                        text: '*CONSULTAS MÉDICAS PROJECTION LIFE*\n\n' +
                              '🏥 *Especialidades disponibles:*\n' +
                              '• Medicina General\n' +
                              '• Cardiología\n' +
                              '• Cirugía Vascular\n' +
                              '• Medicina Interna\n' +
                              '• Neurología\n\n' +
                              '📅 *Modalidades de consulta:*\n' +
                              '• Consulta presencial\n' +
                              '• Telemedicina\n' +
                              '• Urgencias 24/7'
                    },
                    action: {
                        buttons: [
                            {
                                type: 'reply',
                                reply: {
                                    id: 'consultation_general',
                                    title: '🩺 Medicina General'
                                }
                            },
                            {
                                type: 'reply',
                                reply: {
                                    id: 'consultation_specialist',
                                    title: '🫀 Especialistas'
                                }
                            },
                            {
                                type: 'reply',
                                reply: {
                                    id: 'consultation_book',
                                    title: '📅 Agendar Cita'
                                }
                            }
                        ]
                    }
                }
            },
            general: {
                type: 'text',
                text: '🩺 *MEDICINA GENERAL*\n\n' +
                      '👨‍⚕️ *Servicios incluidos:*\n' +
                      '• Consulta médica integral\n' +
                      '• Evaluación de síntomas\n' +
                      '• Diagnóstico y tratamiento\n' +
                      '• Prescripción médica\n' +
                      '• Seguimiento y control\n\n' +
                      '📋 *Atendemos:*\n' +
                      '• Enfermedades comunes\n' +
                      '• Control de crónicos\n' +
                      '• Medicina preventiva\n' +
                      '• Certificados médicos\n\n' +
                      '💰 *Valor consulta: $80.000*\n' +
                      '⏰ *Duración: 30 minutos*\n' +
                      '📞 Agendar: ' + config.COMPANY.phone
            },
            specialist: {
                type: 'text',
                text: '🫀 *CONSULTAS ESPECIALIZADAS*\n\n' +
                      '🔸 *Cardiología:*\n' +
                      '• Evaluación cardiovascular\n' +
                      '• Electrocardiograma\n' +
                      '• Control de hipertensión\n\n' +
                      '🔸 *Cirugía Vascular:*\n' +
                      '• Evaluación de PAD\n' +
                      '• Estudios Doppler\n' +
                      '• Procedimientos vasculares\n\n' +
                      '🔸 *Medicina Interna:*\n' +
                      '• Enfermedades complejas\n' +
                      '• Diabetes y metabolismo\n' +
                      '• Control integral\n\n' +
                      '💰 *Valor: $120.000 - $180.000*\n' +
                      '📅 ¿Qué especialidad necesita?'
            }
        };

        return responses[subtype] || responses.general;
    }

    getHelpMenu() {
        return {
            type: 'interactive',
            interactive: {
                type: 'list',
                header: {
                    type: 'text',
                    text: '📋 Menú de Ayuda'
                },
                body: {
                    text: 'Seleccione la opción que necesita:'
                },
                action: {
                    button: 'Ver opciones',
                    sections: [
                        {
                            title: 'Servicios Médicos',
                            rows: [
                                {
                                    id: 'pad_info',
                                    title: 'Información PAD',
                                    description: 'Enfermedad Arterial Periférica'
                                },
                                {
                                    id: 'nursing_services',
                                    title: 'Servicios Enfermería',
                                    description: 'Enfermería a domicilio y procedimientos'
                                },
                                {
                                    id: 'consultations',
                                    title: 'Consultas Médicas',
                                    description: 'Medicina general y especialistas'
                                }
                            ]
                        },
                        {
                            title: 'Información',
                            rows: [
                                {
                                    id: 'contact_info',
                                    title: 'Contacto',
                                    description: 'Teléfonos y ubicación'
                                },
                                {
                                    id: 'schedule_info',
                                    title: 'Horarios',
                                    description: 'Horarios de atención'
                                },
                                {
                                    id: 'emergency_info',
                                    title: 'Emergencias',
                                    description: 'Atención de urgencias'
                                }
                            ]
                        }
                    ]
                }
            }
        };
    }

    getContactInformation() {
        return {
            type: 'text',
            text: '📞 *INFORMACIÓN DE CONTACTO*\n\n' +
                  '🏥 *' + config.COMPANY.name + ' - ' + config.COMPANY.type + '*\n\n' +
                  '📱 *Teléfono principal:*\n' + config.COMPANY.phone + '\n\n' +
                  '📧 *Email:*\n' + config.COMPANY.email + '\n\n' +
                  '📍 *Dirección:*\n' + config.COMPANY.address + '\n\n' +
                  '⏰ *Horarios de atención:*\n' +
                  '• Lunes a Viernes: 7:00 AM - 7:00 PM\n' +
                  '• Sábados: 8:00 AM - 4:00 PM\n' +
                  '• Domingos y festivos: 9:00 AM - 1:00 PM\n\n' +
                  '🚨 *Urgencias 24/7:* Línea 123\n' +
                  '💬 *WhatsApp:* Este chat'
        };
    }

    getSchedulingInformation(service = 'general') {
        const schedules = {
            pad: 'Para agendar evaluación PAD, necesitamos:\n• Nombre completo\n• Cédula\n• Teléfono\n• Síntomas principales\n• EPS o seguro médico',
            nursing: 'Para servicios de enfermería:\n• Nombre del paciente\n• Dirección completa\n• Tipo de procedimiento\n• Fecha y hora preferida\n• Contacto familiar',
            consultation: 'Para agendar consulta médica:\n• Nombre completo\n• Cédula\n• EPS o particular\n• Especialidad requerida\n• Fecha preferida'
        };

        return {
            type: 'text',
            text: '📅 *AGENDAR CITA - ' + service.toUpperCase() + '*\n\n' +
                  '📋 *Información requerida:*\n' +
                  (schedules[service] || schedules.general) + '\n\n' +
                  '📞 *Para agendar, contáctenos:*\n' +
                  '• WhatsApp: ' + config.COMPANY.phone + '\n' +
                  '• Llamada directa: ' + config.COMPANY.phone + '\n\n' +
                  '⚡ *Respuesta inmediata* en horario laboral\n' +
                  '🕐 *Confirmación de cita* en menos de 2 horas\n\n' +
                  '¿Desea que un asesor lo contacte ahora?'
        };
    }

    getUnknownResponse(message) {
        return {
            type: 'text',
            text: '❓ *No pude entender su consulta*\n\n' +
                  'Por favor, seleccione una de estas opciones:\n\n' +
                  '🩺 Escriba *PAD* para información sobre Enfermedad Arterial Periférica\n' +
                  '👩‍⚕️ Escriba *ENFERMERÍA* para servicios de enfermería\n' +
                  '📅 Escriba *CONSULTA* para agendar cita médica\n' +
                  '📞 Escriba *CONTACTO* para información de contacto\n' +
                  '📋 Escriba *AYUDA* para ver el menú completo\n\n' +
                  '🤝 O puede contactar directamente con un asesor:\n' +
                  '📱 ' + config.COMPANY.phone
        };
    }

    getErrorResponse() {
        return {
            type: 'text',
            text: '⚠️ *Error temporal en el sistema*\n\n' +
                  'Lamentamos el inconveniente. Por favor:\n\n' +
                  '1️⃣ Intente nuevamente en unos momentos\n' +
                  '2️⃣ O contáctenos directamente:\n' +
                  '📱 ' + config.COMPANY.phone + '\n\n' +
                  '👨‍💻 Nuestro equipo técnico ha sido notificado y está trabajando para resolver este problema.\n\n' +
                  '¡Gracias por su paciencia!'
        };
    }

    getEmergencyResponse() {
        return {
            type: 'text',
            text: '🚨 *EMERGENCIA MÉDICA DETECTADA*\n\n' +
                  '⚡ *ACCIÓN INMEDIATA REQUERIDA:*\n\n' +
                  '📞 **LLAME YA AL 123**\n' +
                  '🏥 **Solicite ambulancia**\n\n' +
                  '📱 *También puede llamarnos:*\n' +
                  config.COMPANY.phone + '\n\n' +
                  '🆘 *Si es una emergencia cardiovascular:*\n' +
                  '• No se mueva innecesariamente\n' +
                  '• Mantenga la calma\n' +
                  '• Tome medicación de emergencia si la tiene prescrita\n\n' +
                  '💙 PROJECTION LIFE - Estamos aquí para ayudarle'
        };
    }
}

module.exports = new ResponseTemplates();
