import { Job } from 'bullmq';
import { processEmailJob } from '../jobs/emailJobs';
import { processSmsJob } from '../jobs/smsJobs';
import { EmailJobData, SmsJobData } from '../types/jobs';

/**
 * Generic Job Processor Type
 * Defines the signature for all job processors
 */
export type JobProcessor<T = any> = (job: Job<T>) => Promise<void>;

/**
 * Job Processor Registry
 * Maps queue names to their corresponding job processors
 */
export const jobProcessorRegistry: Record<string, JobProcessor> = {
    'email-queue': processEmailJob as JobProcessor<EmailJobData>,
    'sms-queue': processSmsJob as JobProcessor<SmsJobData>,
};

/**
 * Get job processor for a specific queue
 * @param queueName - The name of the queue
 * @returns The job processor function
 * @throws Error if no processor is registered for the queue
 */
export function getJobProcessor(queueName: string): JobProcessor {
    const processor = jobProcessorRegistry[queueName];
    if (!processor) {
        throw new Error(`No job processor registered for queue: ${queueName}`);
    }
    return processor;
}

/**
 * Register a new job processor
 * @param queueName - The name of the queue
 * @param processor - The job processor function
 */
export function registerJobProcessor<T>(queueName: string, processor: JobProcessor<T>): void {
    jobProcessorRegistry[queueName] = processor;
}
