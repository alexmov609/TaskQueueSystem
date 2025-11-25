import express from 'express';
import { emailQueue } from './queues/emailQueue';
import emailRoutes from './controllers/emailRoutes';
import { createBullBoard }
    from '@bull-board/api';
import { BullMQAdapter }
    from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter }
    from '@bull-board/express';
import EmailService from './services/EmailService';

const app = express();
app.use(express.json());

// Bull Board setup
const serverAdapter = new
    ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const emailService = EmailService.getInstance();

async function sendMail() {
    await emailService.sendEmailAlert();
}

// sendMail();

createBullBoard({
    queues: [new
        BullMQAdapter(emailQueue)
    ],
    serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

app.use('/email', emailRoutes);

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