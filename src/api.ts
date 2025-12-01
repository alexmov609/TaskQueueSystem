import express from 'express';
import { emailQueue, telegramQueue } from './queues/queueFactory';
import emailRoutes from './controllers/emailRoutes';
import telegramRoutes from './controllers/telegramRoutes'
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

const app = express();
app.use(express.json());

// Bull Board setup
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
    queues: [
        new BullMQAdapter(emailQueue),
        new BullMQAdapter(telegramQueue)
    ],
    serverAdapter,
});

// UI dahsboard, http://localhost:3000/admin/queues
app.use('/admin/queues', serverAdapter.getRouter());

app.use('/email', emailRoutes);
app.use('/notification', telegramRoutes);

// // Check job status - searches both queues
// app.get('/job/:id', async (req, res) => {
//     // Try to find job in email queue first
//     let job = await emailQueue.getJob(req.params.id);
//     let queueType = 'email';

//     // If not found, try SMS queue
//     if (!job) {
//         job = await smsQueue.getJob(req.params.id);
//         queueType = 'sms';
//     }

//     if (!job) {
//         return res.status(404).json({ error: 'Job not found in any queue' });
//     }

//     const state = await job.getState();

//     res.json({
//         id: job.id,
//         queueType,
//         state,
//         data: job.data,
//         progress: job.progress,
//         failedReason: job.failedReason,
//     });
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});