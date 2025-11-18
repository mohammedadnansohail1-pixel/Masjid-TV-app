import { format, parse, isAfter, isBefore, addDays, differenceInSeconds } from 'date-fns';

export const formatTime = (time: string, use12Hour = true): string => {
  try {
    const date = parse(time, 'HH:mm', new Date());
    return format(date, use12Hour ? 'h:mm a' : 'HH:mm');
  } catch (error) {
    return time;
  }
};

export const formatDate = (date: Date, formatStr = 'EEEE, MMMM d, yyyy'): string => {
  return format(date, formatStr);
};

export const getCurrentTime = (use12Hour = true): string => {
  return format(new Date(), use12Hour ? 'h:mm:ss a' : 'HH:mm:ss');
};

export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

export const parseTimeToDate = (timeStr: string): Date => {
  return parse(timeStr, 'HH:mm', new Date());
};

export const isTimePassed = (time: string): boolean => {
  const now = new Date();
  const timeDate = parseTimeToDate(time);
  return isAfter(now, timeDate);
};

export const isTimeBefore = (time: string): boolean => {
  const now = new Date();
  const timeDate = parseTimeToDate(time);
  return isBefore(now, timeDate);
};

export const getTimeDifference = (targetTime: string): number => {
  const now = new Date();
  let targetDate = parseTimeToDate(targetTime);

  // If the time has passed today, calculate for tomorrow
  if (isAfter(now, targetDate)) {
    targetDate = addDays(targetDate, 1);
  }

  return differenceInSeconds(targetDate, now);
};

export const formatCountdown = (seconds: number): string => {
  if (seconds < 0) return '00:00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatShortCountdown = (seconds: number): string => {
  if (seconds < 0) return '0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
