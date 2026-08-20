export function generateIcsFile(event: {
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO format
  endTime: string;   // ISO format
}): void {
  const formatDateToICS = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//R3Pro//Event Volunteer Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    `DTSTART:${formatDateToICS(event.startTime)}`,
    `DTEND:${formatDateToICS(event.endTime)}`,
    `DTSTAMP:${formatDateToICS(new Date().toISOString())}`,
    `UID:${Date.now()}@r3pro.org`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Your volunteer shift is in 24 hours!',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Your volunteer shift starts in 2 hours!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_shift.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getGoogleCalendarUrl(event: {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
}): string {
  const formatDateToGoogle = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const text = `&text=${encodeURIComponent(event.title)}`;
  const dates = `&dates=${formatDateToGoogle(event.startTime)}/${formatDateToGoogle(event.endTime)}`;
  const details = `&details=${encodeURIComponent(event.description)}`;
  const location = `&location=${encodeURIComponent(event.location)}`;

  return `${base}${text}${dates}${details}${location}`;
}
