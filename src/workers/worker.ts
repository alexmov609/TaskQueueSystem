import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import { processEmailJob } from '../jobs/emailJobs';
import { processSmsJob } from '../jobs/smsJobs';
import { emailQueue, smsQueue } from '../queues/queueFactory';

// Create worker for email queue
const emailWorker = new Worker('email-queue', processEmailJob, {
    connection: redisConnection,
    concurrency: 5,  // process 5 jobs in parallel
});

// Create worker for SMS queue
const smsWorker = new Worker('sms-queue', processSmsJob, {
    connection: redisConnection,
    concurrency: 5,
});

// Set global concurrency for both queues
async function setGlobalConcurrency() {
    await emailQueue.setGlobalConcurrency(2);
    await smsQueue.setGlobalConcurrency(2);
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
smsWorker.on('completed', (job) => {
    console.log(`✓ [SMS] Job ${job.id} completed`);
});

smsWorker.on('failed', (job, err) => {
    console.error(`✗ [SMS] Job ${job?.id} failed: ${err.message}`);
});

smsWorker.on('ready', () => {
    console.log('SMS worker is ready and listening for jobs...');
});

console.log('Workers started - listening for email and SMS jobs');