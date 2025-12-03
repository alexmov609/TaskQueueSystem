import express from 'express';
import { emailQueue } from '../queues/queueFactory';
import { validateEmails, validateSubject, sanitize } from '../validations/validations';
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Add email job
router.post('/send-email', async (req, res) => {
    const { to, subject, body, delay } = req.body;

    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    let validatedEmails = validateEmails(Array.isArray(to) ? to : [to]);
    if (validatedEmails.length === 0) {
        return res.status(400).json({ error: 'No valid email addresses provided' });
    }

    let validatedSubject = validateSubject(subject);
    validatedSubject = sanitize(subject);
    let validatedBody = sanitize(body);


    // Get delay in milliseconds if provided
    const convertedDelay = delay ? parseInt(delay, 10) : false;

    const jobs = await Promise.all(
        validatedEmails.map(async (email: string) => {
            const data = { to: email, subject: validatedSubject, body: validatedBody };
            if (convertedDelay) {
                return await emailQueue.add('delayed-email', data, {
                    delay: convertedDelay
                });
            } else {
                return await emailQueue.add('email', data);
            }
        })
    );

    res.json({
        message: 'Email job queued',
        jobIds: jobs.map(job => job.id),
        count: jobs.length
    });
});

/**
 * Add email job with cron scheduling
 * Schedules a recurring email job based on the provided cron pattern
 */
router.post('/send-cron-email', async (req, res) => {
    const { to, subject, body, cronPattern } = req.body;

    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    let validatedEmails = validateEmails(Array.isArray(to) ? to : [to]);
    if (validatedEmails.length === 0) {
        return res.status(400).json({ error: 'No valid email addresses provided' });
    }

    let validatedSubject = validateSubject(subject);
    validatedSubject = sanitize(subject);
    let validatedBody = sanitize(body);

    const jobs = await Promise.all(
        validatedEmails.map(async (email: string) => {
            const data = { to: email, subject: validatedSubject, body: validatedBody };
            return await emailQueue.upsertJobScheduler('cron-email', {
                pattern: cronPattern || '0 * * * *',
            }, { data: data })
        })
    );

    res.json({
        message: 'Email job queued',
        jobIds: jobs.map(job => job.id),
        count: jobs.length
    });
});

/**
 * Stop cron job
 * If jobname provided, stop that specific cron job
 * If no jobname provided, stop all cron jobs
 */
router.delete('/stop-cron-email', async (req, res) => {
    const { jobname } = req.body;

    let validatedJobName = sanitize(jobname);

    console.log(jobname)
    if (validatedJobName !== undefined) {
        const removed = await emailQueue.removeJobScheduler(validatedJobName);
        res.json({
            message: removed ? `Cron job with name ${validatedJobName} stopped` : `Cron job with name ${validatedJobName} not found`,
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
