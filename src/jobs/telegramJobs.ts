import { Job } from 'bullmq';
import { TelegramJobData } from '../types/jobs';
import TelegramService from '../services/TelegramService';

export async function processTelegramJob(job: Job<TelegramJobData>): Promise<void> {
    const { chatId, message } = job.data;

    console.log(`Processing Telegram job ${job.id}`);

    const telegramService = TelegramService.getInstance();
    await telegramService.sendMessageBot(chatId, message);

    console.log(`Telegram message sent to chat ${chatId}`);
}
