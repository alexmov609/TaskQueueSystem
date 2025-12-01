import express from 'express';
import { telegramQueue } from '../queues/queueFactory';
import config from '../config/config';
const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

/**
 * Telegram notification job
 */
router.post('/send-notification', async (req, res) => {
    const { chatId, message, delay } = req.body;

    // Use default chatId if not provided
    const finalChatId = chatId || config.telegram.defaultChatId;

    if (!finalChatId || !message) {
        return res.status(400).json({ error: 'Missing required fields: chatId (or default chatId in config), message' });
    }

    const data = { chatId: finalChatId, message };

    // Get delay in milliseconds if provided
    const convertedDelay = delay ? parseInt(delay, 10) : false;
    let job;

    if (convertedDelay) {
        job = await telegramQueue.add('delayed-telegram', data, {
            delay: convertedDelay
        })
    } else {
        job = await telegramQueue.add('telegram', data);
    }

    res.json({
        message: 'Telegram notification job queued',
        jobId: job.id,
    });
});

/**
 * Add Telegram notification job with cron scheduling
 * Schedules a recurring Telegram notification based on the provided cron pattern
 */
router.post('/send-cron-telegram', async (req, res) => {
    const { chatId, message } = req.body;

    // Use default chatId if not provided
    const finalChatId = chatId || config.telegram.defaultChatId;

    if (!finalChatId || !message) {
        return res.status(400).json({ error: 'Missing required fields: chatId (or default chatId in config), message' });
    }

    const data = { chatId: finalChatId, message };

    const job = await telegramQueue.upsertJobScheduler('cron-telegram', {
        pattern: '0 * * * * 0', // every Sunday at midnight
    }, { data: data })

    res.json({
        message: 'Telegram cron job scheduled',
        jobId: job.id,
    });
});

/**
 * Stop cron job
 * If jobname provided, stop that specific cron job
 * If no jobname provided, stop all cron jobs
 */
router.delete('/stop-cron-telegram', async (req, res) => {
    const { jobname } = req.body;

    if (jobname !== undefined) {
        const removed = await telegramQueue.removeJobScheduler(jobname);
        res.json({
            message: removed ? `Cron job with name ${jobname} stopped` : `Cron job with name ${jobname} not found`,
            removed
        });
    }

    // If no jobname provided, remove all schedulers
    const schedulers = await telegramQueue.getJobSchedulers();
    if (schedulers.length === 0) {
        return res.json({
            message: 'No cron jobs to stop',
        });
    }

    for (const scheduler of schedulers) {
        await telegramQueue.removeJobScheduler(scheduler.id ?? '');
    }

    res.json({
        message: 'All Telegram cron jobs stopped',
    });
});

export default router;
