import type { Incident } from './types';

const STORAGE_KEY = 'conflict-buddy-incidents';

export function loadIncidents(): Incident[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Incident[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveIncidents(incidents: Incident[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
}

export function upsertIncident(incidents: Incident[], incident: Incident): Incident[] {
  const idx = incidents.findIndex((i) => i.id === incident.id);
  if (idx === -1) return [incident, ...incidents];
  const next = [...incidents];
  next[idx] = incident;
  return next;
}

export function removeIncident(incidents: Incident[], id: string): Incident[] {
  return incidents.filter((i) => i.id !== id);
}
