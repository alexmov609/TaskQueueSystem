import express from 'express';
import { smsQueue } from '../queues/queueFactory';
const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Add SMS job
router.post('/send-sms', async (req, res) => {
    const { to, body, delay } = req.body;

    const data = { to, body };
    if (!to || !body) {
        return res.status(400).json({ error: 'Missing required fields: to, body' });
    }

    // Get delay in milliseconds if provided
    const convertedDelay = delay ? parseInt(delay, 10) : false;
    let job;

    if (convertedDelay) {
        job = await smsQueue.add('delayed-sms', data, {
            delay: convertedDelay
        })
    } else {
        job = await smsQueue.add('sms', data);
    }

    res.json({
        message: 'SMS job queued',
        jobId: job.id,
    });
});

/**
 * Add SMS job with cron scheduling
 * Schedules a recurring SMS job based on the provided cron pattern
 */
router.post('/send-cron-sms', async (req, res) => {
    const { to, body } = req.body;

    const data = { to, body };
    if (!to || !body) {
        return res.status(400).json({ error: 'Missing required fields: to, body' });
    }

    const job = await smsQueue.upsertJobScheduler('cron-sms', {
        pattern: '0 * * * * 0', // every Sunday at midnight
    }, { data: data })

    res.json({
        message: 'SMS cron job scheduled',
        jobId: job.id,
    });
});

/**
 * Stop cron job
 * If jobname provided, stop that specific cron job
 * If no jobname provided, stop all cron jobs
 */
router.delete('/stop-cron-sms', async (req, res) => {
    const { jobname } = req.body;

    if (jobname !== undefined) {
        const removed = await smsQueue.removeJobScheduler(jobname);
        res.json({
            message: removed ? `Cron job with name ${jobname} stopped` : `Cron job with name ${jobname} not found`,
            removed
        });
    }

    // If no jobname provided, remove all schedulers
    const schedulers = await smsQueue.getJobSchedulers();
    if (schedulers.length === 0) {
        return res.json({
            message: 'No cron jobs to stop',
        });
    }

    for (const scheduler of schedulers) {
        await smsQueue.removeJobScheduler(scheduler.id ?? '');
    }

    res.json({
        message: 'All SMS cron jobs stopped',
    });
});

export default router;
