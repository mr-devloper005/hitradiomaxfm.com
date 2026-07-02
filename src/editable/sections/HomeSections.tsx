import Link from 'next/link'
import {
  ArrowRight, Bookmark, BriefcaseBusiness, Building2, Camera, ChevronRight, FileText, Globe2, Heart, Image as ImageIcon,
  MapPin, Megaphone, Search, Star, UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Bookmark,
  pdf: FileText,
  profile: UserRound,
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

function dedupePosts(posts: SitePost[]) {
  return Array.from(new Map(posts.map((post) => [post.slug || post.id || post.title, post])).values())
}

function contentOf(post?: SitePost | null) {
  return post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
}

function textValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function excerptOf(post?: SitePost | null, limit = 120) {
  const content = contentOf(post)
  const raw = textValue(content.description) || textValue(content.summary) || post?.summary || ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = contentOf(post)
  return textValue(content.category) || post?.tags?.[0] || 'General'
}

function priceOf(post?: SitePost | null) {
  const content = contentOf(post)
  return textValue(content.price) || textValue(content.amount) || textValue(content.budget)
}

function locationOf(post?: SitePost | null) {
  const content = contentOf(post)
  return textValue(content.location) || textValue(content.city) || textValue(content.address)
}

function hashStr(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

function ratingOf(post: SitePost) {
  const content = contentOf(post)
  const real = Number(content.rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.9 + (hashStr(post.slug || post.id || post.title || 'x') % 11) / 10) * 10) / 10
}

function reviewsOf(post: SitePost) {
  const content = contentOf(post)
  const real = Number(content.reviewCount ?? content.reviews)
  if (real > 0) return Math.floor(real)
  return 8 + (hashStr((post.slug || post.title || 'x') + 'r') % 190)
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating)
  return (
    <span className="inline-flex items-center gap-[3px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < filled ? 'fill-[var(--slot4-accent)] text-[var(--slot4-accent)]' : 'fill-white/15 text-white/15'}`}
        />
      ))}
    </span>
  )
}

function HeartBadge() {
  return (
    <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[rgba(6,19,31,0.72)] text-white backdrop-blur-sm">
      <Heart className="h-4 w-4" />
    </span>
  )
}

function SearchHeroCard({ post, href }: { post?: SitePost; href: string }) {
  if (!post) return null
  const image = getEditablePostImage(post)
  const category = categoryOf(post)
  const price = priceOf(post)
  const location = locationOf(post)
  return (
    <Link href={href} className="editable-glass editable-card-shadow group block overflow-hidden rounded-[2rem] border border-white/10">
      <div className="grid min-h-[380px] md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative p-7 sm:p-9">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,178,0,0.16),rgba(100,13,95,0.24))]" />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">Featured spotlight</p>
            <h2 className="editable-display mt-4 text-4xl font-semibold leading-[0.95] text-white sm:text-5xl">{post.title}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--slot4-muted-text)]">{excerptOf(post, 170) || 'Explore this featured public post and discover more similar options on the site.'}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/8 px-4 py-2 text-sm text-white">{category}</span>
              {price ? <span className="rounded-full bg-[rgba(255,178,0,0.16)] px-4 py-2 text-sm font-bold text-[var(--slot4-accent)]">{price}</span> : null}
              {location ? <span className="rounded-full bg-white/8 px-4 py-2 text-sm text-white">{location}</span> : null}
            </div>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#FFB200,#EB5B00)] px-5 py-3 text-sm font-bold text-[#160d07]">
              View details <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div className="relative min-h-[260px] overflow-hidden">
          <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.4))]" />
        </div>
      </div>
    </Link>
  )
}

function CompactMiniCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group rounded-[1.4rem] border border-white/10 bg-white/5 p-4 hover:bg-white/[0.07]">
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] bg-[var(--slot4-media-bg)]">
          <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">{categoryOf(post)}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-bold text-white">{post.title}</h3>
          <p className="mt-1 text-sm text-[var(--slot4-muted-text)]">{locationOf(post) || 'Public listing'}</p>
        </div>
      </div>
    </Link>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const hero = pool[0]
  const side = pool.slice(1, 3)
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'listing' && task.key !== 'classified').slice(0, 8)

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]" />
      <div className={`${container} relative py-10 sm:py-14`}>
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="editable-glass rounded-[2rem] border border-white/10 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{pagesContent.home.hero.badge}</p>
              <h1 className="editable-display mt-4 max-w-3xl text-5xl font-semibold leading-[0.92] text-white sm:text-6xl lg:text-[4.75rem]">
                {pagesContent.home.hero.title.join(' ')}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--slot4-muted-text)]">{pagesContent.home.hero.description}</p>

              <form action="/search" className="editable-card-shadow mt-8 rounded-[1.7rem] border border-white/10 bg-white/95 p-4 text-[#18222c]">
                <div className="grid gap-3 lg:grid-cols-[1.25fr_1fr_1fr_auto]">
                  <label className="rounded-[1rem] border border-[#dde4ea] px-4 py-3">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#55616f]">What are you looking for?</span>
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-[#7b8794]" />
                      <input name="q" placeholder="eg. services, business, offer..." className="w-full bg-transparent text-sm outline-none placeholder:text-[#9ba7b3]" />
                    </span>
                  </label>
                  <label className="rounded-[1rem] border border-[#dde4ea] px-4 py-3">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#55616f]">In which category?</span>
                    <select name="category" className="w-full bg-transparent text-sm outline-none">
                      <option value="">All categories</option>
                      {categories.map((task) => <option key={task.key} value={task.key}>{task.label}</option>)}
                    </select>
                  </label>
                  <label className="rounded-[1rem] border border-[#dde4ea] px-4 py-3">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#55616f]">Where is it?</span>
                    <input name="location" placeholder="Country, region or city" className="w-full bg-transparent text-sm outline-none placeholder:text-[#9ba7b3]" />
                  </label>
                  <button className="flex min-h-[86px] items-center justify-center rounded-[1rem] bg-[#3d7cc8] px-6 text-white transition hover:brightness-95">
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((task) => {
                const Icon = taskIcon[task.key]
                return (
                  <Link key={task.key} href={task.route} className="group flex flex-col items-center gap-3 rounded-[1.3rem] border border-white/10 bg-white/5 px-3 py-5 text-center hover:-translate-y-1 hover:bg-white/[0.08]">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(255,178,0,0.14)] text-[var(--slot4-accent)]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-sm font-semibold leading-tight text-white">{task.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <SearchHeroCard post={hero} href={hero ? postHref(primaryTask, hero, primaryRoute) : primaryRoute} />
            <div className="grid gap-4 sm:grid-cols-2">
              {side.map((post) => (
                <CompactMiniCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableStoryRail({ primaryRoute }: HomeSectionProps) {
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'listing' && task.key !== 'classified')
  if (!categories.length) return null

  return (
    <section className="py-12 sm:py-14">
      <div className={container}>
        <div className="editable-glass rounded-[2rem] border border-white/10 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="editable-display text-4xl font-semibold text-white sm:text-5xl">Discover more</h2>
              <p className="mt-2 text-[var(--slot4-muted-text)]">Browse key sections and jump into the categories people explore most.</p>
            </div>
            <Link href={primaryRoute} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--slot4-accent)]">
              Explore all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-3">
            {categories.slice(0, 6).map((task) => (
              <Link key={task.key} href={task.route} className="flex items-center justify-between rounded-[1.2rem] border border-white/8 bg-white/5 px-5 py-4 text-white hover:bg-white/[0.08]">
                <span className="text-lg font-semibold">{task.label}</span>
                <ChevronRight className="h-5 w-5 text-[var(--slot4-accent)]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturedImageCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5">
      <div className="relative aspect-[0.92] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(4,14,24,0.92))]" />
        <HeartBadge />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-sm font-bold text-[var(--slot4-accent)]">{priceOf(post) || 'Check with seller'}</p>
          <h3 className="mt-2 line-clamp-2 text-2xl font-bold text-white">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-[var(--slot4-muted-text)]">{excerptOf(post, 80)}</p>
        </div>
      </div>
    </Link>
  )
}

function CompactCard({ post, href }: { post: SitePost; href: string }) {
  const rating = ratingOf(post)
  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.4rem] border border-white/10 bg-[rgba(255,255,255,0.04)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        <HeartBadge />
      </div>
      <div className="p-4">
        <p className="text-2xl font-bold text-[var(--slot4-accent)]">{priceOf(post) || 'Free'}</p>
        <h3 className="mt-1 line-clamp-2 text-2xl font-bold leading-tight text-white">{post.title}</h3>
        <div className="mt-2 flex items-center gap-2">
          <Stars rating={rating} />
          <span className="text-xs text-[var(--slot4-muted-text)]">({reviewsOf(post)})</span>
        </div>
        <p className="mt-2 line-clamp-1 text-sm text-[var(--slot4-muted-text)]">{excerptOf(post, 90)}</p>
      </div>
    </Link>
  )
}

function HorizontalCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group grid overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 sm:grid-cols-[190px_minmax(0,1fr)]">
      <div className="relative min-h-[180px] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[rgba(255,178,0,0.14)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">{categoryOf(post)}</span>
          <span className="text-sm text-[var(--slot4-muted-text)]">{locationOf(post) || 'Across the site'}</span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-3xl font-bold text-white">{post.title}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--slot4-muted-text)]">{excerptOf(post, 120)}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--slot4-accent)]">Open listing <ArrowRight className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}

function EditorialListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="flex items-start gap-4 rounded-[1.2rem] border-b border-white/8 pb-4 last:border-b-0 last:pb-0">
      <span className="editable-display text-4xl font-semibold text-white/28">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">{categoryOf(post)}</p>
        <h3 className="mt-2 line-clamp-2 text-xl font-bold text-white">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-7 text-[var(--slot4-muted-text)]">{excerptOf(post, 100)}</p>
      </div>
    </Link>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const activity = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(0, 10)
  if (!activity.length) return null

  return (
    <section className="py-12 sm:py-16">
      <div className={container}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="editable-display text-4xl font-semibold text-white sm:text-5xl">Newly discovered</h2>
            <p className="mt-2 text-lg text-[var(--slot4-muted-text)]">Deals and offers</p>
          </div>
          <Link href={primaryRoute} className="hidden items-center gap-2 text-sm font-bold text-[var(--slot4-accent)] sm:inline-flex">
            Browse more <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_1.1fr_0.9fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            {activity.slice(0, 4).map((post) => (
              <CompactCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
            ))}
          </div>
          <div className="grid gap-5">
            {activity.slice(4, 7).map((post, index) => (
              index === 0
                ? <FeaturedImageCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                : <HorizontalCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
            ))}
          </div>
          <div className="editable-glass rounded-[1.8rem] border border-white/10 p-5">
            <h3 className="editable-display text-3xl font-semibold text-white">Quick picks</h3>
            <div className="mt-6 grid gap-4">
              {activity.slice(7, 10).map((post, index) => (
                <EditorialListCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'Fresh this week', title: 'Recent finds worth a closer look' },
  browse: { eyebrow: 'Popular now', title: 'Most favorited listings by users' },
  index: { eyebrow: 'From the archive', title: 'Useful posts to keep on hand' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 6), href: primaryRoute },
          { key: 'browse', posts: posts.slice(6, 12), href: primaryRoute },
          { key: 'index', posts: posts.slice(12, 18), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore' }
        return (
          <section key={section.key} className={`py-12 sm:py-16 ${index % 2 === 0 ? '' : 'bg-[rgba(255,255,255,0.02)]'}`}>
            <div className={container}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">{copy.eyebrow}</p>
                  <h2 className="editable-display mt-2 text-4xl font-semibold text-white sm:text-5xl">{copy.title}</h2>
                </div>
                <Link href={section.href || primaryRoute} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--slot4-accent)]">
                  See all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {section.posts.slice(0, 6).map((post, cardIndex) => {
                  const href = postHref(primaryTask, post, primaryRoute)
                  if (cardIndex === 0) return <FeaturedImageCard key={post.id || post.slug} post={post} href={href} />
                  if (cardIndex % 3 === 0) return <HorizontalCard key={post.id || post.slug} post={post} href={href} />
                  return <CompactCard key={post.id || post.slug} post={post} href={href} />
                })}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

export function EditableHomeCta() {
  return (
    <section className="py-12 sm:py-16">
      <div className={container}>
        <div className="rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,178,0,0.95),rgba(235,91,0,0.92))] p-8 text-[#180f07] shadow-[0_30px_80px_rgba(235,91,0,0.22)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5d2307]">Post your next update</p>
              <h2 className="editable-display mt-3 text-4xl font-semibold sm:text-5xl">{pagesContent.home.cta.title}</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#4a2411]">{pagesContent.home.cta.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/create" className="rounded-[1.2rem] bg-[#101a23] px-6 py-4 text-center text-sm font-bold text-white">
                Create a post
              </Link>
              <Link href="/contact" className="rounded-[1.2rem] border border-[#86400e] px-6 py-4 text-center text-sm font-bold text-[#4a2411]">
                Contact us
              </Link>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] bg-white/20 px-5 py-4">
              <p className="text-sm font-bold">Directory ready</p>
              <p className="mt-1 text-sm text-[#5d2307]">Listings, services, and profiles.</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/20 px-5 py-4">
              <p className="text-sm font-bold">Marketplace-friendly</p>
              <p className="mt-1 text-sm text-[#5d2307]">Perfect for current offers and deals.</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/20 px-5 py-4">
              <p className="text-sm font-bold">Built to browse</p>
              <p className="mt-1 text-sm text-[#5d2307]">Fast scanning on mobile and desktop.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
