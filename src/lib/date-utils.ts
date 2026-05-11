/**
 * Date Utilities for Financial Reporting
 * 
 * These helpers ensure that date strings (from HTML inputs) and Date objects
 * are handled consistently using IST (+5:30) boundaries, regardless of server timezone.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Returns a range { start, end } representing the full span of a day in IST.
 * Returns absolute UTC Dates for DB querying.
 */
export function getLocalDayRange(dateInput: Date | string) {
    let year: number, month: number, day: number;

    if (typeof dateInput === 'string' && dateInput.includes('-')) {
        // Handle "YYYY-MM-DD" strings directly to avoid any browser/server shift
        [year, month, day] = dateInput.split('-').map(Number);
    } else {
        // If it's a Date object, it's likely a serialized UTC date from the client.
        // We shift it to IST to extract the correct "Calendar Day" it represents.
        const d = new Date(dateInput);
        const istDate = new Date(d.getTime() + IST_OFFSET_MS);
        year = istDate.getUTCFullYear();
        month = istDate.getUTCMonth() + 1;
        day = istDate.getUTCDate();
    }

    // Construct IST Midnight (00:00:00)
    // To get IST 00:00, we take UTC 00:00 and subtract 5.5 hours
    const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - IST_OFFSET_MS);
    
    // Construct IST End of Day (23:59:59.999)
    const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) - IST_OFFSET_MS);

    return { start, end };
}

/**
 * Returns a range { start, end } representing a period between two dates in IST.
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
 * Returns the start of the current month in IST.
 */
export function getLocalStartOfMonth() {
    const nowInIst = new Date(Date.now() + IST_OFFSET_MS);
    const year = nowInIst.getUTCFullYear();
    const month = nowInIst.getUTCMonth();
    
    return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0) - IST_OFFSET_MS);
}

/**
 * Formats a date for display in DD/MM/YYYY format using IST components.
 */
export function formatLocalDate(date: Date | string) {
    if (!date) return 'N/A';
    const d = new Date(date);
    // Shift the date to IST for display
    const istDate = new Date(d.getTime() + IST_OFFSET_MS);
    
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const year = istDate.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
}
