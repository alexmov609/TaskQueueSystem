
import nodemailer from 'nodemailer';
import config from '../config/config';
import { JobData } from '../types/jobs';

class EmailService {
    private static instance: EmailService;
    private transporter: nodemailer.Transporter | null = null;

    private constructor() {
        this.initializeTransporter();
    }


    /**
         * Initialize the nodemailer transporter
         */
    private initializeTransporter() {
        if (!config.email.enabled) {
            console.log('Email notifications are disabled');
            return;
        }

        try {
            this.transporter = nodemailer.createTransport({
                host: config.email.host,
                port: config.email.port,
                secure: config.email.secure,
                auth: {
                    user: config.email.user,
                    pass: config.email.pass,
                },
            });

            console.log('Email service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize email service:', error);
        }
    }

    /**
   * Get the singleton instance of EmailService
   */
    static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    /**
     * Generate HTML email template for email alert
     */
    private generateAlertEmail(): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d9534f;">Health Alert</h2>

        <p>Queue Redis:</p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
            <p><strong>Queue name:</strong>New email alert managed by REDIS</p>
        
        </div>
    </div>
</body>
</html>
        `.trim();
    }

    /**
     * Send unhealthy server alert email
     */
    async sendEmailAlert(jobData: JobData): Promise<void> {
        if (!this.transporter || !config.email.enabled) {
            console.log('Email service not configured. Skipping email notification.');
            return;
        }

        try {
            const htmlContent = this.generateAlertEmail();

            const mailOptions = {
                from: config.email.from,
                to: config.email.alertRecipient,
                subject: `Job Alert`,
                html: htmlContent,
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`Email Alert`);
        } catch (error) {
            console.error('Failed to send alert email:', error instanceof Error ? error.message : 'Unknown error');
        }
    }

}

export default EmailService;