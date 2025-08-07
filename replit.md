# Overview

This is a WhatsApp webhook service for PROJECTION LIFE, a Colombian medical IPS (Institución Prestadora de Servicios de Salud). The service provides automated customer support through WhatsApp Business API, handling inquiries about medical services including PAD (Peripheral Arterial Disease) treatments, nursing services, and medical consultations. The system features intelligent message parsing, conversation management, and automated responses in Spanish to improve patient engagement and streamline appointment booking processes.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
The application follows a modular Express.js architecture with clear separation of concerns:

- **Entry Point**: `server.js` serves as the main application entry point with middleware configuration
- **Route Handling**: RESTful API structure with dedicated webhook routes in `/routes/webhook.js`
- **Service Layer**: Business logic separated into specialized services for message handling, conversation management, and response templates
- **Middleware Layer**: Custom webhook verification middleware for security and request validation
- **Utility Layer**: Shared utilities for logging and message parsing

## Message Processing Pipeline
The system implements a sophisticated message processing pipeline:

1. **Webhook Verification**: Validates incoming WhatsApp webhook requests using signature verification and token validation
2. **Message Parsing**: Intelligent intent recognition using keyword matching and context analysis
3. **Conversation Management**: Stateful conversation tracking with session data and context preservation
4. **Response Generation**: Template-based response system with interactive buttons and structured messages
5. **Error Handling**: Comprehensive error logging and graceful failure handling

## Security Implementation
- **Webhook Verification**: HMAC-SHA256 signature validation for incoming requests
- **Rate Limiting**: Built-in protection against message flooding
- **Environment Configuration**: Secure credential management through environment variables
- **Request Validation**: Payload structure validation before processing

## Conversation State Management
The system maintains conversation context through:
- **Session Tracking**: User preferences, language settings, and service types
- **State Machine**: Conversation flow management with states like INITIAL, SERVICE_SELECTION, APPOINTMENT_BOOKING
- **Memory Management**: Automatic cleanup of expired conversations to prevent memory leaks
- **Message History**: Conversation log storage for context-aware responses

## Medical Service Classification
Specialized keyword-based classification for:
- **PAD Services**: Peripheral arterial disease consultation and treatment
- **Nursing Services**: Home healthcare and nursing support
- **General Consultations**: Medical appointments and specialist referrals
- **Emergency Detection**: Priority handling for urgent medical situations

# External Dependencies

## WhatsApp Business API
- **Facebook Graph API v17.0**: Core messaging platform integration
- **Webhook System**: Real-time message delivery and verification
- **Interactive Messages**: Button-based user interfaces and quick replies
- **Media Support**: Capability for multimedia message handling

## Core Backend Dependencies
- **Express.js 5.1.0**: Web application framework and HTTP server
- **Body-parser 2.2.0**: Request payload parsing middleware
- **CORS 2.8.5**: Cross-origin resource sharing configuration
- **Helmet 8.1.0**: Security middleware for HTTP headers

## Utility Libraries
- **Axios 1.11.0**: HTTP client for external API communications
- **Winston 3.17.0**: Structured logging with multiple output formats
- **Moment.js 2.30.1**: Date and time manipulation for scheduling
- **Node-cron 4.2.1**: Scheduled task execution for maintenance
- **Crypto**: Built-in Node.js module for webhook signature verification

## Development and Deployment
- **Dotenv 17.2.1**: Environment variable management
- **Static File Serving**: Built-in Express static middleware for web interface
- **Health Check Endpoint**: System monitoring and uptime verification