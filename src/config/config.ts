import dotenv from 'dotenv';

dotenv.config();

interface Config {
    email: {
        enabled: boolean;
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
        from: string;
        alertRecipient: string;
    };
    telegram: {
        enabled: boolean;
        botToken: string;
        defaultChatId: string;
    };
}

const config: Config = {
    email: {
        enabled: process.env.EMAIL_ENABLED === 'true',
        host: process.env.EMAIL_HOST || '',
        port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
        from: process.env.EMAIL_FROM || '',
        alertRecipient: process.env.EMAIL_ALERT_RECIPIENT || '',
    },
    telegram: {
        enabled: process.env.TELEGRAM_ENABLED === 'true',
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID || '',
    }
}

export default config;