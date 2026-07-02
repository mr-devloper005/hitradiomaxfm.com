import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Bookmark, Building2, Camera, CheckCircle2, Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, Star, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
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
  return 8 + (hashStr((post.slug || post.title || 'x') + 'r') % 240)
}

function collectionHref(task: TaskKey) {
  if (task === 'listing' || task === 'classified') return '/search'
  return getTaskConfig(task)?.route || '/'
}

const detailAdSlot: Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'> = {
  article: 'article-bottom',
  listing: 'footer',
  classified: 'in-feed',
  image: 'sidebar',
  sbm: 'footer',
  pdf: 'article-bottom',
  profile: 'sidebar',
}

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-white/10 text-white/10'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)] opacity-50" />
          <span className="text-sm text-[var(--tk-muted)]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)]" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  const href = collectionHref(task)
  const label = task === 'listing' || task === 'classified' ? 'Back to search' : `Back to ${taskConfig?.label || 'posts'}`
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  )
}

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <BackLink task="article" />
        <div className="mt-8">
          <Kicker task="article">{categoryOf(post, 'Article')}</Kicker>
          <h1 className="editable-display mt-5 text-balance text-5xl font-semibold leading-[0.92] sm:text-6xl">{post.title}</h1>
          {leadText(post) ? <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          <DetailMeta post={post} category={categoryOf(post, 'Article')} />
        </div>
        {images[0] ? <img src={images[0]} alt="" className="mt-8 aspect-[16/8] w-full rounded-[1.8rem] border border-[var(--tk-line)] object-cover shadow-[0_24px_80px_rgba(0,0,0,0.22)]" /> : null}
        <BodyContent post={post} />
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Ads slot={detailAdSlot.article} showLabel eager className="mx-auto w-full" />
        </div>
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="listing" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="min-w-0">
          <Kicker task="listing">Business listing</Kicker>
          <h1 className="editable-display mt-5 text-5xl font-semibold leading-[0.92] sm:text-6xl">{post.title}</h1>
          <DetailMeta post={post} category={categoryOf(post, 'Listing')} />
          {leadText(post) ? <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
          <ImageHero images={images} />
          <BodyContent post={post} />
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <ActionCard title="Quick actions">
            <ContactAction website={website} phone={phone} email={email} />
          </ActionCard>
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Ads slot={detailAdSlot.listing} showLabel eager className="mx-auto w-full" />
          </div>
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <RelatedPanel task="listing" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="classified" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
              <Kicker task="classified">Classified</Kicker>
              <h1 className="editable-display mt-4 text-4xl font-semibold leading-[0.96]">{post.title}</h1>
              <DetailMeta post={post} category={categoryOf(post, 'Classified')} />
              <p className="mt-6 text-4xl font-bold text-[var(--tk-accent)]">{price || 'Check with seller'}</p>
              <div className="mt-6 grid gap-3">
                {condition ? <BadgeLine label="Condition" value={condition} /> : null}
                {location ? <BadgeLine label="Location" value={location} /> : null}
              </div>
              <div className="mt-7 grid gap-3">
                {phone ? <a href={`tel:${phone}`} className="rounded-[1rem] bg-[var(--tk-accent)] px-5 py-3 text-center text-sm font-bold text-[var(--tk-on-accent)]">Call now</a> : null}
                {email ? <a href={`mailto:${email}`} className="rounded-[1rem] border border-[var(--tk-line)] px-5 py-3 text-center text-sm font-bold">Send email</a> : null}
                {website ? <Link href={website} target="_blank" rel="noreferrer" className="rounded-[1rem] border border-[var(--tk-line)] px-5 py-3 text-center text-sm font-bold">Visit website</Link> : null}
              </div>
            </div>
          </aside>

          <article className="min-w-0">
            <ImageHero images={images} />
            <BodyContent post={post} />
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={detailAdSlot.classified} showLabel eager className="mx-auto w-full" />
            </div>
          </article>
        </div>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[1.5rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Kicker task="image">Image gallery</Kicker>
            <h1 className="editable-display mt-5 text-5xl font-semibold leading-[0.92] sm:text-6xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-5 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={detailAdSlot.image} showLabel eager className="mx-auto w-full" />
            </div>
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <BackLink task="sbm" />
        <div className="mt-8 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.4rem] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <Bookmark className="h-8 w-8" />
        </div>
        <div className="mt-6"><Kicker task="sbm">Saved resource</Kicker></div>
        <h1 className="editable-display mt-5 text-5xl font-semibold leading-[0.92] sm:text-6xl">{post.title}</h1>
        {leadText(post) ? <p className="mt-5 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-[1rem] bg-[var(--tk-accent)] px-5 py-3 text-sm font-bold text-[var(--tk-on-accent)]">
            Open resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        <BodyContent post={post} />
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Ads slot={detailAdSlot.sbm} showLabel eager className="mx-auto w-full" />
        </div>
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="pdf" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="min-w-0">
          <Kicker task="pdf">{categoryOf(post, 'Document')}</Kicker>
          <h1 className="editable-display mt-5 text-5xl font-semibold leading-[0.92] sm:text-6xl">{post.title}</h1>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                <span className="text-sm font-semibold">Document preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-bold text-[var(--tk-on-accent)]">Download <Download className="h-4 w-4" /></Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-[var(--tk-raised)]" />
            </div>
          ) : null}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {fileUrl ? (
            <ActionCard title="Get this document">
              <p className="text-sm leading-7 text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[var(--tk-accent)] px-5 py-3 text-sm font-bold text-[var(--tk-on-accent)]">Download <Download className="h-4 w-4" /></Link>
            </ActionCard>
          ) : null}
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Ads slot={detailAdSlot.pdf} showLabel eager className="mx-auto w-full" />
          </div>
          <RelatedPanel task="pdf" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="profile" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[var(--tk-raised)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
              </div>
              <h1 className="editable-display mt-6 text-4xl font-semibold leading-[0.96]">{post.title}</h1>
              {role ? <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{role}</p> : null}
              <DetailMeta post={post} center />
            <div className="mt-6">
              <ContactAction website={website} email={email} bare />
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Ads slot={detailAdSlot.profile} showLabel eager className="mx-auto w-full" />
          </div>
        </aside>
          <article className="min-w-0">
            <Kicker task="profile">Profile</Kicker>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

function ActionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[1.6rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--tk-accent)]">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none rounded-[1.6rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 text-[var(--tk-text)] sm:p-8 ${compact ? 'text-[15px] leading-7' : 'text-[1.02rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[1.3rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--tk-accent)]"><Icon className="h-4 w-4" /> {label}</div>
          <p className="mt-2 break-words text-sm leading-6 text-[var(--tk-text)]">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageHero({ images }: { images: string[] }) {
  const visible = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="overflow-hidden rounded-[1.7rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
        <img src={visible[0]} alt="" className="aspect-[16/10] w-full object-cover" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {visible.slice(1, 5).map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt="" className="aspect-square rounded-[1.2rem] border border-[var(--tk-line)] object-cover" />
        ))}
      </div>
    </section>
  )
}

