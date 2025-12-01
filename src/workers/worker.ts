import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import { processEmailJob } from '../jobs/emailJobs';
import { processTelegramJob } from '../jobs/telegramJobs';
import { emailQueue, telegramQueue } from '../queues/queueFactory';

// Create worker for email queue
const emailWorker = new Worker('email-queue', processEmailJob, {
    connection: redisConnection,
    concurrency: 5,  // process 5 jobs in parallel
});

// Create worker for SMS queue
const telegramWorker = new Worker('telegram-queue', processTelegramJob, {
    connection: redisConnection,
    concurrency: 5,
});

// Set global concurrency for both queues
async function setGlobalConcurrency() {
    await emailQueue.setGlobalConcurrency(2);
    await telegramQueue.setGlobalConcurrency(2);
}

setGlobalConcurrency();

// Email worker event handlers
emailWorker.on('completed', (job) => {
    console.log(`✓ [EMAIL] Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`✗ [EMAIL] Job ${job?.id} failed: ${err.message}`);
});

emailWorker.on('ready', () => {
    console.log('Email worker is ready and listening for jobs...');
});

// SMS worker event handlers
telegramWorker.on('completed', (job) => {
    console.log(`✓ [Telegram] Job ${job.id} completed`);
});

telegramWorker.on('failed', (job, err) => {
    console.error(`✗ [Telegram] Job ${job?.id} failed: ${err.message}`);
});

telegramWorker.on('ready', () => {
    console.log('Telegram worker is ready and listening for jobs...');
});

console.log('Workers started - listening for email and SMS jobs');