import { Queue } from 'bullmq';

export interface QueueStatistics {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
}

export interface AlertThresholds {
    maxFailed?: number;
    maxWaiting?: number;
    maxActive?: number;
    failureRate?: number; // percentage
}

/**
 * Get statistics for a queue
 */
export async function getQueueStatistics(queue: Queue): Promise<QueueStatistics> {
    const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
    ]);

    return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
    };
}

/**
 * Check if queue statistics exceed alert thresholds
 */
export function shouldAlert(stats: QueueStatistics, thresholds: AlertThresholds): {
    shouldAlert: boolean;
    reasons: string[];
} {
    const reasons: string[] = [];

    if (thresholds.maxFailed && stats.failed > thresholds.maxFailed) {
        reasons.push(`Failed jobs (${stats.failed}) exceeded threshold (${thresholds.maxFailed})`);
    }

    if (thresholds.maxWaiting && stats.waiting > thresholds.maxWaiting) {
        reasons.push(`Waiting jobs (${stats.waiting}) exceeded threshold (${thresholds.maxWaiting})`);
    }

    if (thresholds.maxActive && stats.active > thresholds.maxActive) {
        reasons.push(`Active jobs (${stats.active}) exceeded threshold (${thresholds.maxActive})`);
    }

    if (thresholds.failureRate) {
        const total = stats.completed + stats.failed;
        if (total > 0) {
            const currentFailureRate = (stats.failed / total) * 100;
            if (currentFailureRate > thresholds.failureRate) {
                reasons.push(
                    `Failure rate (${currentFailureRate.toFixed(2)}%) exceeded threshold (${thresholds.failureRate}%)`
                );
            }
        }
    }

    return {
        shouldAlert: reasons.length > 0,
        reasons,
    };
}

/**
 * Log queue statistics with formatting
 */
export function logQueueStatistics(queueName: string, stats: QueueStatistics): void {
    console.log(`\n📊 [${queueName.toUpperCase()}] Queue Statistics:`);
    console.log(`   Waiting: ${stats.waiting}`);
    console.log(`   Active: ${stats.active}`);
    console.log(`   Completed: ${stats.completed}`);
    console.log(`   Failed: ${stats.failed}`);

    const total = stats.completed + stats.failed;
    if (total > 0) {
        const successRate = ((stats.completed / total) * 100).toFixed(2);
        console.log(`   Success Rate: ${successRate}%`);
    }
}

/**
 * Alert handler - customize this based on your needs
 * (e.g., send email, Slack notification, etc.)
 */
export function handleAlert(queueName: string, stats: QueueStatistics, reasons: string[]): void {
    console.error(`\n🚨 [${queueName.toUpperCase()}] ALERT - Queue Health Issue:`);
    reasons.forEach(reason => console.error(`   - ${reason}`));
    console.error(`   Current Stats: W:${stats.waiting} A:${stats.active} C:${stats.completed} F:${stats.failed}\n`);

    // TODO: Implement additional alerting mechanisms here:
    // - Send email to admin or Telegram notification
}
