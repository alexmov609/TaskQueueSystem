import express from 'express';
import { telegramQueue } from '../queues/queueFactory';
import { sanitize } from '../validations/validations';
import config from '../config/config';
import { getQueueStatistics } from '../utils/queueMonitor';
const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Get queue statistics
router.get('/queue-stats', async (req, res) => {
    const stats = await getQueueStatistics(telegramQueue);
    res.json(stats);
});

/**
 * Telegram notification job
 */
router.post('/send-telegram-notification', async (req, res) => {
    const { chatId, message, delay } = req.body;

    // Use default chatId if not provided
    let finalChatId = chatId || config.telegram.defaultChatId;
    finalChatId = sanitize(finalChatId);
    let sanitizedMessage = sanitize(message);

    if (!finalChatId || !sanitizedMessage) {
        return res.status(400).json({ error: 'Missing required fields: chatId (or default chatId in config), message' });
    }

    const data = { chatId: finalChatId, message: sanitizedMessage };

    // Get delay in milliseconds if provided
    const convertedDelay = delay ? parseInt(sanitize(delay), 10) : false;
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
    let finalChatId = chatId || config.telegram.defaultChatId;
    finalChatId = sanitize(finalChatId);
    const sanitizedMessage = sanitize(message);

    if (!finalChatId || !sanitizedMessage) {
        return res.status(400).json({ error: 'Missing required fields: chatId (or default chatId in config), message' });
    }

    const data = { chatId: finalChatId, message: sanitizedMessage };

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

    const validatedJobName = jobname ? sanitize(jobname) : undefined;
    if (validatedJobName !== undefined) {
        const removed = await telegramQueue.removeJobScheduler(validatedJobName);
        res.json({
            message: removed ? `Cron job with name ${validatedJobName} stopped` : `Cron job with name ${validatedJobName} not found`,
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
