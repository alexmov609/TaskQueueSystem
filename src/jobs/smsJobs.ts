import { Job } from 'bullmq';
import { SmsJobData } from '../types/jobs';

export async function processSmsJob(job: Job<SmsJobData>): Promise<void> {
    const { to, body } = job.data;

    console.log(`Processing SMS job ${job.id}`);

    // Simulate sending SMS (replace with real SMS service like Twilio, AWS SNS, etc.)
    await fakeSendSms(to, body);

    console.log(`SMS sent to ${to}`);
}

async function fakeSendSms(to: string, body: string): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(`[FAKE SMS] To: ${to}, Message: ${body}`);
}
