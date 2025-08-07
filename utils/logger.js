const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logLevels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };
        
        this.currentLevel = this.logLevels[process.env.LOG_LEVEL || 'INFO'];
        this.logToFile = process.env.LOG_TO_FILE === 'true';
        this.logDir = './logs';
        
        if (this.logToFile) {
            this.ensureLogDirectory();
        }
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ' | ' + JSON.stringify(data) : '';
        return `[${timestamp}] [${level}] ${message}${dataStr}`;
    }

    writeToFile(level, message, data) {
        if (!this.logToFile) return;

        const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
        const formattedMessage = this.formatMessage(level, message, data) + '\n';
        
        fs.appendFile(logFile, formattedMessage, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            }
        });
    }

    writeToConsole(level, message, data) {
        const formattedMessage = this.formatMessage(level, message, data);
        
        switch (level) {
            case 'ERROR':
                console.error(formattedMessage);
                break;
            case 'WARN':
                console.warn(formattedMessage);
                break;
            case 'INFO':
                console.info(formattedMessage);
                break;
            case 'DEBUG':
                console.debug(formattedMessage);
                break;
            default:
                console.log(formattedMessage);
        }
    }

    log(level, message, data = null) {
        if (this.logLevels[level] <= this.currentLevel) {
            this.writeToConsole(level, message, data);
            this.writeToFile(level, message, data);
        }
    }

    error(message, data = null) {
        this.log('ERROR', message, data);
        
        // Log stack trace if data is an Error object
        if (data instanceof Error) {
            this.log('ERROR', 'Stack trace:', data.stack);
        }
    }

    warn(message, data = null) {
        this.log('WARN', message, data);
    }

    info(message, data = null) {
        this.log('INFO', message, data);
    }

    debug(message, data = null) {
        this.log('DEBUG', message, data);
    }

    // Medical-specific logging methods
    logMedicalInteraction(phoneNumber, service, action, details = {}) {
        this.info(`Medical interaction: ${action}`, {
            phone: this.maskPhoneNumber(phoneNumber),
            service: service,
            action: action,
            timestamp: new Date().toISOString(),
            ...details
        });
    }

    logPatientActivity(phoneNumber, activity, metadata = {}) {
        this.info(`Patient activity: ${activity}`, {
            phone: this.maskPhoneNumber(phoneNumber),
            activity: activity,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    logEmergencyAlert(phoneNumber, symptoms, urgencyLevel = 'HIGH') {
        this.error(`EMERGENCY ALERT - Urgency: ${urgencyLevel}`, {
            phone: this.maskPhoneNumber(phoneNumber),
            symptoms: symptoms,
            urgencyLevel: urgencyLevel,
            timestamp: new Date().toISOString(),
            alertId: this.generateAlertId()
        });
    }

    logAppointmentRequest(phoneNumber, service, requestedDate, status) {
        this.info(`Appointment request: ${service}`, {
            phone: this.maskPhoneNumber(phoneNumber),
            service: service,
            requestedDate: requestedDate,
            status: status,
            timestamp: new Date().toISOString()
        });
    }

    // Utility methods
    maskPhoneNumber(phoneNumber) {
        if (!phoneNumber || phoneNumber.length < 4) {
            return '***';
        }
        return phoneNumber.substring(0, 3) + '***' + phoneNumber.substring(phoneNumber.length - 2);
    }

    generateAlertId() {
        return 'ALERT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // System monitoring
    logSystemMetrics() {
        const metrics = {
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
        
        this.info('System metrics', metrics);
    }

    // Clean up old log files (keep last 30 days)
    cleanupLogs() {
        if (!this.logToFile) return;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        fs.readdir(this.logDir, (err, files) => {
            if (err) {
                this.error('Error reading log directory:', err);
                return;
            }

            files.forEach(file => {
                if (file.endsWith('.log')) {
                    const filePath = path.join(this.logDir, file);
                    const fileDate = file.replace('.log', '');
                    
                    if (new Date(fileDate) < thirtyDaysAgo) {
                        fs.unlink(filePath, (unlinkErr) => {
                            if (unlinkErr) {
                                this.error('Error deleting old log file:', unlinkErr);
                            } else {
                                this.info(`Deleted old log file: ${file}`);
                            }
                        });
                    }
                }
            });
        });
    }
}

module.exports = new Logger();
