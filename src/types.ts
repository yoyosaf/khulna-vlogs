export type Language = 'en' | 'bn';

export type PageRoute =
  | 'home'
  | 'explore'
  | 'food'
  | 'travel'
  | 'lifestyle'
  | 'directory'
  | 'events'
  | 'gallery'
  | 'about'
  | 'contact'
  | 'article'
  | 'admin';

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  role: 'admin' | 'viewer' | string;
  createdAt: string;
}

export interface Category {
  id: number;
  slug: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  section: string;
  sortOrder: number;
}

export interface Article {
  id: number;
  slug: string;
  titleEn: string;
  titleBn: string;
  excerptEn: string;
  excerptBn: string;
  contentEn: string;
  contentBn: string;
  categorySlug: string;
  featuredImage: string;
  imageAltEn: string;
  imageAltBn: string;
  authorName: string;
  readTimeMinutes: number;
  status: 'published' | 'draft';
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string;
  updatedAt: string;
}

export interface Destination {
  id: number;
  slug: string;
  nameEn: string;
  nameBn: string;
  category: string;
  summaryEn: string;
  summaryBn: string;
  descriptionEn: string;
  descriptionBn: string;
  locationText: string;
  travelTipsEn: string | null;
  travelTipsBn: string | null;
  bestTimeEn: string | null;
  bestTimeBn: string | null;
  featuredImage: string;
  imageAlt: string;
  isFeatured: boolean;
  isHiddenGem: boolean;
  isSampleData: boolean;
  status: 'published' | 'draft';
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface Restaurant {
  id: number;
  slug: string;
  nameEn: string;
  nameBn: string;
  cuisineType: string;
  specialtyEn: string;
  specialtyBn: string;
  reviewEn: string;
  reviewBn: string;
  areaEn: string;
  areaBn: string;
  address: string | null;
  phone: string | null;
  priceRange: string | null;
  openingHours: string | null;
  featuredImage: string;
  imageAlt: string;
  isFeatured: boolean;
  isSampleData: boolean;
  status: 'published' | 'draft';
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface Business {
  id: number;
  slug: string;
  nameEn: string;
  nameBn: string;
  businessType: string;
  descriptionEn: string;
  descriptionBn: string;
  area: string;
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
  mapQuery: string | null;
  featuredImage: string;
  isFeatured: boolean;
  isSampleData: boolean;
  status: 'published' | 'draft';
}

export interface VideoItem {
  id: number;
  titleEn: string;
  titleBn: string;
  youtubeUrl: string;
  youtubeId: string;
  descriptionEn: string;
  descriptionBn: string;
  category: string;
  isFeatured: boolean;
  status: 'published' | 'draft';
  publishedAt: string;
}

export interface EventItem {
  id: number;
  slug: string;
  titleEn: string;
  titleBn: string;
  eventType: string;
  descriptionEn: string;
  descriptionBn: string;
  venueEn: string;
  venueBn: string;
  eventDate: string;
  dateLabelEn: string;
  dateLabelBn: string;
  featuredImage: string;
  isSampleData: boolean;
  status: 'published' | 'draft';
}

export interface GalleryItem {
  id: number;
  titleEn: string;
  titleBn: string;
  captionEn: string;
  captionBn: string;
  locationEn: string;
  locationBn: string;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  youtubeId: string | null;
  category: string;
  isFeatured: boolean;
  status: 'published' | 'draft';
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  language: string;
  createdAt: string;
}

export interface SiteSettings {
  id: number;
  siteName: string;
  taglineEn: string;
  taglineBn: string;
  heroHeadlineEn: string;
  heroHeadlineBn: string;
  heroSubtitleEn: string;
  heroSubtitleBn: string;
  facebookUrl: string;
  youtubeUrl: string;
  contactEmail: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  updatedAt: string;
}

export interface BootstrapPayload {
  categories: Category[];
  articles: Article[];
  destinations: Destination[];
  restaurants: Restaurant[];
  businesses: Business[];
  videos: VideoItem[];
  events: EventItem[];
  galleryItems: GalleryItem[];
  settings?: SiteSettings | null;
}

export type AdminSection =
  | 'dashboard'
  | 'articles'
  | 'categories'
  | 'destinations'
  | 'restaurants'
  | 'businesses'
  | 'events'
  | 'gallery'
  | 'videos'
  | 'messages'
  | 'settings';
