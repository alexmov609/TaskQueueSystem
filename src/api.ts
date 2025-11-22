import express from 'express';
import { emailQueue } from './queues/emailQueue';
import { log } from 'console';

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Add email job
app.post('/send-email', async (req, res) => {
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

// Check job status
app.get('/job/:id', async (req, res) => {
    const job = await emailQueue.getJob(req.params.id);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();

    res.json({
        id: job.id,
        state,
        data: job.data,
        progress: job.progress,
        failedReason: job.failedReason,
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});