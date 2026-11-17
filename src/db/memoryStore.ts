import { FALLBACK_BOOTSTRAP_DATA } from '../data/fallbackData.ts';
import type {
  Article,
  Business,
  Category,
  ContactSubmission,
  Destination,
  EventItem,
  GalleryItem,
  NewsletterSubscriber,
  Restaurant,
  SiteSettings,
  UserProfile,
  VideoItem,
} from '../types.ts';

export interface MemoryMediaItem {
  id: number;
  filename: string;
  mimeType: string;
  dataBase64: string;
  uploadedBy: string;
}

export interface MemoryStore {
  categories: Category[];
  articles: Article[];
  destinations: Destination[];
  restaurants: Restaurant[];
  businesses: Business[];
  videos: VideoItem[];
  events: EventItem[];
  galleryItems: GalleryItem[];
  contacts: ContactSubmission[];
  subscribers: NewsletterSubscriber[];
  users: UserProfile[];
  mediaUploads: MemoryMediaItem[];
  settings: SiteSettings;
  nextId: number;
}

declare global {
  var _khulnaMemoryStore: MemoryStore | undefined;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function getMemoryStore(): MemoryStore {
  if (!global._khulnaMemoryStore) {
    const seed = clone(FALLBACK_BOOTSTRAP_DATA);
    global._khulnaMemoryStore = {
      categories: seed.categories,
      articles: seed.articles,
      destinations: seed.destinations,
      restaurants: seed.restaurants,
      businesses: seed.businesses,
      videos: seed.videos,
      events: seed.events,
      galleryItems: seed.galleryItems,
      contacts: [],
      subscribers: [],
      users: [],
      mediaUploads: [],
      settings: seed.settings || {
        id: 1,
        siteName: 'Khulna Vlogs',
        taglineEn: 'Explore • Travel • Discover Khulna',
        taglineBn: 'অন্বেষণ • ভ্রমণ • জানুন খুলনাকে',
        heroHeadlineEn: 'Discover the Beauty of Khulna',
        heroHeadlineBn: 'আবিষ্কার করুন খুলনার অপরূপ সৌন্দর্য',
        heroSubtitleEn: 'Explore the Places, People, Food and Stories of Khulna.',
        heroSubtitleBn: 'জানুন খুলনার স্থান, মানুষ, ঐতিহ্যবাহী খাবার এবং অজানা গল্প।',
        facebookUrl: 'https://www.facebook.com/thekhulnavlogs/',
        youtubeUrl: 'https://www.youtube.com/@khulnavlogs',
        contactEmail: '',
        defaultSeoTitle:
          'Khulna Vlogs – Explore, Travel & Discover Khulna, Bangladesh',
        defaultSeoDescription:
          'Discover the beauty of Khulna with Khulna Vlogs.',
        updatedAt: new Date().toISOString(),
      },
      nextId: 1000,
    };
  }
  return global._khulnaMemoryStore;
}

export function nextMemoryId(store: MemoryStore): number {
  store.nextId += 1;
  return store.nextId;
}

export function getOrCreateMemoryUser(
  uid: string,
  email: string,
  displayName: string | null,
  isAuthorizedAdmin: boolean
): UserProfile {
  const store = getMemoryStore();
  const existing = store.users.find((u) => u.uid === uid);
  if (existing) {
    if (isAuthorizedAdmin && existing.role !== 'admin') {
      existing.role = 'admin';
    }
    if (email) existing.email = email;
    if (displayName) existing.displayName = displayName;
    return existing;
  }

  const created: UserProfile = {
    id: nextMemoryId(store),
    uid,
    email,
    displayName: displayName || email.split('@')[0] || 'Admin',
    role: isAuthorizedAdmin ? 'admin' : 'viewer',
    createdAt: new Date().toISOString(),
  };
  store.users.push(created);
  return created;
}
