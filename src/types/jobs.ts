export interface EmailJobData {
    to: string;
    subject: string;
    body: string;
}

export interface ImageJobData {
    imageUrl: string;
    userId: string;
    operations: ('resize' | 'compress' | 'watermark')[];
}