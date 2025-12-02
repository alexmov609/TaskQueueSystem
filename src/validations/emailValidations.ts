
const emailValidationRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 * @param email 
 * @returns 
 */
export function isValidEmail(email: string): boolean {
    return emailValidationRegex.test(email);
}

/**
 * Validation for email array
 * @param emails 
 * @returns 
 */
export function validateEmails(emails: string[]): string[] {
    return emails.filter(email => isValidEmail(email));
}