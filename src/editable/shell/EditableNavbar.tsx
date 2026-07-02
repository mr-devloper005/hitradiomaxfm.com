'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LogIn, MapPin, Menu, PlusCircle, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const hiddenTasks = useMemo(() => new Set(['listing', 'classified']), [])
  const navItems = useMemo(
    () => SITE_CONFIG.tasks
      .filter((task) => task.enabled && !hiddenTasks.has(task.key))
      .map((task) => ({ label: task.label, href: task.route })),
    [hiddenTasks]
  )

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)]/95 text-[var(--editable-nav-text)] backdrop-blur-xl">
      <div className="border-b border-white/6">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-[var(--slot4-muted-text)] sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[var(--slot4-accent)]" />
            <span>Discovery marketplace for India</span>
            <span className="hidden text-white/40 sm:inline">|</span>
            <Link href="/search" className="hidden text-[var(--slot4-accent)] sm:inline">
              Change location
            </Link>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/contact" className="hover:text-white">Contact us</Link>
            <Link href="/search" className="hover:text-white">Messages</Link>
            <Link href="/search" className="hover:text-white">Favorites</Link>
          </div>
        </div>
      </div>

      <nav className="mx-auto flex max-w-[var(--editable-container)] items-center gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-white/10 bg-white/5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-9 w-9 object-contain" />
          </span>
          <span className="min-w-0">
            <span className="editable-display block truncate text-3xl font-semibold leading-none text-white">{SITE_CONFIG.name}</span>
            <span className="mt-1 block truncate text-[11px] uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
              {globalContent.nav?.tagline || SITE_CONFIG.tagline}
            </span>
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-7 lg:flex">
          {navItems.slice(0, 5).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm font-semibold transition ${
                  active ? 'text-white' : 'text-[var(--slot4-muted-text)] hover:text-white'
                }`}
              >
                {item.label}
                {active ? <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-[var(--slot4-accent)]" /> : null}
              </Link>
            )
          })}
          <Link href="/search" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-[var(--slot4-muted-text)] hover:text-white">
            Categories <ChevronDown className="h-4 w-4" />
          </Link>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center xl:flex">
          <form action="/search" className="editable-glass editable-card-shadow flex w-full max-w-xl items-center overflow-hidden rounded-[1.25rem] border border-white/10">
            <Search className="ml-4 h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
            <input
              name="q"
              type="search"
              placeholder="Search listings, offers, services..."
              className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-white outline-none placeholder:text-[var(--slot4-muted-text)]"
            />
            <button className="m-1 rounded-[0.9rem] bg-[linear-gradient(135deg,#FFB200,#EB5B00)] px-5 py-2.5 text-sm font-bold text-[#1d1207]">
              Search
            </button>
          </form>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <Link
                href="/create"
                className="hidden items-center gap-2 rounded-[1rem] bg-[linear-gradient(135deg,#FFB200,#EB5B00)] px-4 py-3 text-sm font-bold text-[#140d07] shadow-[0_12px_30px_rgba(235,91,0,0.22)] sm:inline-flex"
              >
                <PlusCircle className="h-4 w-4" /> Post an ad
              </Link>
              <button type="button" onClick={logout} className="hidden px-3 py-2 text-sm font-semibold text-[var(--slot4-muted-text)] hover:text-white sm:inline-flex">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden items-center gap-2 px-3 py-2 text-sm font-semibold text-[var(--slot4-muted-text)] hover:text-white sm:inline-flex">
                <LogIn className="h-4 w-4" /> Login
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-2 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:border-[var(--slot4-accent)] sm:inline-flex"
              >
                <UserPlus className="h-4 w-4" /> Register
              </Link>
              <Link
                href="/create"
                className="hidden items-center gap-2 rounded-[1rem] bg-[linear-gradient(135deg,#FFB200,#EB5B00)] px-4 py-3 text-sm font-bold text-[#140d07] shadow-[0_12px_30px_rgba(235,91,0,0.22)] md:inline-flex"
              >
                <PlusCircle className="h-4 w-4" /> Post an ad
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-[1rem] border border-white/10 bg-white/5 p-3 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-white/10 px-4 py-5 lg:hidden">
          <form action="/search" className="editable-glass mb-4 flex items-center overflow-hidden rounded-[1rem] border border-white/10">
            <Search className="ml-4 h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
            <input name="q" type="search" placeholder="Search everything" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-[var(--slot4-muted-text)]" />
          </form>
          <div className="grid gap-2">
            {[{ label: 'Home', href: '/' }, ...navItems, { label: 'Contact', href: '/contact' }, ...(session ? [{ label: 'Create', href: '/create' }] : [{ label: 'Login', href: '/login' }, { label: 'Sign up', href: '/signup' }])].map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-[1rem] border px-4 py-3 text-sm font-semibold ${
                    active
                      ? 'border-[var(--slot4-accent)] bg-[rgba(255,178,0,0.12)] text-white'
                      : 'border-white/8 bg-white/5 text-[var(--slot4-muted-text)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}
    </header>
  )
}
