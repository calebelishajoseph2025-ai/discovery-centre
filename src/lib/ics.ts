/**
 * RFC 5545 iCalendar generation for Northside Discovery Centre plans.
 * Formats events with VTIMEZONE (Asia/Kolkata), CRLF line endings,
 * and standard line folding (<= 75 octets).
 */

import { Plan } from './plan-engine.ts';

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let remaining = line;
  chunks.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);

  while (remaining.length > 0) {
    chunks.push(' ' + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }

  return chunks.join('\r\n');
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function formatDateTime(dateStr: string, timeStr: string): string {
  // dateStr: YYYY-MM-DD, timeStr: HH:mm
  const cleanDate = dateStr.replace(/-/g, '');
  const cleanTime = timeStr.replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

export function toICS(plan: Plan, visitDate?: string): string {
  // Default to upcoming Saturday if date is not specified
  let targetDate = visitDate;
  if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    const now = new Date();
    // Default to tomorrow or next open day
    const nextDay = new Date(now.getTime() + 24 * 3600 * 1000);
    targetDate = nextDay.toISOString().split('T')[0];
  }

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Northside Discovery Centre//Visit Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Northside Discovery Centre Visit',
    'X-WR-TIMEZONE:Asia/Kolkata',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Kolkata',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0530',
    'TZOFFSETTO:+0530',
    'TZNAME:IST',
    'END:STANDARD',
    'END:VTIMEZONE',
  ];

  const nowStamp =
    new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0] + 'Z';

  for (let idx = 0; idx < plan.stops.length; idx++) {
    const stop = plan.stops[idx];
    const uid = `ndc-${targetDate}-${stop.slug}-${idx}@northside-discovery.example`;
    const dtStart = formatDateTime(targetDate, stop.start);
    const dtEnd = formatDateTime(targetDate, stop.end);
    const summary = escapeText(`${stop.name} · Northside Discovery Centre`);
    const description = escapeText(
      `Visit to ${stop.name} (${stop.durationMinutes} mins) at Northside Discovery Centre, 18 Garden Road, Riverdale.`
    );
    const location = escapeText('18 Garden Road, Riverdale');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
      `DTEND;TZID=Asia/Kolkata:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');

  return lines.map(foldLine).join('\r\n') + '\r\n';
}
