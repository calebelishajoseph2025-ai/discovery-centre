/**
 * Timezone-safe status calculation for Northside Discovery Centre.
 * Fixed fact: Open Tuesday to Sunday, 10:00 to 17:00 (Asia/Kolkata). Closed Mondays.
 * Pure module: never relies on server's local timezone.
 */

export interface StatusResult {
  open: boolean;
  opensAt?: string;
  closesAt?: string;
  nextOpening: string;
  message: {
    en: string;
    ta: string;
  };
  istTime: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
}

/**
 * Returns the current date/time parts in Asia/Kolkata timezone.
 */
export function getKolkataTimeParts(date: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  const weekdayStr = partMap.weekday; // 'Sun', 'Mon', 'Tue', ...
  const weekdayToNum: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);
  const second = parseInt(partMap.second, 10);
  const dayOfWeek = weekdayToNum[weekdayStr] ?? 0;

  return {
    year: parseInt(partMap.year, 10),
    month: parseInt(partMap.month, 10),
    day: parseInt(partMap.day, 10),
    dayOfWeek,
    hour,
    minute,
    second,
    totalSecondsInDay: hour * 3600 + minute * 60 + second,
    formattedTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  };
}

export function getStatus(now: Date = new Date()): StatusResult {
  const kolkata = getKolkataTimeParts(now);
  const { dayOfWeek, totalSecondsInDay, formattedTime } = kolkata;

  // Operating window in seconds:
  // 10:00:00 = 36000 seconds
  // 17:00:00 = 61200 seconds
  // Open strictly between [36000, 61200) -> 09:59:59 is closed, 16:59:59 is open, 17:00:00 is closed
  const OPEN_SECONDS = 10 * 3600;
  const CLOSE_SECONDS = 17 * 3600;

  const isMonday = dayOfWeek === 1;
  const isWithinHours =
    totalSecondsInDay >= OPEN_SECONDS && totalSecondsInDay < CLOSE_SECONDS;
  const isOpen = !isMonday && isWithinHours;

  let nextOpening = '';
  let msgEn = '';
  let msgTa = '';

  if (isOpen) {
    const closesAt = '17:00';
    nextOpening = 'Today at 10:00';
    msgEn = `Open today until 5:00 p.m.`;
    msgTa = `இன்று மாலை 5:00 மணி வரை திறந்திருக்கும்`;
    return {
      open: true,
      opensAt: '10:00',
      closesAt,
      nextOpening,
      message: { en: msgEn, ta: msgTa },
      istTime: formattedTime,
      dayOfWeek,
    };
  }

  // Not open
  if (isMonday) {
    nextOpening = 'Tuesday at 10:00';
    msgEn = 'Closed on Mondays. Reopening Tuesday at 10:00 a.m.';
    msgTa = 'திங்கட்கிழமை விடுமுறை. மீண்டும் செவ்வாய் காலை 10:00 மணிக்குத் திறக்கப்படும்.';
  } else if (totalSecondsInDay < OPEN_SECONDS) {
    nextOpening = 'Today at 10:00';
    msgEn = 'Opens today at 10:00 a.m.';
    msgTa = 'இன்று காலை 10:00 மணிக்குத் திறக்கப்படும்.';
  } else {
    // Past 17:00
    if (dayOfWeek === 0) {
      // Sunday evening -> next is Tuesday
      nextOpening = 'Tuesday at 10:00';
      msgEn = 'Closed for the day. Reopening Tuesday at 10:00 a.m.';
      msgTa = 'இன்றைய நேரம் முடிந்தது. மீண்டும் செவ்வாய் காலை 10:00 மணிக்குத் திறக்கப்படும்.';
    } else {
      nextOpening = 'Tomorrow at 10:00';
      msgEn = 'Closed for the day. Reopening tomorrow at 10:00 a.m.';
      msgTa = 'இன்றைய நேரம் முடிந்தது. நாளை காலை 10:00 மணிக்குத் திறக்கப்படும்.';
    }
  }

  return {
    open: false,
    opensAt: '10:00',
    closesAt: '17:00',
    nextOpening,
    message: { en: msgEn, ta: msgTa },
    istTime: formattedTime,
    dayOfWeek,
  };
}
