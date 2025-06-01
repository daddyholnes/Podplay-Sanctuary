/**
 * Date and Time Utilities
 * Comprehensive date/time formatting, manipulation, and validation functions
 */

import { 
  format, 
  formatDistanceToNow, 
  formatDuration, 
  intervalToDuration,
  isValid, 
  parseISO, 
  addDays, 
  addHours, 
  addMinutes, 
  addMonths, 
  addYears,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isBefore,
  isAfter,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  differenceInMilliseconds,
  isToday,
  isYesterday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isWeekend,
  getDay,
  getMonth,
  getYear,
  setDay,
  setMonth,
  setYear,
} from 'date-fns';

// Type definitions
export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeComponents {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export interface DateComponents {
  year: number;
  month: number;
  day: number;
}

export interface DateTimeComponents extends DateComponents, TimeComponents {}

// Common date formats
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  FULL: 'EEEE, MMMM dd, yyyy',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME_12: 'h:mm a',
  TIME_24: 'HH:mm',
  DATETIME_SHORT: 'MM/dd/yyyy h:mm a',
  DATETIME_MEDIUM: 'MMM dd, yyyy h:mm a',
  DATETIME_LONG: 'MMMM dd, yyyy h:mm a',
  YEAR_MONTH: 'yyyy-MM',
  MONTH_DAY: 'MMM dd',
  RELATIVE: 'relative',
} as const;

// Format date with various options
export const formatDate = (
  date: Date | string | number,
  formatString: string = DATE_FORMATS.MEDIUM
): string => {
  const dateObj = parseDate(date);
  
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }

  if (formatString === DATE_FORMATS.RELATIVE) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  return format(dateObj, formatString);
};

// Parse various date inputs
export const parseDate = (input: Date | string | number): Date => {
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  if (typeof input === 'string') {
    // Try ISO format first
    if (input.includes('T') || input.includes('Z')) {
      return parseISO(input);
    }
    return new Date(input);
  }
  return new Date();
};

// Check if date is valid
export const isValidDate = (date: any): boolean => {
  const parsed = parseDate(date);
  return isValid(parsed);
};

// Get current date/time
export const now = (): Date => new Date();

// Get today at start of day
export const today = (): Date => startOfDay(new Date());

// Get tomorrow at start of day
export const tomorrow = (): Date => startOfDay(addDays(new Date(), 1));

// Get yesterday at start of day
export const yesterday = (): Date => startOfDay(subDays(new Date(), 1));

// Relative time helpers
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = parseDate(date);
  
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }

  if (isToday(dateObj)) {
    return 'Today';
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  if (isTomorrow(dateObj)) {
    return 'Tomorrow';
  }
  
  if (isThisWeek(dateObj)) {
    return format(dateObj, 'EEEE'); // Day name
  }
  
  if (isThisMonth(dateObj)) {
    return format(dateObj, 'MMM dd');
  }
  
  if (isThisYear(dateObj)) {
    return format(dateObj, 'MMM dd');
  }
  
  return format(dateObj, 'MMM dd, yyyy');
};

// Smart date formatting based on how recent the date is
export const formatSmartDate = (date: Date | string): string => {
  const dateObj = parseDate(date);
  
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInSeconds = Math.abs(differenceInSeconds(now, dateObj));
  const diffInMinutes = Math.abs(differenceInMinutes(now, dateObj));
  const diffInHours = Math.abs(differenceInHours(now, dateObj));
  const diffInDays = Math.abs(differenceInDays(now, dateObj));

  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Less than an hour
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  // Less than a day
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  // Less than a week
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  // Use relative date for older dates
  return getRelativeTime(dateObj);
};

// Duration formatting
export const formatTimeDuration = (
  start: Date | string,
  end: Date | string = new Date()
): string => {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  
  if (!isValid(startDate) || !isValid(endDate)) {
    return 'Invalid duration';
  }

  const duration = intervalToDuration({ start: startDate, end: endDate });
  
  const parts: string[] = [];
  
  if (duration.years) parts.push(`${duration.years}y`);
  if (duration.months) parts.push(`${duration.months}mo`);
  if (duration.days) parts.push(`${duration.days}d`);
  if (duration.hours) parts.push(`${duration.hours}h`);
  if (duration.minutes) parts.push(`${duration.minutes}m`);
  if (duration.seconds && parts.length === 0) parts.push(`${duration.seconds}s`);
  
  if (parts.length === 0) return 'Just now';
  
  return parts.slice(0, 2).join(' '); // Show max 2 units
};

// Format milliseconds to human readable duration
export const formatMilliseconds = (ms: number): string => {
  const duration = intervalToDuration({ start: 0, end: ms });
  
  const parts: string[] = [];
  
  if (duration.days) parts.push(`${duration.days}d`);
  if (duration.hours) parts.push(`${duration.hours}h`);
  if (duration.minutes) parts.push(`${duration.minutes}m`);
  if (duration.seconds) parts.push(`${duration.seconds}s`);
  
  if (parts.length === 0) return `${ms}ms`;
  
  return parts.join(' ');
};

