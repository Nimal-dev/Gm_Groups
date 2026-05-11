/**
 * Date Utilities for Financial Reporting
 * 
 * These helpers ensure that date strings (from HTML inputs) and Date objects
 * are handled consistently using LOCAL TIME boundaries.
 */

/**
 * Returns a range { start, end } representing the full span of a day in local time.
 * If input is a YYYY-MM-DD string, it parses it as local midnight.
 */
export function getLocalDayRange(dateInput: Date | string) {
    let start: Date;
    let end: Date;

    if (typeof dateInput === 'string' && dateInput.includes('-')) {
        // Parse YYYY-MM-DD as local date components
        const [year, month, day] = dateInput.split('-').map(Number);
        start = new Date(year, month - 1, day, 0, 0, 0, 0);
        end = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
        // Use existing Date object but normalize to start/end of day in local time
        const d = new Date(dateInput);
        start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    }

    return { start, end };
}

/**
 * Returns a range { start, end } representing a period between two dates in local time.
 */
export function getLocalPeriodRange(startDate: Date | string, endDate: Date | string) {
    const startRange = getLocalDayRange(startDate);
    const endRange = getLocalDayRange(endDate);

    return {
        start: startRange.start,
        end: endRange.end
    };
}

/**
 * Returns the start of the current month in local time.
 */
export function getLocalStartOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Formats a date for display in DD/MM/YYYY format using local time components.
 */
export function formatLocalDate(date: Date | string) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}
