const sendEmail = require('./sendEmail');

class NotificationService {
    constructor() {
        this.provider = process.env.NOTIFICATION_PROVIDER || 'mock'; // 'twilio', 'mock', etc.
    }

    async sendSMS(to, message) {
        if (this.provider === 'mock') {
            console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
            return Promise.resolve({ success: true, messageId: 'mock-sms-id' });
        }
        // Implement real SMS provider here (e.g., Twilio)
        throw new Error('SMS provider not implemented');
    }

    async sendWhatsApp(to, message) {
        if (this.provider === 'mock') {
            console.log(`[MOCK WhatsApp] To: ${to}, Message: ${message}`);
            return Promise.resolve({ success: true, messageId: 'mock-whatsapp-id' });
        }
        // Implement real WhatsApp provider here
        throw new Error('WhatsApp provider not implemented');
    }

    async sendAppointmentConfirmation(user, appointment, service) {
        const message = `Hi ${user.firstName}, your appointment for ${service.name} on ${appointment.date} at ${appointment.startTime} is confirmed. Ref: ${appointment.id}`;

        // Try to send via WhatsApp first, fallback to SMS, always log
        try {
            await this.sendWhatsApp(user.phone, message);
        } catch (e) {
            console.warn('WhatsApp failed, falling back to SMS', e);
            await this.sendSMS(user.phone, message);
        }

        // Also send email as backup (existing functionality, but good to centralize)
        // await sendEmail(...) - keeping existing email logic in controller for now to minimize refactor risk
    }

    async sendAppointmentcancellation(user, appointment, service) {
        const message = `Hi ${user.firstName}, your appointment for ${service.name} on ${appointment.date} has been cancelled.`;
        await this.sendSMS(user.phone, message);
    }

    async sendReminder(user, appointment, service) {
        const message = `Reminder: You have an appointment for ${service.name} tomorrow at ${appointment.startTime}.`;
        await this.sendSMS(user.phone, message);
    }
}

module.exports = new NotificationService();