// Date manipulation utilities
export const dateUtils = {
  // Add time to date
  add: {
    years: (date: Date, amount: number) => addYears(date, amount),
    months: (date: Date, amount: number) => addMonths(date, amount),
    days: (date: Date, amount: number) => addDays(date, amount),
    hours: (date: Date, amount: number) => addHours(date, amount),
    minutes: (date: Date, amount: number) => addMinutes(date, amount),
  },
  
  // Subtract time from date
  subtract: {
    years: (date: Date, amount: number) => subYears(date, amount),
    months: (date: Date, amount: number) => subMonths(date, amount),
    days: (date: Date, amount: number) => subDays(date, amount),
    hours: (date: Date, amount: number) => subHours(date, amount),
    minutes: (date: Date, amount: number) => subMinutes(date, amount),
  },
  
  // Start/end of periods
  startOf: {
    day: (date: Date) => startOfDay(date),
    week: (date: Date) => startOfWeek(date),
    month: (date: Date) => startOfMonth(date),
    year: (date: Date) => startOfYear(date),
  },
  
  endOf: {
    day: (date: Date) => endOfDay(date),
    week: (date: Date) => endOfWeek(date),
    month: (date: Date) => endOfMonth(date),
    year: (date: Date) => endOfYear(date),
  },
  
  // Comparison utilities
  is: {
    before: (date1: Date, date2: Date) => isBefore(date1, date2),
    after: (date1: Date, date2: Date) => isAfter(date1, date2),
    same: {
      day: (date1: Date, date2: Date) => isSameDay(date1, date2),
      week: (date1: Date, date2: Date) => isSameWeek(date1, date2),
      month: (date1: Date, date2: Date) => isSameMonth(date1, date2),
      year: (date1: Date, date2: Date) => isSameYear(date1, date2),
    },
    today: (date: Date) => isToday(date),
    yesterday: (date: Date) => isYesterday(date),
    tomorrow: (date: Date) => isTomorrow(date),
    thisWeek: (date: Date) => isThisWeek(date),
    thisMonth: (date: Date) => isThisMonth(date),
    thisYear: (date: Date) => isThisYear(date),
    weekend: (date: Date) => isWeekend(date),
  },
  
  // Difference calculations
  difference: {
    days: (date1: Date, date2: Date) => differenceInDays(date1, date2),
    hours: (date1: Date, date2: Date) => differenceInHours(date1, date2),
    minutes: (date1: Date, date2: Date) => differenceInMinutes(date1, date2),
    seconds: (date1: Date, date2: Date) => differenceInSeconds(date1, date2),
    milliseconds: (date1: Date, date2: Date) => differenceInMilliseconds(date1, date2),
  },
};

// Time zone utilities
export const timezoneUtils = {
  // Get user's timezone
  getUserTimezone: (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },
  
  // Convert date to specific timezone
  toTimezone: (date: Date, timezone: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  },
  
  // Get timezone offset
  getTimezoneOffset: (timezone: string): number => {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    return (utc.getTime() - target.getTime()) / (1000 * 60);
  },
  
  // List of common timezones
  common: [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
  ],
};

// Calendar utilities
export const calendarUtils = {
  // Get calendar weeks for a month
  getMonthWeeks: (date: Date): Date[][] => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const startWeek = startOfWeek(start);
    const endWeek = endOfWeek(end);
    
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    let current = startWeek;
    
    while (current <= endWeek) {
      currentWeek.push(new Date(current));
      
      if (getDay(current) === 6) { // Saturday
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      current = addDays(current, 1);
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  },
  
  // Get month names
  getMonthNames: (locale: string = 'en-US'): string[] => {
    const months: string[] = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2024, i, 1);
      months.push(date.toLocaleDateString(locale, { month: 'long' }));
    }
    return months;
  },
  
  // Get day names
  getDayNames: (locale: string = 'en-US', format: 'long' | 'short' | 'narrow' = 'long'): string[] => {
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(2024, 0, i + 1); // Start from Sunday
      days.push(date.toLocaleDateString(locale, { weekday: format }));
    }
    return days;
  },
};

// Business day utilities
export const businessDays = {
  // Check if date is a business day (Monday-Friday)
  isBusinessDay: (date: Date): boolean => {
    const day = getDay(date);
    return day >= 1 && day <= 5; // Monday = 1, Friday = 5
  },
  
  // Add business days to a date
  addBusinessDays: (date: Date, count: number): Date => {
    let result = new Date(date);
    let remaining = count;
    
    while (remaining > 0) {
      result = addDays(result, 1);
      if (businessDays.isBusinessDay(result)) {
        remaining--;
      }
    }
    
    return result;
  },
  
  // Count business days between two dates
  countBusinessDays: (start: Date, end: Date): number => {
    let count = 0;
    let current = startOfDay(start);
    const endDate = startOfDay(end);
    
    while (current <= endDate) {
      if (businessDays.isBusinessDay(current)) {
        count++;
      }
      current = addDays(current, 1);
    }
    
    return count;
  },
};

// Age calculation utilities
export const ageUtils = {
  // Calculate age in years
  calculateAge: (birthDate: Date | string): number => {
    const birth = parseDate(birthDate);
    const today = new Date();
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },
  
  // Calculate precise age
  calculatePreciseAge: (birthDate: Date | string): {
    years: number;
    months: number;
    days: number;
  } => {
    const birth = parseDate(birthDate);
    const today = new Date();
    
    const duration = intervalToDuration({ start: birth, end: today });
    
    return {
      years: duration.years || 0,
      months: duration.months || 0,
      days: duration.days || 0,
    };
  },
  
  // Check if person is of minimum age
  isMinimumAge: (birthDate: Date | string, minimumAge: number): boolean => {
    return ageUtils.calculateAge(birthDate) >= minimumAge;
  },
};

// Export all date utilities as a grouped object
export const DateUtils = {
  format: formatDate,
  parse: parseDate,
  isValid: isValidDate,
  now,
  today,
  tomorrow,
  yesterday,
  getRelativeTime,
  formatSmartDate,
  formatTimeDuration,
  formatMilliseconds,
  ...dateUtils,
  timezone: timezoneUtils,
  calendar: calendarUtils,
  business: businessDays,
  age: ageUtils,
  formats: DATE_FORMATS,
} as const;
