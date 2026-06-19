import { createHash } from 'crypto';

const REPORT_TOKEN_SALT = 'rvat-mocmaq-public-report-salt-2026';

/**
 * Generates a deterministic 24-char SHA-256 token for a report ID.
 * Used to allow public access to a specific report without requiring login.
 */
export function getReportToken(id: number): string {
    return createHash('sha256').update(`${id}-${REPORT_TOKEN_SALT}`).digest('hex').slice(0, 24);
}