function ImageStrip({ images, label }: { images: string[]; label: string }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">{label}</p>
      <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
        {images.slice(0, 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[1.2rem] border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="flex items-center gap-2 p-4 text-sm font-semibold"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[1rem] bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-bold text-[var(--tk-on-accent)]">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-[1rem] border border-[var(--tk-line)] px-4 py-2.5 text-sm font-bold"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-[1rem] border border-[var(--tk-line)] px-4 py-2.5 text-sm font-bold"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return buttons
  return buttons
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-bold uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  const href = collectionHref(task)
  return (
    <div className="space-y-6">
      <ActionCard title="About this post">
        <div className="grid gap-2.5 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
          {categoryOf(post, '') ? <p className="inline-flex items-center gap-2"><Building2 className="h-4 w-4 text-[var(--tk-accent)]" /> {categoryOf(post, '')}</p> : null}
        </div>
      </ActionCard>
      {related.length ? (
        <ActionCard title="More like this">
          <div className="grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
          <div className="mt-4">
            <Link href={href} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-accent)]">Explore more <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </ActionCard>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  const href = collectionHref(task)
  const title = task === 'listing' || task === 'classified' ? 'More to explore' : `More ${(taskConfig?.label || 'posts').toLowerCase()}`
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-4xl font-semibold">{title}</h2>
          <Link href={href} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-accent)]">Explore more <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[1.4rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><Camera className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-5">
          <h3 className="editable-display line-clamp-2 text-2xl font-semibold leading-[0.98]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-[1rem] border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
      {image ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-[0.9rem] object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[0.9rem] bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
