import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'Premium discovery for modern businesses',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'Premium discovery for modern businesses',
    primaryLinks: [
      { label: 'Articles', href: '/article' },
      { label: 'Profiles', href: '/profile' },
      { label: 'Images', href: '/image' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Post an ad', href: '/create' },
      secondary: { label: 'Get in touch', href: '/contact' },
    },
  },
  footer: {
    tagline: 'Find services, offers, and standout businesses',
    description: 'A discovery-led marketplace experience for offers, listings, people, and useful resources.',
    columns: [
      {
        title: 'Explore',
        links: [
          { label: 'Articles', href: '/article' },
          { label: 'Profiles', href: '/profile' },
          { label: 'Images', href: '/image' },
          { label: 'Documents', href: '/pdf' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ],
    bottomNote: 'Built for discovery, browsing, and direct action.',
  },
  commonLabels: {
    readMore: 'View details',
    viewAll: 'View all',
    explore: 'Explore',
    latest: 'Latest',
    related: 'Related',
    published: 'Published',
  },
} as const
