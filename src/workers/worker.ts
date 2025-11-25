import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import { processEmailJob } from '../jobs/emailJobs';
import { emailQueue } from '../queues/emailQueue';

const worker = new Worker('email-queue', processEmailJob, {
    connection: redisConnection,
    concurrency: 5,  // process 5 jobs in parallel
});

// Set concurrency for email processing
async function setGlobalConcurrency() {
    await emailQueue.setGlobalConcurrency(2)
}

setGlobalConcurrency();

worker.on('completed', (job) => {
    console.log(`✓ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`✗ Job ${job?.id} failed: ${err.message}`);
});

worker.on('ready', () => {
    console.log('Worker is ready and listening for jobs...');
});

console.log('Worker started');