/**
 * Date Utilities Tests
 * 
 * Comprehensive test suite for date utility functions.
 * Tests date formatting, parsing, validation, manipulation, and timezone handling.
 * 
 * @fileoverview Tests for date utility functionality
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 */

import {
  formatDate,
  parseDate,
  isValidDate,
  now,
  today,
  tomorrow,
  yesterday,
  getRelativeTime,
  formatSmartDate,
  formatTimeDuration,
  dateUtils,
  timezoneUtils,
  calendarUtils,
  businessDays,
  ageUtils,
  DateUtils,
  DATE_FORMATS,
  DateRange,
  TimeComponents,
  DateComponents,
  DateTimeComponents
} from '../../utils/date';

// ============================================================================
// TEST SETUP
// ============================================================================

describe('Date Utilities', () => {
  // Test dates
  const testDate = new Date('2024-01-15T14:30:00.000Z');
  const testDateString = '2024-01-15T14:30:00.000Z';
  const testTimestamp = testDate.getTime();
  
  // Mock current date for consistent testing
  const mockCurrentDate = new Date('2024-01-20T10:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockCurrentDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ============================================================================
  // DATE FORMATTING TESTS
  // ============================================================================

  describe('Date Formatting', () => {
    it('should format dates with default format', () => {
      expect(formatDate(testDate)).toBe('Jan 15, 2024');
    });

    it('should format dates with custom format', () => {
      expect(formatDate(testDate, DATE_FORMATS.SHORT)).toBe('01/15/2024');
      expect(formatDate(testDate, DATE_FORMATS.LONG)).toBe('January 15, 2024');
      expect(formatDate(testDate, DATE_FORMATS.FULL)).toBe('Monday, January 15, 2024');
    });

    it('should format time with different formats', () => {
      expect(formatDate(testDate, DATE_FORMATS.TIME_12)).toBe('2:30 PM');
      expect(formatDate(testDate, DATE_FORMATS.TIME_24)).toBe('14:30');
    });

    it('should format datetime combinations', () => {
      expect(formatDate(testDate, DATE_FORMATS.DATETIME_SHORT)).toBe('01/15/2024 2:30 PM');
      expect(formatDate(testDate, DATE_FORMATS.DATETIME_MEDIUM)).toBe('Jan 15, 2024 2:30 PM');
    });

    it('should handle relative time formatting', () => {
      expect(formatDate(testDate, DATE_FORMATS.RELATIVE)).toMatch(/days ago/);
    });

    it('should handle invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Invalid date');
      expect(formatDate(new Date('invalid'))).toBe('Invalid date');
    });

    it('should format string dates', () => {
      expect(formatDate(testDateString)).toBe('Jan 15, 2024');
    });

    it('should format timestamp numbers', () => {
      expect(formatDate(testTimestamp)).toBe('Jan 15, 2024');
    });
  });

  describe('Smart Date Formatting', () => {
    it('should format recent dates intelligently', () => {
      const oneHourAgo = new Date(mockCurrentDate.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(mockCurrentDate.getTime() - 24 * 60 * 60 * 1000);
      
      expect(formatSmartDate(oneHourAgo)).toMatch(/hour ago/);
      expect(formatSmartDate(oneDayAgo)).toBe('Yesterday');
    });

    it('should handle just now cases', () => {
      const thirtySecondsAgo = new Date(mockCurrentDate.getTime() - 30 * 1000);
      expect(formatSmartDate(thirtySecondsAgo)).toBe('Just now');
    });

    it('should format older dates with absolute format', () => {
      const longAgo = new Date('2023-01-01');
      expect(formatSmartDate(longAgo)).toMatch(/2023/);
    });
  });

  describe('Time Duration Formatting', () => {
    it('should format milliseconds correctly', () => {
      expect(formatTimeDuration(500)).toBe('500ms');
      expect(formatTimeDuration(1500)).toBe('1s 500ms');
      expect(formatTimeDuration(61000)).toBe('1m 1s');
      expect(formatTimeDuration(3661000)).toBe('1h 1m 1s');
    });

    it('should handle zero duration', () => {
      expect(formatTimeDuration(0)).toBe('0ms');
    });

    it('should handle large durations', () => {
      const oneDay = 24 * 60 * 60 * 1000;
      expect(formatTimeDuration(oneDay)).toBe('1d');
    });
  });

  // ============================================================================
  // DATE PARSING TESTS
  // ============================================================================

  describe('Date Parsing', () => {
    it('should parse Date objects', () => {
      const result = parseDate(testDate);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(testDate.getTime());
    });

    it('should parse ISO strings', () => {
      const result = parseDate(testDateString);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(testDate.getTime());
    });

    it('should parse timestamps', () => {
      const result = parseDate(testTimestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(testDate.getTime());
    });

    it('should parse various string formats', () => {
      expect(parseDate('2024-01-15')).toBeInstanceOf(Date);
      expect(parseDate('01/15/2024')).toBeInstanceOf(Date);
      expect(parseDate('Jan 15, 2024')).toBeInstanceOf(Date);
    });

    it('should handle invalid inputs gracefully', () => {
      const result = parseDate('completely invalid');
      expect(result).toBeInstanceOf(Date);
      // Should return a Date object even if invalid
    });
  });

  describe('Date Validation', () => {
    it('should validate correct dates', () => {
      expect(isValidDate(testDate)).toBe(true);
      expect(isValidDate(testDateString)).toBe(true);
      expect(isValidDate(testTimestamp)).toBe(true);
    });

    it('should invalidate incorrect dates', () => {
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate(NaN)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });

  // ============================================================================
  // DATE UTILITIES TESTS
  // ============================================================================

  describe('Current Date Functions', () => {
    it('should return current date and time', () => {
      const result = now();
      expect(result).toBeInstanceOf(Date);
      expect(Math.abs(result.getTime() - mockCurrentDate.getTime())).toBeLessThan(100);
    });

    it('should return today at start of day', () => {
      const result = today();
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should return tomorrow at start of day', () => {
      const result = tomorrow();
      const expectedDate = new Date(mockCurrentDate);
      expectedDate.setDate(expectedDate.getDate() + 1);
      expectedDate.setHours(0, 0, 0, 0);
      
      expect(result.getTime()).toBe(expectedDate.getTime());
    });

    it('should return yesterday at start of day', () => {
      const result = yesterday();
      const expectedDate = new Date(mockCurrentDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
      expectedDate.setHours(0, 0, 0, 0);
      
      expect(result.getTime()).toBe(expectedDate.getTime());
    });
  });

  describe('Relative Time Functions', () => {
    it('should identify today', () => {
      expect(getRelativeTime(mockCurrentDate)).toBe('Today');
    });

    it('should identify yesterday', () => {
      const yesterdayDate = new Date(mockCurrentDate);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      expect(getRelativeTime(yesterdayDate)).toBe('Yesterday');
    });

    it('should identify tomorrow', () => {
      const tomorrowDate = new Date(mockCurrentDate);
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      expect(getRelativeTime(tomorrowDate)).toBe('Tomorrow');
    });

    it('should format this week dates', () => {
      const thisWeekDate = new Date(mockCurrentDate);
      thisWeekDate.setDate(thisWeekDate.getDate() + 2);
      const result = getRelativeTime(thisWeekDate);
      expect(result).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
    });
  });

  describe('Date Manipulation', () => {
    it('should add time periods correctly', () => {
      expect(dateUtils.add.days(testDate, 5).getDate()).toBe(testDate.getDate() + 5);
      expect(dateUtils.add.months(testDate, 2).getMonth()).toBe(testDate.getMonth() + 2);
      expect(dateUtils.add.years(testDate, 1).getFullYear()).toBe(testDate.getFullYear() + 1);
    });

    it('should subtract time periods correctly', () => {
      expect(dateUtils.subtract.days(testDate, 5).getDate()).toBe(testDate.getDate() - 5);
      expect(dateUtils.subtract.months(testDate, 2).getMonth()).toBe(testDate.getMonth() - 2);
      expect(dateUtils.subtract.years(testDate, 1).getFullYear()).toBe(testDate.getFullYear() - 1);
    });

    it('should get start and end of periods', () => {
      const startOfDay = dateUtils.startOf.day(testDate);
      expect(startOfDay.getHours()).toBe(0);
      expect(startOfDay.getMinutes()).toBe(0);

      const endOfDay = dateUtils.endOf.day(testDate);
      expect(endOfDay.getHours()).toBe(23);
      expect(endOfDay.getMinutes()).toBe(59);
    });
  });

  describe('Date Comparison', () => {
    const earlierDate = new Date('2024-01-10');
    const laterDate = new Date('2024-01-20');

    it('should compare dates correctly', () => {
      expect(dateUtils.is.before(earlierDate, laterDate)).toBe(true);
      expect(dateUtils.is.after(laterDate, earlierDate)).toBe(true);
      expect(dateUtils.is.same.day(testDate, testDate)).toBe(true);
    });

    it('should check if dates are in same periods', () => {
      const sameDay = new Date(testDate);
      sameDay.setHours(10);
      
      expect(dateUtils.is.same.day(testDate, sameDay)).toBe(true);
      expect(dateUtils.is.same.month(testDate, sameDay)).toBe(true);
      expect(dateUtils.is.same.year(testDate, sameDay)).toBe(true);
    });

    it('should calculate differences correctly', () => {
      expect(dateUtils.difference.days(laterDate, earlierDate)).toBe(10);
      expect(dateUtils.difference.hours(testDate, earlierDate)).toBe(120); // 5 days * 24 hours
    });
  });

  // ============================================================================
  // TIMEZONE TESTS
  // ============================================================================

  describe('Timezone Utilities', () => {
    it('should get user timezone', () => {
      const timezone = timezoneUtils.getUserTimezone();
      expect(typeof timezone).toBe('string');
      expect(timezone.length).toBeGreaterThan(0);
    });

    it('should convert to specific timezone', () => {
      const utcString = timezoneUtils.toTimezone(testDate, 'UTC');
      expect(typeof utcString).toBe('string');
      expect(utcString).toContain('2024');
    });

    it('should list common timezones', () => {
      const timezones = timezoneUtils.getCommonTimezones();
      expect(Array.isArray(timezones)).toBe(true);
      expect(timezones.length).toBeGreaterThan(0);
      expect(timezones).toContain('UTC');
    });

    it('should get timezone offset', () => {
      const offset = timezoneUtils.getTimezoneOffset('UTC');
      expect(typeof offset).toBe('number');
      expect(offset).toBe(0);
    });
  });

  // ============================================================================
  // BUSINESS DAYS TESTS
  // ============================================================================

  describe('Business Days', () => {
    it('should identify weekdays correctly', () => {
      const monday = new Date('2024-01-15'); // Monday
      const saturday = new Date('2024-01-13'); // Saturday
      
      expect(businessDays.isBusinessDay(monday)).toBe(true);
      expect(businessDays.isBusinessDay(saturday)).toBe(false);
    });

    it('should calculate business days between dates', () => {
      const startDate = new Date('2024-01-15'); // Monday
      const endDate = new Date('2024-01-19'); // Friday
      
      const result = businessDays.countBusinessDays(startDate, endDate);
      expect(result).toBe(5); // Mon, Tue, Wed, Thu, Fri
    });

    it('should add business days correctly', () => {
      const friday = new Date('2024-01-19'); // Friday
      const result = businessDays.addBusinessDays(friday, 1);
      
      // Should skip weekend and land on Monday
      expect(result.getDay()).toBe(1); // Monday
    });

    it('should handle holidays', () => {
      const holidays = [new Date('2024-01-16')]; // Tuesday
      const monday = new Date('2024-01-15');
      
      const result = businessDays.addBusinessDays(monday, 1, holidays);
      expect(result.getDate()).toBe(17); // Should skip holiday and go to Wednesday
    });
  });

  // ============================================================================
  // CALENDAR TESTS
  // ============================================================================

  describe('Calendar Utilities', () => {
    it('should generate calendar month', () => {
      const calendar = calendarUtils.generateCalendar(2024, 0); // January 2024
      expect(calendar.length).toBe(6); // 6 weeks
      expect(calendar[0].length).toBe(7); // 7 days per week
    });

    it('should get days in month', () => {
      expect(calendarUtils.getDaysInMonth(2024, 0)).toBe(31); // January
      expect(calendarUtils.getDaysInMonth(2024, 1)).toBe(29); // February (leap year)
    });

    it('should identify leap years', () => {
      expect(calendarUtils.isLeapYear(2024)).toBe(true);
      expect(calendarUtils.isLeapYear(2023)).toBe(false);
      expect(calendarUtils.isLeapYear(2000)).toBe(true);
      expect(calendarUtils.isLeapYear(1900)).toBe(false);
    });

    it('should get week numbers', () => {
      const weekNumber = calendarUtils.getWeekNumber(testDate);
      expect(typeof weekNumber).toBe('number');
      expect(weekNumber).toBeGreaterThan(0);
      expect(weekNumber).toBeLessThanOrEqual(53);
    });
  });

  // ============================================================================
  // AGE CALCULATION TESTS
  // ============================================================================

  describe('Age Utilities', () => {
    it('should calculate age correctly', () => {
      const birthDate = new Date('1990-01-15');
      const age = ageUtils.calculateAge(birthDate);
      expect(age).toBe(34); // Based on mock current date 2024-01-20
    });

    it('should calculate precise age', () => {
      const birthDate = new Date('1990-01-15');
      const preciseAge = ageUtils.calculatePreciseAge(birthDate);
      
      expect(preciseAge.years).toBe(34);
      expect(preciseAge.months).toBeGreaterThanOrEqual(0);
      expect(preciseAge.days).toBeGreaterThanOrEqual(0);
    });

    it('should check minimum age', () => {
      const adultBirthDate = new Date('1990-01-15');
      const minorBirthDate = new Date('2020-01-15');
      
      expect(ageUtils.isMinimumAge(adultBirthDate, 18)).toBe(true);
      expect(ageUtils.isMinimumAge(minorBirthDate, 18)).toBe(false);
    });

    it('should handle future birth dates', () => {
      const futureBirthDate = new Date('2030-01-15');
      expect(ageUtils.calculateAge(futureBirthDate)).toBe(0);
    });
  });

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle leap year edge cases', () => {
      const leapDay = new Date('2024-02-29');
      expect(isValidDate(leapDay)).toBe(true);
      
      const invalidLeapDay = new Date('2023-02-29');
      expect(isValidDate(invalidLeapDay)).toBe(false);
    });

    it('should handle daylight saving time transitions', () => {
      // Test dates around DST transitions
      const springForward = new Date('2024-03-10T02:00:00-05:00');
      const fallBack = new Date('2024-11-03T02:00:00-05:00');
      
      expect(isValidDate(springForward)).toBe(true);
      expect(isValidDate(fallBack)).toBe(true);
    });

    it('should handle extreme dates', () => {
      const veryOldDate = new Date('1900-01-01');
      const veryNewDate = new Date('2100-12-31');
      
      expect(isValidDate(veryOldDate)).toBe(true);
      expect(isValidDate(veryNewDate)).toBe(true);
    });

    it('should handle different locale considerations', () => {
      // Test with different locale-specific formats
      const europeanDate = '15/01/2024';
      const americanDate = '01/15/2024';
      
      // Both should parse, but results may vary
      expect(parseDate(europeanDate)).toBeInstanceOf(Date);
      expect(parseDate(americanDate)).toBeInstanceOf(Date);
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance', () => {
    it('should handle large date arrays efficiently', () => {
      const dates = Array.from({ length: 1000 }, (_, i) => 
        new Date(2024, 0, i + 1)
      );
      
      const start = performance.now();
      dates.forEach(date => formatDate(date));
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });

    it('should efficiently calculate date ranges', () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');
        businessDays.countBusinessDays(startDate, endDate);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(50); // Should be reasonably fast
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('DateUtils Integration', () => {
    it('should provide unified access to all date functions', () => {
      expect(DateUtils.format).toBeDefined();
      expect(DateUtils.parse).toBeDefined();
      expect(DateUtils.isValid).toBeDefined();
      expect(DateUtils.now).toBeDefined();
      expect(DateUtils.today).toBeDefined();
      expect(DateUtils.timezone).toBeDefined();
      expect(DateUtils.business).toBeDefined();
      expect(DateUtils.age).toBeDefined();
    });

    it('should chain operations seamlessly', () => {
      const result = DateUtils.add.days(DateUtils.today(), 7);
      expect(DateUtils.is.after(result, DateUtils.today())).toBe(true);
    });

    it('should handle complex date operations', () => {
      const birthday = new Date('1990-01-15');
      const nextBirthday = DateUtils.add.years(birthday, DateUtils.age.calculateAge(birthday) + 1);
      
      expect(DateUtils.is.after(nextBirthday, DateUtils.now())).toBe(true);
    });
  });
});
