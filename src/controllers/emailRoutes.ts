import express from 'express';
import { emailQueue } from '../queues/emailQueue';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Add email job
router.post('/send-email', async (req, res) => {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await emailQueue.add('send-email', { to, subject, body });

    res.json({
        message: 'Email job queued',
        jobId: job.id,
    });
});

export default router;
