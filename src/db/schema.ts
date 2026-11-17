import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('viewer'), // 'admin' | 'viewer'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameBn: text('name_bn').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionBn: text('description_bn').notNull(),
  section: text('section').notNull().default('explore'), // 'explore' | 'food' | 'lifestyle' | 'business' | 'article'
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  titleEn: text('title_en').notNull(),
  titleBn: text('title_bn').notNull(),
  excerptEn: text('excerpt_en').notNull(),
  excerptBn: text('excerpt_bn').notNull(),
  contentEn: text('content_en').notNull(),
  contentBn: text('content_bn').notNull(),
  categorySlug: text('category_slug').notNull(),
  featuredImage: text('featured_image').notNull(),
  imageAltEn: text('image_alt_en').notNull(),
  imageAltBn: text('image_alt_bn').notNull(),
  authorName: text('author_name').notNull().default('Khulna Vlogs Editorial'),
  readTimeMinutes: integer('read_time_minutes').notNull().default(5),
  status: text('status').notNull().default('published'), // 'published' | 'draft'
  isFeatured: boolean('is_featured').notNull().default(false),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const destinations = pgTable('destinations', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameBn: text('name_bn').notNull(),
  category: text('category').notNull(), // 'attraction' | 'historical' | 'park' | 'river' | 'nature' | 'hidden_gem' | 'sundarbans' | 'bagerhat' | 'mongla'
  summaryEn: text('summary_en').notNull(),
  summaryBn: text('summary_bn').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionBn: text('description_bn').notNull(),
  locationText: text('location_text').notNull(),
  travelTipsEn: text('travel_tips_en'),
  travelTipsBn: text('travel_tips_bn'),
  bestTimeEn: text('best_time_en'),
  bestTimeBn: text('best_time_bn'),
  featuredImage: text('featured_image').notNull(),
  imageAlt: text('image_alt').notNull(),
  isFeatured: boolean('is_featured').notNull().default(false),
  isHiddenGem: boolean('is_hidden_gem').notNull().default(false),
  isSampleData: boolean('is_sample_data').notNull().default(true),
  status: text('status').notNull().default('published'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const restaurants = pgTable('restaurants', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameBn: text('name_bn').notNull(),
  cuisineType: text('cuisine_type').notNull(), // 'local' | 'street_food' | 'restaurant' | 'cafe' | 'sweets'
  specialtyEn: text('specialty_en').notNull(),
  specialtyBn: text('specialty_bn').notNull(),
  reviewEn: text('review_en').notNull(),
  reviewBn: text('review_bn').notNull(),
  areaEn: text('area_en').notNull(),
  areaBn: text('area_bn').notNull(),
  address: text('address'),
  phone: text('phone'),
  priceRange: text('price_range'),
  openingHours: text('opening_hours'),
  featuredImage: text('featured_image').notNull(),
  imageAlt: text('image_alt').notNull(),
  isFeatured: boolean('is_featured').notNull().default(false),
  isSampleData: boolean('is_sample_data').notNull().default(true),
  status: text('status').notNull().default('published'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const businesses = pgTable('businesses', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameBn: text('name_bn').notNull(),
  businessType: text('business_type').notNull(), // 'shop' | 'restaurant' | 'hotel' | 'service'
  descriptionEn: text('description_en').notNull(),
  descriptionBn: text('description_bn').notNull(),
  area: text('area').notNull(),
  address: text('address'),
  phone: text('phone'),
  websiteUrl: text('website_url'),
  mapQuery: text('map_query'),
  featuredImage: text('featured_image').notNull(),
  isFeatured: boolean('is_featured').notNull().default(false),
  isSampleData: boolean('is_sample_data').notNull().default(true),
  status: text('status').notNull().default('published'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  titleEn: text('title_en').notNull(),
  titleBn: text('title_bn').notNull(),
  youtubeUrl: text('youtube_url').notNull(),
  youtubeId: text('youtube_id').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionBn: text('description_bn').notNull(),
  category: text('category').notNull().default('Travel Vlog'),
  isFeatured: boolean('is_featured').notNull().default(false),
  status: text('status').notNull().default('published'),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  titleEn: text('title_en').notNull(),
  titleBn: text('title_bn').notNull(),
  eventType: text('event_type').notNull(), // 'festival' | 'cultural' | 'fair' | 'exhibition'
  descriptionEn: text('description_en').notNull(),
  descriptionBn: text('description_bn').notNull(),
  venueEn: text('venue_en').notNull(),
  venueBn: text('venue_bn').notNull(),
  eventDate: text('event_date').notNull(),
  dateLabelEn: text('date_label_en').notNull(),
  dateLabelBn: text('date_label_bn').notNull(),
  featuredImage: text('featured_image').notNull(),
  isSampleData: boolean('is_sample_data').notNull().default(true),
  status: text('status').notNull().default('published'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const galleryItems = pgTable('gallery_items', {
  id: serial('id').primaryKey(),
  titleEn: text('title_en').notNull(),
  titleBn: text('title_bn').notNull(),
  captionEn: text('caption_en').notNull(),
  captionBn: text('caption_bn').notNull(),
  locationEn: text('location_en').notNull(),
  locationBn: text('location_bn').notNull(),
  mediaType: text('media_type').notNull().default('photo'), // 'photo' | 'video'
  mediaUrl: text('media_url').notNull(),
  youtubeId: text('youtube_id'),
  category: text('category').notNull().default('Khulna'),
  isFeatured: boolean('is_featured').notNull().default(false),
  status: text('status').notNull().default('published'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contactSubmissions = pgTable('contact_submissions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('unread'), // 'unread' | 'read' | 'replied'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  language: text('language').notNull().default('en'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const mediaUploads = pgTable('media_uploads', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  dataBase64: text('data_base64').notNull(),
  uploadedBy: text('uploaded_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  siteName: text('site_name').notNull().default('Khulna Vlogs'),
  taglineEn: text('tagline_en').notNull().default('Explore • Travel • Discover Khulna'),
  taglineBn: text('tagline_bn').notNull().default('অন্বেষণ • ভ্রমণ • জানুন খুলনাকে'),
  heroHeadlineEn: text('hero_headline_en').notNull().default('Discover the Beauty of Khulna'),
  heroHeadlineBn: text('hero_headline_bn').notNull().default('আবিষ্কার করুন খুলনার অপরূপ সৌন্দর্য'),
  heroSubtitleEn: text('hero_subtitle_en').notNull().default('Explore the Places, People, Food and Stories of Khulna.'),
  heroSubtitleBn: text('hero_subtitle_bn').notNull().default('জানুন খুলনার স্থান, মানুষ, ঐতিহ্যবাহী খাবার এবং অজানা গল্প।'),
  facebookUrl: text('facebook_url').notNull().default('https://www.facebook.com/thekhulnavlogs/'),
  youtubeUrl: text('youtube_url').notNull().default('https://www.youtube.com/@khulnavlogs'),
  contactEmail: text('contact_email').notNull().default(''),
  defaultSeoTitle: text('default_seo_title').notNull().default('Khulna Vlogs – Explore, Travel & Discover Khulna, Bangladesh'),
  defaultSeoDescription: text('default_seo_description').notNull().default('Discover the beauty of Khulna with Khulna Vlogs. Explore Rupsha River, Sundarbans travel guides, Bagerhat heritage, Chui Jhal cuisine, local businesses, and stories.'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
