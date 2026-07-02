import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Classifieds, listings, and premium discovery',
      description: 'Browse offers, services, businesses, and public posts through a polished directory-style experience.',
      openGraphTitle: 'Classifieds, listings, and premium discovery',
      openGraphDescription: 'Explore a premium marketplace-style experience for listings, businesses, and useful resources.',
      keywords: ['classifieds', 'business listings', 'offers', 'directory', 'marketplace'],
    },
    hero: {
      badge: 'Newly discovered',
      title: ['Find standout listings,', 'offers, and business leads.'],
      description: 'Search across trusted businesses, current classifieds, useful profiles, and fresh public posts in one elegant destination.',
      primaryCta: { label: 'Browse articles', href: '/article' },
      secondaryCta: { label: 'Post a listing', href: '/create' },
      searchPlaceholder: 'Search products, services, businesses, or locations',
      focusLabel: 'Featured',
      featureCardBadge: 'spotlight listing',
      featureCardTitle: 'A marketplace homepage designed around active discovery.',
      featureCardDescription: 'Bold search, category browsing, and mixed card layouts keep the experience dynamic without changing the underlying data.',
    },
    intro: {
      badge: 'About the platform',
      title: 'A polished destination for modern business discovery.',
      paragraphs: [
        'Visitors can search, compare, and explore across listings, classifieds, profiles, and media from one connected experience.',
        'The browsing flow is built for quick scanning first, then deeper detail when a post deserves attention.',
        'This makes it easier to move from discovery to contact without losing context across the site.',
      ],
      sideBadge: 'Highlights',
      sidePoints: [
        'Search-first browsing with strong category navigation.',
        'Multiple card styles for offers, services, and editorial posts.',
        'Detail pages that foreground action, location, and contact info.',
        'A mobile-friendly flow that stays polished on every route.',
      ],
      primaryLink: { label: 'Browse articles', href: '/article' },
      secondaryLink: { label: 'Browse profiles', href: '/profile' },
    },
    cta: {
      badge: 'Start posting',
      title: 'Ready to share your offer, service, or business profile?',
      description: 'Create a post and put your information in front of people already browsing for solutions.',
      primaryCta: { label: 'Create a post', href: '/create' },
      secondaryCta: { label: 'Contact us', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest posts in this section.',
    },
  },
  about: {
    badge: 'About',
    title: 'A discovery experience that feels curated instead of crowded.',
    description: `${slot4BrandConfig.siteName} helps people browse services, offers, and useful posts through a clearer marketplace-style interface.`,
    paragraphs: [
      'The site brings together directory browsing, classified-style discovery, and content-led exploration in one cohesive flow.',
      'Every route is designed to make scanning, comparing, and contacting feel simple on both desktop and mobile.',
    ],
    values: [
      {
        title: 'Clear discovery',
        description: 'Search, sections, and cards are structured to help visitors find relevant options quickly.',
      },
      {
        title: 'Premium presentation',
        description: 'Listings, profiles, and posts all receive stronger visual hierarchy and better detail pages.',
      },
      {
        title: 'Action-ready pages',
        description: 'Key details, contact routes, and useful summaries stay close to the main content.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Questions, listing support, or partnership interest.',
    description: 'Reach out if you need help with a post, want to share feedback, or have a business-related inquiry.',
    formTitle: 'Send a message',
  },
  search: {
    metadata: {
      title: 'Search',
      description: 'Search across listings, classifieds, profiles, resources, and public posts.',
    },
    hero: {
      badge: 'Search the marketplace',
      title: 'Find businesses, services, and fresh offers faster.',
      description: 'Use keywords and categories to move quickly from browsing to the posts that matter most.',
      placeholder: 'Search by keyword, service, offer, business, or category',
    },
    resultsTitle: 'Matching posts',
  },
  create: {
    metadata: {
      title: 'Create',
      description: 'Create and submit a new public post.',
    },
    locked: {
      badge: 'Member access',
      title: 'Login to publish new content.',
      description: 'Use your account to create listings, offers, profiles, and supporting posts.',
    },
    hero: {
      badge: 'Publishing workspace',
      title: 'Create a polished post for the right section.',
      description: 'Choose the content type, add your details, and submit a clean entry with images, summary, and content.',
    },
    formTitle: 'Post details',
    submitLabel: 'Submit post',
    successTitle: 'Your post was submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Login page for this site.',
      badge: 'Welcome back',
      title: 'Access your account and continue publishing.',
      description: 'Login to manage posts, continue browsing, and submit new listings or offers.',
      formTitle: 'Login',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then login.',
      success: 'Login successful. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Signup page for this site.',
      badge: 'Join the platform',
      title: 'Create your account and start sharing.',
      description: 'Create an account to post listings, offers, profiles, and more.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created successfully. Redirecting...',
      loginCta: 'Login',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related articles',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'Related listings',
      fallbackTitle: 'Listing details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'Suggested profiles',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit official site',
    },
  },
} as const
