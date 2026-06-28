// Calendar helpers: .ics download + Google / Outlook web links.

export interface BookingEvent {
  title: string;
  description: string;
  startISO: string; // e.g. "2026-07-01T10:00:00"
  durationMinutes?: number;
  location?: string;
}

function toUtcStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function eventTimes(ev: BookingEvent) {
  const start = new Date(ev.startISO);
  const end = new Date(start.getTime() + (ev.durationMinutes ?? 30) * 60_000);
  return { start, end };
}

export function buildIcs(ev: BookingEvent): string {
  const { start, end } = eventTimes(ev);
  const esc = (s: string) => s.replace(/[\\,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UniVista//Counseling//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@univista.ai`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${esc(ev.title)}`,
    `DESCRIPTION:${esc(ev.description)}`,
    ev.location ? `LOCATION:${esc(ev.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

export function downloadIcs(ev: BookingEvent, filename = "counseling.ics") {
  const blob = new Blob([buildIcs(ev)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export function googleCalendarUrl(ev: BookingEvent): string {
  const { start, end } = eventTimes(ev);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    details: ev.description,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
  });
  if (ev.location) p.set("location", ev.location);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function outlookCalendarUrl(ev: BookingEvent): string {
  const { start, end } = eventTimes(ev);
  const p = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: ev.title,
    body: ev.description,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
  });
  if (ev.location) p.set("location", ev.location);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`;
}
