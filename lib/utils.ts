import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initials(prenom?: string | null, nom?: string | null): string {
  return `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}` || "?"
}

export function initialsFromName(nomComplet?: string | null): string {
  if (!nomComplet) return "?"
  const parts = nomComplet.trim().split(/\s+/)
  return parts.map(p => p[0]).slice(0, 2).join("").toUpperCase() || "?"
}
