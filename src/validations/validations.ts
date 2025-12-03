
import validator from 'validator';
import sanitizeHtml from 'sanitize-html';

const emailValidationRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 * @param email 
 * @returns 
 */
export function isValidEmail(email: string): boolean {
    return validator.isEmail(email) && emailValidationRegex.test(email);
}

/**
 * Validation for email array
 * @param emails 
 * @returns 
 */
export function validateEmails(emails: string[]): string[] {
    return emails.filter(email => isValidEmail(email));
}

export function validateSubject(subject: string): string {
    let validatedSubject = validator.trim(subject);
    validatedSubject = validator.escape(validatedSubject);
    return validatedSubject;
}

export function sanitize(param: string): string {
    let sanitizedParam = validator.trim(param);

    // Sanitize HTML to remove scripts and dangerous tags
    sanitizedParam = sanitizeHtml(sanitizedParam, {
        allowedTags: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'a'],
        allowedAttributes: {
            'a': ['href']
        },
        allowedSchemes: ['http', 'https', 'mailto']
    });

    return sanitizedParam;
}