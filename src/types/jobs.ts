export interface EmailJobData {
    to: string[];
    subject: string;
    body: string;
}

export interface TelegramJobData {
    chatId: string;
    message: string;
}

// Union type for all job data types
export type JobData = EmailJobData | TelegramJobData;