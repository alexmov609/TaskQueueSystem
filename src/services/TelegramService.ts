import TelegramBot from 'node-telegram-bot-api';
import config from '../config/config';

class TelegramService {
    private static instance: TelegramService;
    private bot: TelegramBot | null = null;

    private constructor() {
        this.initializeBot();
    }

    /**
     * Initialize the Telegram bot
     */
    private initializeBot() {
        if (!config.telegram.enabled) {
            console.log('Telegram notifications are disabled');
            return;
        }

        if (!config.telegram.botToken) {
            console.log('Telegram bot token not configured');
            return;
        }

        try {
            this.bot = new TelegramBot(config.telegram.botToken, { polling: false });
            console.log('Telegram service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Telegram service:', error);
        }
    }

    /**
     * Get the singleton instance of TelegramService
     */
    static getInstance(): TelegramService {
        if (!TelegramService.instance) {
            TelegramService.instance = new TelegramService();
        }
        return TelegramService.instance;
    }

    /**
     * Send a message to a specific chat
     */
    async sendMessageBot(chatId: string, message: string): Promise<void> {
        if (!this.bot || !config.telegram.enabled) {
            console.log('Telegram service not configured. Skipping notification.');
            return;
        }

        try {
            await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
            console.log(`Telegram message sent to chat ${chatId}`);
        } catch (error) {
            console.error('Failed to send Telegram message:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }

    /**
     * Send a message to the default chat
     */
    async sendDefaultMessage(message: string): Promise<void> {
        const chatId = config.telegram.defaultChatId;

        if (!chatId) {
            console.log('Default chat ID not configured. Skipping notification.');
            return;
        }

        await this.sendMessageBot(chatId, message);
    }
}

export default TelegramService;
