export interface EmailJobData {
    to: string;
    subject: string;
    body: string;
}

export interface SmsJobData {
    to: string;
    body: string;
}

// Union type for all job data types
export type JobData = EmailJobData | SmsJobData;