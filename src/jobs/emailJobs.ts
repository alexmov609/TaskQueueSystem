import { Job } from 'bullmq';
import { EmailJobData } from '../types/jobs';

export async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, body } = job.data;

    console.log(`Processing email job ${job.id}`);

    // Simulate sending email (replace with real logic)
    // e.g., nodemailer, SendGrid, AWS SES
    await fakeSendEmail(to, subject, body);

    console.log(`Email sent to ${to}`);
}

async function fakeSendEmail(to: string, subject: string, body: string): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`[FAKE EMAIL] To: ${to}, Subject: ${subject}`);
}