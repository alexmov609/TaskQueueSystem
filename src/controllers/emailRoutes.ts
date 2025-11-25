import express from 'express';
import { emailQueue } from '../queues/emailQueue';
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Add email job
router.post('/send-email', async (req, res) => {
    const { to, subject, body, delay } = req.body;

    const data = { to, subject, body };
    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get delay in milliseconds if provided
    const convertedDelay = delay ? parseInt(delay, 10) : false;
    let job;

    if (convertedDelay) {
        job = await emailQueue.add('delayed-email', data, {
            delay: convertedDelay
        })
    } else {
        job = await emailQueue.add('email', data);
    }

    res.json({
        message: 'Email job queued',
        jobId: job.id,
    });
});

/**
 * Add email job with cron scheduling
 * Schedules a recurring email job based on the provided cron pattern
 */
router.post('/send-cron-email', async (req, res) => {
    const { to, subject, body } = req.body;

    const data = { to, subject, body };
    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
    }


    const job = await emailQueue.upsertJobScheduler('cron-email', {
        pattern: '0 * * * * 0',
    }, { data: data })
    res.json({
        message: 'Email job queued',
        jobId: job.id,
    });
});

/**
 * Stop cron job
 * If jobname provided, stop that specific cron job
 * If no jobname provided, stop all cron jobs
 */
router.delete('/stop-cron-email', async (req, res) => {
    const { jobname } = req.body;

    console.log(jobname)
    if (jobname !== undefined) {
        const removed = await emailQueue.removeJobScheduler(jobname);
        res.json({
            message: removed ? `Cron job with name ${jobname} stopped` : `Cron job with name ${jobname} not found`,
            removed
        });
    }

    // If no jobname provided, remove all schedulers
    const schedulers = await emailQueue.getJobSchedulers();
    if (schedulers.length === 0) {
        return res.json({
            message: 'No cron jobs to stop',
        });
    }

    for (const scheduler of schedulers) {
        await emailQueue.removeJobScheduler(scheduler.id ?? '');
    }

    res.json({
        message: 'All cron jobs stopped',
    });
});

export default router;
