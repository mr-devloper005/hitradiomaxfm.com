import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Filter, MapPin, Search, Star } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const summaryOf = (post: SitePost) => post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''
const locationOf = (post: SitePost) => compactRaw(getContent(post).location) || compactRaw(getContent(post).city) || compactRaw(getContent(post).address)
const categoryOf = (post: SitePost) => compactRaw(getContent(post).category) || post.tags?.[0] || 'General'

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function hashStr(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

function ratingOf(post: SitePost) {
  const content = getContent(post)
  const real = Number(content.rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.8 + (hashStr(post.slug || post.id || post.title || 'x') % 12) / 10) * 10) / 10
}

function reviewsOf(post: SitePost) {
  const content = getContent(post)
  const real = Number(content.reviewCount ?? content.reviews)
  if (real > 0) return Math.floor(real)
  return 8 + (hashStr((post.slug || post.title || 'x') + 'r') % 140)
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'
  const price = compactRaw(getContent(post).price) || compactRaw(getContent(post).amount) || compactRaw(getContent(post).budget)
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  const layout = index % 5

  if (layout === 0) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 shadow-[0_24px_70px_rgba(0,0,0,0.18)] md:col-span-2">
        <div className="grid sm:grid-cols-[1fr_1fr]">
          <div className="relative min-h-[260px] overflow-hidden bg-white/5">
            {image ? <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" /> : null}
          </div>
          <div className="p-6 sm:p-7">
            <span className="rounded-full bg-[rgba(255,178,0,0.14)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">{taskLabel}</span>
            <h2 className="editable-display mt-4 line-clamp-2 text-4xl font-semibold leading-[0.96] text-white">{post.title}</h2>
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{summary}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-[3px]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--slot4-accent)] text-[var(--slot4-accent)]' : 'fill-white/10 text-white/10'}`} />
                ))}
              </span>
              <span className="text-sm text-[var(--slot4-muted-text)]">({reviewsOf(post)})</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--slot4-muted-text)]">
              {locationOf(post) ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--slot4-accent)]" /> {locationOf(post)}</span> : null}
              {price ? <span className="rounded-full bg-[rgba(255,178,0,0.14)] px-3 py-1 font-bold text-[var(--slot4-accent)]">{price}</span> : null}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.55rem] border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
        {image ? <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" /> : null}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-[rgba(255,178,0,0.14)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">{taskLabel}</span>
          {price ? <span className="text-sm font-bold text-[var(--slot4-accent)]">{price}</span> : null}
        </div>
        <h2 className="editable-display mt-3 line-clamp-2 text-3xl font-semibold leading-[0.98] text-white">{post.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{summary}</p>
        <p className="mt-3 text-xs font-medium text-[var(--slot4-muted-text)]">{categoryOf(post)}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--slot4-accent)]">Open result <ArrowRight className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled && item.key !== 'listing' && item.key !== 'classified')

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="editable-glass rounded-[2rem] border border-white/10 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{pagesContent.search.hero.badge}</p>
              <h1 className="editable-display mt-4 max-w-3xl text-5xl font-semibold leading-[0.92] text-white sm:text-6xl">
                {pagesContent.search.hero.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--slot4-muted-text)]">{pagesContent.search.hero.description}</p>

              <form action="/search" className="mt-8 rounded-[1.7rem] border border-white/10 bg-white/95 p-4 text-[#18222c] shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
                <input type="hidden" name="master" value="1" />
                <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
                  <label className="rounded-[1rem] border border-[#dde4ea] px-4 py-3">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#55616f]">Keyword</span>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-[#7b8794]" />
                      <input name="q" defaultValue={query} placeholder={pagesContent.search.hero.placeholder} className="w-full bg-transparent text-sm outline-none placeholder:text-[#9ba7b3]" />
                    </div>
                  </label>
                  <label className="rounded-[1rem] border border-[#dde4ea] px-4 py-3">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#55616f]">Category</span>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-[#7b8794]" />
                      <input name="category" defaultValue={category} placeholder="Category" className="w-full bg-transparent text-sm outline-none placeholder:text-[#9ba7b3]" />
                    </div>
                  </label>
                  <label className="rounded-[1rem] border border-[#dde4ea] px-4 py-3">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#55616f]">Content type</span>
                    <select name="task" defaultValue={task} className="w-full bg-transparent text-sm outline-none">
                      <option value="">All content types</option>
                      {enabledTasks.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                    </select>
                  </label>
                  <button className="rounded-[1rem] bg-[#3d7cc8] px-6 py-3 text-sm font-bold text-white" type="submit">Search</button>
                </div>
              </form>
            </div>

            <div className="editable-glass rounded-[2rem] border border-white/10 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">Search highlights</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.3rem] border border-white/8 bg-white/5 p-5">
                  <p className="text-3xl font-bold text-white">{results.length}</p>
                  <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">matching posts</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/8 bg-white/5 p-5">
                  <p className="text-3xl font-bold text-white">{enabledTasks.length}</p>
                  <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">active content sections</p>
                </div>
              </div>
              <div className="mx-auto max-w-6xl px-4 py-6">
                <Ads slot="header" showLabel eager className="mx-auto w-full" />
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">{results.length} results</p>
              <h2 className="editable-display mt-2 text-4xl font-semibold text-white">
                {query ? `Results for "${query}"` : pagesContent.search.resultsTitle}
              </h2>
            </div>
            <Link href="/article" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white">
              Browse latest <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {results.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => <SearchResultCard key={post.id || post.slug} post={post} index={index} />)}
            </div>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-10 text-center">
              <p className="editable-display text-4xl font-semibold text-white">No matching posts found.</p>
              <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">Try a different keyword, task type, or category.</p>
            </div>
          )}
        </section>
      </main>
    </EditableSiteShell>
  )
}
