import { Queue, QueueOptions } from 'bullmq';
import { redisConnection } from '../config/redis';
import { EmailJobData, TelegramJobData } from '../types/jobs';

/**
 * Queue Factory
 * Creates BullMQ queues with shared configuration
 *
 * Queue Options: https://api.docs.bullmq.io/interfaces/v5.QueueOptions.html
 * Default Job Options: https://api.docs.bullmq.io/interfaces/v5.DefaultJobOptions.html
 */

// Default configuration for all queues
const defaultQueueOptions: QueueOptions = {
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
};

/**
 * Factory function to create queues with default configuration
 * @param queueName - The name of the queue
 * @param customOptions - Optional custom options to override defaults
 */
function createQueue<T>(queueName: string, customOptions?: Partial<QueueOptions>): Queue<T> {
    return new Queue<T>(queueName, {
        ...defaultQueueOptions,
        ...customOptions,
    });
}

// Create specific queues using the factory
export const emailQueue = createQueue<EmailJobData>('email-queue');
export const telegramQueue = createQueue<TelegramJobData>('telegram-queue');

// Export the factory for creating additional queues
export { createQueue };