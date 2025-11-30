import { Job } from 'bullmq';
import { EmailJobData } from '../types/jobs';
import EmailService from '../services/EmailService';


// Get instance by singelton pattern
const emailService = EmailService.getInstance();



// sendMail();

export async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, body } = job.data;
    const jobData = { to, subject, body };

    await sendMail(jobData);

    console.log(`Email sent to ${to}`);
}

async function sendMail(jobData: EmailJobData) {
    await emailService.sendEmailAlert(jobData);
}