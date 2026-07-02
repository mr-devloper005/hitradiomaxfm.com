import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY = "'Cormorant Garamond', 'Times New Roman', serif"
const BODY = "'Manrope', 'Segoe UI', sans-serif"

const base = {
  dark: true,
  fontDisplay: DISPLAY,
  fontBody: BODY,
  bg: '#081a2b',
  surface: 'rgba(10, 26, 43, 0.84)',
  raised: 'rgba(255,255,255,0.04)',
  text: '#f8efe1',
  muted: 'rgba(248,239,225,0.72)',
  line: 'rgba(255,255,255,0.1)',
  accent: '#ffb200',
  accentSoft: 'rgba(255,178,0,0.14)',
  onAccent: '#231607',
  glow: 'rgba(255,178,0,0.18)',
  radius: '1.5rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Editorial', note: 'Curated reads and useful updates for busy owners.' },
  listing: { ...base, kicker: 'Directory', note: 'Discover trusted businesses, services, and local opportunities.' },
  classified: { ...base, kicker: 'Marketplace', note: 'Browse fresh offers, deals, and everyday listings.' },
  image: { ...base, kicker: 'Gallery', note: 'Visual discovery with large imagery and quick browsing.' },
  sbm: { ...base, kicker: 'Resources', note: 'Saved links, references, and tools worth revisiting.' },
  pdf: { ...base, kicker: 'Library', note: 'Documents, brochures, and downloadable resources.' },
  profile: { ...base, kicker: 'Profiles', note: 'People, brands, and service providers in one place.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
