import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import { processEmailJob } from '../jobs/emailJobs';

const worker = new Worker('email-queue', processEmailJob, {
    connection: redisConnection,
    concurrency: 5,  // process 5 jobs in parallel
});

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