import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import { processEmailJob } from '../jobs/emailJobs';
import { processTelegramJob } from '../jobs/telegramJobs';
import { emailQueue, telegramQueue } from '../queues/queueFactory';
import {
    getQueueStatistics,
    shouldAlert,
    logQueueStatistics,
    handleAlert,
    AlertThresholds
} from '../utils/queueMonitor';

// Alert thresholds configuration
const emailAlertThresholds: AlertThresholds = {
    maxFailed: 10,        // Alert if more than 10 failed jobs
    maxWaiting: 50,       // Alert if more than 50 jobs waiting
    maxActive: 10,        // Alert if more than 10 jobs active (might indicate stuck jobs)
    failureRate: 20,      // Alert if failure rate exceeds 20%
};

const telegramAlertThresholds: AlertThresholds = {
    maxFailed: 10,
    maxWaiting: 50,
    maxActive: 10,
    failureRate: 20,
};

// Helper function to monitor queue status
async function monitorQueueStatus(queueName: string, queue: any, thresholds: AlertThresholds) {
    const stats = await getQueueStatistics(queue);
    const alertCheck = shouldAlert(stats, thresholds);

    if (alertCheck.shouldAlert) {
        handleAlert(queueName, stats, alertCheck.reasons);
    } else {
        logQueueStatistics(queueName, stats);
    }
}

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
emailWorker.on('completed', async (job) => {
    console.log(`✓ [EMAIL] Job ${job.id} completed`);
    await monitorQueueStatus('email', emailQueue, emailAlertThresholds);
});

emailWorker.on('failed', async (job, err) => {
    console.error(`✗ [EMAIL] Job ${job?.id} failed: ${err.message}`);
    await monitorQueueStatus('email', emailQueue, emailAlertThresholds);
});

emailWorker.on('ready', () => {
    console.log('Email worker is ready and listening for jobs...');
});

// Telegram worker event handlers
telegramWorker.on('completed', async (job) => {
    console.log(`✓ [Telegram] Job ${job.id} completed`);
    await monitorQueueStatus('telegram', telegramQueue, telegramAlertThresholds);
});

telegramWorker.on('failed', async (job, err) => {
    console.error(`✗ [Telegram] Job ${job?.id} failed: ${err.message}`);
    await monitorQueueStatus('telegram', telegramQueue, telegramAlertThresholds);
});

telegramWorker.on('ready', () => {
    console.log('Telegram worker is ready and listening for jobs...');
});

console.log('Workers started - listening for email and SMS jobs');