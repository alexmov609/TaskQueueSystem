import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';
import { EmailJobData } from '../types/jobs';

export const emailQueue = new Queue<EmailJobData>('email-queue', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: 100,  // keep last 100 completed jobs
        removeOnFail: 500,      // keep last 500 failed jobs
    },
});