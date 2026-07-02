import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, BriefcaseBusiness, ChevronDown, FileText, Globe2, MapPin, Phone, Search, Star, Tag, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail) || asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.8 + (hashStr(post.slug || post.id || post.title || 'x') % 12) / 10) * 10) / 10
}

const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 4 + (hashStr((post.slug || post.title || 'x') + 'r') % 220)
}

const archiveAdSlot: Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'> = {
  article: 'in-feed',
  listing: 'header',
  classified: 'in-feed',
  image: 'sidebar',
  sbm: 'footer',
  pdf: 'article-bottom',
  profile: 'sidebar',
}

function RatingRow({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-white/10 text-white/10'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">({reviewsOf(post)})</span>
    </div>
  )
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const hero = posts[0]
  const gridPosts = posts.slice(1)

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="relative overflow-hidden border-b border-[var(--tk-line)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,178,0,0.18),transparent_32%)]" />
          <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-18 lg:px-8">
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--tk-accent)]">
                  <span>{theme.kicker}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)]" />
                  <span className="text-[var(--tk-muted)]">{label}</span>
                </div>
                <h1 className="editable-display mt-5 max-w-3xl text-5xl font-semibold leading-[0.92] text-balance sm:text-6xl">
                  {voice?.headline || `Browse ${label}`}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--tk-muted)]">{voice?.description || theme.note}</p>

                <form action={basePath} className="mt-8 rounded-[1.7rem] border border-white/10 bg-white/95 p-4 text-[#18222c] shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_auto]">
                    <label className="rounded-[1rem] border border-[#dde4ea] px-4 py-3">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#55616f]">Keyword</span>
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-[#7b8794]" />
                        <input name="q" placeholder={`Search ${label.toLowerCase()}`} className="w-full bg-transparent text-sm outline-none placeholder:text-[#9ba7b3]" />
                      </div>
                    </label>
                    <label className="rounded-[1rem] border border-[#dde4ea] px-4 py-3">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#55616f]">Category</span>
                      <div className="relative">
                        <select name="category" defaultValue={category} className="w-full appearance-none bg-transparent pr-8 text-sm outline-none">
                          <option value="all">All categories</option>
                          {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8794]" />
                      </div>
                    </label>
                    <button className="rounded-[1rem] bg-[#3d7cc8] px-6 py-3 text-sm font-bold text-white">Search</button>
                  </div>
                </form>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[var(--tk-muted)]">
                  <span className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-2">
                    <strong className="text-[var(--tk-text)]">{posts.length}</strong> results
                  </span>
                  <span className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-2">{categoryLabel}</span>
                </div>
              </div>

              {hero ? (
                <Link href={`${basePath}/${hero.slug}`} className="group overflow-hidden rounded-[1.9rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                  <div className="grid sm:grid-cols-[0.92fr_1.08fr]">
                    <div className="relative min-h-[260px] overflow-hidden bg-[var(--tk-raised)]">
                      <img src={getImage(hero)} alt={hero.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                    </div>
                    <div className="p-6 sm:p-7">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Featured now</p>
                      <h2 className="editable-display mt-3 text-3xl font-semibold leading-[0.96]">{hero.title}</h2>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(hero) || `Explore this featured ${label.toLowerCase()} item.`}</p>
                      <RatingRow post={hero} />
                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--tk-muted)]">
                        {getField(hero, ['location', 'address', 'city']) ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {getField(hero, ['location', 'address', 'city'])}</span> : null}
                        {getField(hero, ['price', 'amount', 'budget']) ? <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 font-bold text-[var(--tk-accent)]">{getField(hero, ['price', 'amount', 'budget'])}</span> : null}
                      </div>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-accent)]">View details <ArrowRight className="h-4 w-4" /></span>
                    </div>
                  </div>
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 lg:px-8">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Ads slot={archiveAdSlot[task]} showLabel eager className="mx-auto w-full" />
          </div>

          {gridPosts.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {gridPosts.map((post, index) => (
                <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />
              ))}
            </div>
          ) : posts.length ? null : (
            <div className="mx-auto max-w-xl rounded-[var(--tk-radius)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-3xl font-semibold">Nothing here yet</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--tk-muted)]">Try another category, or check back after new {label.toLowerCase()} are published.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">Previous</Link> : null}
              <span className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 font-medium text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}`
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function CardShell({ children, href, className = '' }: { children: ReactNode; href: string; className?: string }) {
  return (
    <Link href={href} className={`group block overflow-hidden rounded-[1.55rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_24px_70px_rgba(0,0,0,0.18)] transition duration-500 hover:-translate-y-1 ${className}`}>
      {children}
    </Link>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <CardShell href={href}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--tk-raised)]">
        <img src={getImage(post)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
      </div>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, 'Article')} | {String(index + 1).padStart(2, '0')}</p>
        <h2 className="editable-display mt-2 text-3xl font-semibold leading-[0.98]">{post.title}</h2>
        <RatingRow post={post} />
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
    </CardShell>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImage(post)
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  return (
    <CardShell href={href} className="p-5">
      <div className="flex gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1rem] bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><BriefcaseBusiness className="h-8 w-8 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="min-w-0">
          <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--tk-accent)]">{getCategory(post, 'Listing')}</span>
          <h2 className="editable-display mt-3 line-clamp-2 text-3xl font-semibold leading-[0.98]">{post.title}</h2>
          <RatingRow post={post} />
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--tk-muted)]">
            {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
            {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          </div>
        </div>
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </CardShell>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <CardShell href={href}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--tk-raised)]">
        <img src={getImage(post)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-3xl font-bold text-[var(--tk-accent)]">{getField(post, ['price', 'amount', 'budget']) || 'Check with seller'}</p>
          <span className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-xs text-[var(--tk-muted)]">{getField(post, ['condition', 'type', 'availability']) || getCategory(post, 'Classified')}</span>
        </div>
        <h2 className="editable-display mt-3 line-clamp-2 text-3xl font-semibold leading-[0.98]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        {getField(post, ['location', 'address', 'city']) ? <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--tk-muted)]"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {getField(post, ['location', 'address', 'city'])}</p> : null}
      </div>
    </CardShell>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <CardShell href={href}>
      <div className={`relative overflow-hidden bg-[var(--tk-raised)] ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={getImage(post)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(4,14,24,0.9))]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, 'Gallery')}</p>
          <h2 className="editable-display mt-2 line-clamp-2 text-3xl font-semibold leading-[0.98] text-white">{post.title}</h2>
        </div>
      </div>
    </CardShell>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <CardShell href={href} className="p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <Globe2 className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">Saved resource {String(index + 1).padStart(2, '0')}</p>
          <h2 className="editable-display mt-2 line-clamp-2 text-3xl font-semibold leading-[0.98]">{post.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        </div>
      </div>
    </CardShell>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <CardShell href={href} className="p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1rem] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <FileText className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, 'Document')}</p>
          <h2 className="editable-display mt-2 line-clamp-2 text-3xl font-semibold leading-[0.98]">{post.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        </div>
      </div>
    </CardShell>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImage(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <CardShell href={href} className="p-6 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--tk-raised)]">
        {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <h2 className="editable-display mt-4 line-clamp-2 text-3xl font-semibold leading-[0.98]">{post.title}</h2>
      {role ? <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{role}</p> : null}
      <RatingRow post={post} />
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </CardShell>
  )
}
