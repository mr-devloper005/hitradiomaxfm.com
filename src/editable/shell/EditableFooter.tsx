'use client'

import Link from 'next/link'
import { ArrowUpRight, Globe2, MapPin, Phone } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'listing' && task.key !== 'classified')
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="mt-auto border-t border-white/8 bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8">
        <div className="editable-glass editable-card-shadow rounded-[2rem] border border-white/8 p-8 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-white/10 bg-white/5">
                  <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-9 w-9 object-contain" />
                </span>
                <span>
                  <span className="editable-display block text-3xl font-semibold text-white">{SITE_CONFIG.name}</span>
                  <span className="text-xs uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">{globalContent.footer.tagline}</span>
                </span>
              </Link>
              <p className="mt-5 max-w-md text-sm leading-7 text-[var(--slot4-muted-text)]">{globalContent.footer.description}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--slot4-muted-text)]">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2"><MapPin className="h-4 w-4 text-[var(--slot4-accent)]" /> India</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2"><Phone className="h-4 w-4 text-[var(--slot4-accent)]" /> Public posts</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2"><Globe2 className="h-4 w-4 text-[var(--slot4-accent)]" /> Multi-category</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">Trending categories</h3>
              <div className="mt-5 grid gap-3">
                {taskLinks.slice(0, 7).map((task) => (
                  <Link key={task.key} href={task.route} className="inline-flex items-center justify-between gap-2 text-sm text-[var(--slot4-muted-text)] hover:text-white">
                    {task.label} <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">Popular locations</h3>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-[var(--slot4-muted-text)]">
                {['Delhi', 'Mumbai', 'Hyderabad', 'Bengaluru', 'Chennai', 'Pune'].map((city) => (
                  <span key={city}>{city}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">Help & support</h3>
              <div className="mt-5 grid gap-3">
                <Link href="/contact" className="text-sm text-[var(--slot4-muted-text)] hover:text-white">Contact us</Link>
                <Link href="/about" className="text-sm text-[var(--slot4-muted-text)] hover:text-white">About us</Link>
                {session ? (
                  <>
                    <Link href="/create" className="text-sm text-[var(--slot4-muted-text)] hover:text-white">Add a new post</Link>
                    <button type="button" onClick={logout} className="text-left text-sm text-[var(--slot4-muted-text)] hover:text-white">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/signup" className="text-sm text-[var(--slot4-muted-text)] hover:text-white">Sign up</Link>
                    <Link href="/login" className="text-sm text-[var(--slot4-muted-text)] hover:text-white">Login</Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/8 pt-6 text-sm text-[var(--slot4-muted-text)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-4">
              <Link href="/search" className="hover:text-white">Search</Link>
              <Link href="/create" className="hover:text-white">Add a new post</Link>
              <Link href="/contact" className="hover:text-white">Support</Link>
            </div>
            <p>Copyright © {year} {SITE_CONFIG.name}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
