/**
 * Timezone utility functions
 *
 * These are helper functions for Task 1 (NotificationScheduler)
 * Candidates may need to extend these or use a library like date-fns-tz
 */

/**
 * Convert a UTC date to a specific timezone and return the hour (0-23)
 *
 * Note: This is a simplified implementation. Candidates may want to use
 * a proper timezone library like date-fns-tz for production code.
 */
export function getHourInTimezone(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  });

  const hourStr = formatter.format(date);
  return parseInt(hourStr, 10);
}

/**
 * Get the current date/time in a specific timezone
 */
export function getDateInTimezone(date: Date, timezone: string): Date {
  // This returns a Date object that represents the same instant in time,
  // but when formatted in the target timezone, shows the local time
  const dateStr = date.toLocaleString("en-US", { timeZone: timezone });
  return new Date(dateStr);
}

/**
 * Check if a timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}
