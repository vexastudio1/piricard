"use client";

import { useState } from "react";
import type { BusinessHoursEntry } from "@/lib/businesses";

function minutes(value: string): number {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

interface OpeningState {
  isOpen: boolean;
  message: string;
  schedule: string;
}

const dayNames = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

function getLisbonTime() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    day: dayMap[weekday ?? ""] ?? 0,
    current: Number(parts.find((part) => part.type === "hour")?.value ?? 0) * 60
      + Number(parts.find((part) => part.type === "minute")?.value ?? 0),
  };
}

function nextOpening(hours: BusinessHoursEntry[], day: number, current: number): string | undefined {
  const today = hours.find((entry) => entry.days.includes(day));
  const laterToday = today?.periods.find((period) => minutes(period.open) > current);
  if (laterToday) return `Abre às ${laterToday.open}`;

  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDay = (day + offset) % 7;
    const entry = hours.find((item) => item.days.includes(nextDay));
    const opening = entry?.periods[0]?.open;
    if (!opening) continue;
    return offset === 1 ? `Abre amanhã às ${opening}` : `Abre ${dayNames[nextDay]} às ${opening}`;
  }
}

function getOpeningState(hours: BusinessHoursEntry[]): OpeningState {
  const { day, current } = getLisbonTime();
  const today = hours.find((entry) => entry.days.includes(day));
  const schedule = today?.periods.map((period) => `${period.open}–${period.close}`).join(" · ") ?? "Encerrado";
  const activePeriod = today?.periods.find((period) => current >= minutes(period.open) && current < minutes(period.close));

  if (activePeriod) {
    return { isOpen: true, message: `Aberto agora · Fecha às ${activePeriod.close}`, schedule };
  }

  const next = nextOpening(hours, day, current);
  return {
    isOpen: false,
    message: next ? `Fechado agora · ${next}` : "Encerrado hoje",
    schedule,
  };
}

export function OpeningStatus({ hours }: { hours: BusinessHoursEntry[] }) {
  const [state] = useState(() => getOpeningState(hours));
  return <span className="opening-status" data-open={state.isOpen} suppressHydrationWarning>{state.message}</span>;
}

export function TodayHours({ hours }: { hours: BusinessHoursEntry[] }) {
  const [state] = useState(() => getOpeningState(hours));
  return (
    <span className="today-hours" suppressHydrationWarning>
      <span>{state.schedule}</span>
      <span className="today-hours-state" data-open={state.isOpen}>{state.isOpen ? "Aberto" : "Fechado"}</span>
    </span>
  );
}

export function BusinessHoursSchedule({ hours }: { hours: BusinessHoursEntry[] }) {
  const [currentDay] = useState(() => getLisbonTime().day);

  return (
    <dl className="profile-hours" suppressHydrationWarning>
      {hours.map((entry) => {
        const isToday = entry.days.includes(currentDay);
        return (
          <div key={entry.label} data-today={isToday}>
            <dt>{entry.label}{isToday ? <span>Hoje</span> : null}</dt>
            <dd>{entry.periods.map((period) => `${period.open}–${period.close}`).join(" · ") || "Encerrado"}</dd>
          </div>
        );
      })}
    </dl>
  );
}
