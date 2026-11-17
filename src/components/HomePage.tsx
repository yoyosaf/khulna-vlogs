import { useState } from 'react';
import {
  ArrowRight,
  Compass,
  ExternalLink,
  MapPin,
  Play,
  Search,
  Utensils,
  X,
} from 'lucide-react';
import {
  Article,
  BootstrapPayload,
  Business,
  Destination,
  EventItem,
  Language,
  PageRoute,
  Restaurant,
  VideoItem,
} from '../types';
import { FACEBOOK_URL, YOUTUBE_URL, copy } from '../i18n/translations';
import { ResilientImage } from './ResilientImage';
import { SeoHead } from './SeoHead';

interface HomePageProps {
  data: BootstrapPayload;
  lang: Language;
  onNavigate: (page: PageRoute, slug?: string) => void;
}

interface SearchResultState {
  articles: Article[];
  destinations: Destination[];
  restaurants: Restaurant[];
  businesses: Business[];
  events: EventItem[];
}

export function HomePage({ data, lang, onNavigate }: HomePageProps) {
  const t = copy[lang];
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultState | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error' | 'unavailable'
  >('idle');

  const runClientSearch = (needle: string): SearchResultState => {
    const q = needle.toLowerCase();
    const includes = (val?: string | null) =>
      Boolean(val && val.toLowerCase().includes(q));
    return {
      articles: data.articles.filter(
        (a) =>
          includes(a.titleEn) ||
          includes(a.titleBn) ||
          includes(a.excerptEn) ||
          includes(a.excerptBn)
      ),
      destinations: data.destinations.filter(
        (d) =>
          includes(d.nameEn) ||
          includes(d.nameBn) ||
          includes(d.summaryEn) ||
          includes(d.summaryBn) ||
          includes(d.locationText)
      ),
      restaurants: data.restaurants.filter(
        (r) =>
          includes(r.nameEn) ||
          includes(r.nameBn) ||
          includes(r.specialtyEn) ||
          includes(r.specialtyBn) ||
          includes(r.areaEn)
      ),
      businesses: data.businesses.filter(
        (b) =>
          includes(b.nameEn) ||
          includes(b.nameBn) ||
          includes(b.descriptionEn) ||
          includes(b.area)
      ),
      events: data.events.filter(
        (ev) =>
          includes(ev.titleEn) ||
          includes(ev.titleBn) ||
          includes(ev.venueEn) ||
          includes(ev.descriptionEn)
      ),
    };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/public/search?q=${encodeURIComponent(trimmed)}`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        setSearchResults(json);
      } else {
        setSearchResults(runClientSearch(trimmed));
      }
    } catch {
      setSearchResults(runClientSearch(trimmed));
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults(null);
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus('saving');
    try {
      const res = await fetch('/api/public/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail.trim(), language: lang }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.status === 404 || res.status === 405 || !contentType.includes('application/json')) {
        setNewsletterStatus('unavailable');
        return;
      }
      if (res.ok) {
        setNewsletterStatus('saved');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
      }
    } catch {
      setNewsletterStatus('unavailable');
    }
  };

  const featuredDestinations = data.destinations.filter((d) => !d.isHiddenGem).slice(0, 3);
  const hiddenGems = data.destinations.filter((d) => d.isHiddenGem).slice(0, 3);
  const featuredRestaurants = data.restaurants.slice(0, 3);
  const leadStory = data.articles[0];
  const secondaryStories = data.articles.slice(1, 4);
  const featuredVideos = data.videos.slice(0, 3);
  const featuredBusinesses = data.businesses.slice(0, 3);

  const totalResultsCount = searchResults
    ? searchResults.articles.length +
      searchResults.destinations.length +
      searchResults.restaurants.length +
      searchResults.businesses.length +
      searchResults.events.length
    : 0;

  const settings = data.settings;
  const heroHeadline =
    lang === 'bn'
      ? settings?.heroHeadlineBn || t.hero.headline
      : settings?.heroHeadlineEn || t.hero.headline;
  const heroSubtitle =
    lang === 'bn'
      ? settings?.heroSubtitleBn || t.hero.subtitle
      : settings?.heroSubtitleEn || t.hero.subtitle;
  const facebookLink = settings?.facebookUrl || FACEBOOK_URL;
  const youtubeLink = settings?.youtubeUrl || YOUTUBE_URL;

  return (
    <div>
      <SeoHead
        title={
          settings?.defaultSeoTitle ||
          'Khulna Vlogs – Explore, Travel & Discover Khulna, Bangladesh'
        }
        description={
          settings?.defaultSeoDescription ||
          'Discover the beauty of Khulna with Khulna Vlogs. Explore Rupsha River, Sundarbans travel guides, Bagerhat heritage, Chui Jhal cuisine, local businesses, and stories.'
        }
        canonicalPath="/"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: settings?.siteName || 'Khulna Vlogs',
          alternateName: 'খুলনা ভ্লগস',
          description:
            'Explore the Places, People, Food and Stories of Khulna, Bangladesh.',
          url: window.location.origin,
        }}
      />

      {/* 1. Full-Width Khulna Hero */}
      <section className="relative overflow-hidden bg-[#102C40]">
        <div className="absolute inset-0">
          <ResilientImage
            src="/src/assets/images/hero_khulna_rupsha_1794914379194.jpg"
            alt="Golden hour view of Khan Jahan Ali Bridge over the Rupsha River in Khulna, Bangladesh"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#102C40]/92 via-[#102C40]/72 to-[#102C40]/35"
            aria-hidden="true"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#F5C542] mb-4">
              {t.hero.kicker}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] text-balance mb-5">
              {heroHeadline}
            </h1>
            <p className="text-lg sm:text-xl text-white/95 font-medium leading-relaxed mb-3">
              {heroSubtitle}
            </p>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl mb-8">
              {t.hero.welcome}
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2.5 max-w-2xl bg-white p-2 rounded-xl border border-white/20 shadow-lg"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3">
                <Search className="w-5 h-5 text-[#102C40]/50 shrink-0" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.hero.searchPlaceholder}
                  aria-label={t.hero.searchPlaceholder}
                  className="w-full py-2 text-sm text-[#102C40] placeholder:text-[#102C40]/50 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                {searchResults && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="px-3 py-2.5 text-xs font-medium text-[#102C40]/70 hover:text-[#102C40] rounded-lg"
                  >
                    {t.hero.clearSearch}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={searching}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-[#102C40] bg-[#F5C542] hover:bg-[#e5b535] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  {searching ? '...' : t.hero.searchButton}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Live Search Results Panel */}
      {searchResults && (
        <section className="bg-white border-b border-[#E7E2D8] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="font-display text-2xl font-bold text-[#102C40]">
                {lang === 'bn' ? 'অনুসন্ধানের ফলাফল' : 'Search Results'} ({totalResultsCount})
              </h2>
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#102C40]/70 hover:text-[#102C40]"
              >
                <X className="w-4 h-4" />
                <span>{t.common.close}</span>
              </button>
            </div>

            {totalResultsCount === 0 ? (
              <p className="text-sm text-[#102C40]/70">{t.common.noResults}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResults.destinations.map((d) => (
                  <button
                    key={`dest-${d.id}`}
                    type="button"
                    onClick={() => onNavigate('explore')}
                    className="text-left p-4 rounded-xl border border-[#E7E2D8] hover:border-[#39A9DB] bg-[#FBF9F5] transition-colors"
                  >
                    <p className="text-xs text-[#268B55] font-medium mb-1">
                      {t.nav.explore} · {d.locationText}
                    </p>
                    <p className="font-display font-bold text-[#102C40]">
                      {lang === 'bn' ? d.nameBn : d.nameEn}
                    </p>
                  </button>
                ))}
                {searchResults.restaurants.map((r) => (
                  <button
                    key={`rest-${r.id}`}
                    type="button"
                    onClick={() => onNavigate('food')}
                    className="text-left p-4 rounded-xl border border-[#E7E2D8] hover:border-[#39A9DB] bg-[#FBF9F5] transition-colors"
                  >
                    <p className="text-xs text-[#102C40]/65 font-medium mb-1">
                      {t.nav.food} · {lang === 'bn' ? r.areaBn : r.areaEn}
                    </p>
                    <p className="font-display font-bold text-[#102C40]">
                      {lang === 'bn' ? r.nameBn : r.nameEn}
                    </p>
                  </button>
                ))}
                {searchResults.articles.map((a) => (
                  <button
                    key={`art-${a.id}`}
                    type="button"
                    onClick={() => onNavigate('article', a.slug)}
                    className="text-left p-4 rounded-xl border border-[#E7E2D8] hover:border-[#39A9DB] bg-[#FBF9F5] transition-colors"
                  >
                    <p className="text-xs text-[#39A9DB] font-medium mb-1">
                      {t.nav.stories} · {a.readTimeMinutes} {t.common.minRead}
                    </p>
                    <p className="font-display font-bold text-[#102C40]">
                      {lang === 'bn' ? a.titleBn : a.titleEn}
                    </p>
                  </button>
                ))}
                {searchResults.businesses.map((b) => (
                  <button
                    key={`biz-${b.id}`}
                    type="button"
                    onClick={() => onNavigate('directory')}
                    className="text-left p-4 rounded-xl border border-[#E7E2D8] hover:border-[#39A9DB] bg-[#FBF9F5] transition-colors"
                  >
                    <p className="text-xs text-[#102C40]/65 font-medium mb-1">
                      {t.nav.directory} · {b.area}
                    </p>
                    <p className="font-display font-bold text-[#102C40]">
                      {lang === 'bn' ? b.nameBn : b.nameEn}
                    </p>
                  </button>
                ))}
                {searchResults.events.map((ev) => (
                  <button
                    key={`evt-${ev.id}`}
                    type="button"
                    onClick={() => onNavigate('events')}
                    className="text-left p-4 rounded-xl border border-[#E7E2D8] hover:border-[#39A9DB] bg-[#FBF9F5] transition-colors"
                  >
                    <p className="text-xs text-[#268B55] font-medium mb-1">
                      {t.nav.events} · {lang === 'bn' ? ev.dateLabelBn : ev.dateLabelEn}
                    </p>
                    <p className="font-display font-bold text-[#102C40]">
                      {lang === 'bn' ? ev.titleBn : ev.titleEn}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Explore Categories */}
      <section className="py-14 sm:py-16 bg-[#FBF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102C40]">
                {t.sections.categoriesTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#102C40]/70 mt-1.5">
                {t.sections.categoriesSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#102C40] hover:text-[#39A9DB] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{t.common.viewAll}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.categories.map((cat, idx) => {
              const targetPage: PageRoute =
                cat.section === 'food'
                  ? 'food'
                  : cat.section === 'lifestyle'
                  ? 'lifestyle'
                  : 'explore';
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onNavigate(targetPage)}
                  className="text-left group p-6 bg-white border border-[#E7E2D8] rounded-xl hover:border-[#39A9DB] transition-colors"
                >
                  <p className="text-xs font-mono-num text-[#102C40]/50 mb-2">
                    0{idx + 1}. {cat.section === 'food' ? t.nav.food : cat.section === 'lifestyle' ? t.nav.lifestyle : t.nav.explore}
                  </p>
                  <h3 className="font-display text-xl font-bold text-[#102C40] group-hover:text-[#39A9DB] transition-colors mb-2">
                    {lang === 'bn' ? cat.nameBn : cat.nameEn}
                  </h3>
                  <p className="text-sm text-[#102C40]/70 leading-relaxed">
                    {lang === 'bn' ? cat.descriptionBn : cat.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Featured Destinations */}
      <section className="py-14 sm:py-16 bg-white border-t border-[#E7E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102C40]">
                {t.sections.destinationsTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#102C40]/70 mt-1.5">
                {t.sections.destinationsSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#102C40] hover:text-[#39A9DB] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{t.common.viewAll}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDestinations.map((dest) => (
              <div
                key={dest.id}
                className="group bg-[#FBF9F5] border border-[#E7E2D8] rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <ResilientImage
                    src={dest.featuredImage}
                    alt={dest.imageAlt}
                    fallbackTitle={lang === 'bn' ? dest.nameBn : dest.nameEn}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#102C40]/60 mb-2">
                      {dest.locationText}
                      {dest.bestTimeEn && (
                        <>
                          {' · '}
                          {lang === 'bn' ? dest.bestTimeBn : dest.bestTimeEn}
                        </>
                      )}
                    </p>
                    <h3 className="font-display text-xl font-bold text-[#102C40] mb-2.5">
                      {lang === 'bn' ? dest.nameBn : dest.nameEn}
                    </h3>
                    <p className="text-sm text-[#102C40]/75 leading-relaxed mb-4">
                      {lang === 'bn' ? dest.summaryBn : dest.summaryEn}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('explore')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#102C40] hover:text-[#39A9DB] transition-colors"
                  >
                    <Compass className="w-4 h-4 text-[#268B55]" />
                    <span>{t.common.readMore}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Popular Food & Restaurants */}
      <section className="py-14 sm:py-16 bg-[#FBF9F5] border-t border-[#E7E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102C40]">
                {t.sections.foodTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#102C40]/70 mt-1.5 max-w-2xl">
                {t.sections.foodSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('food')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#102C40] hover:text-[#39A9DB] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{t.common.viewAll}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredRestaurants.map((rest) => (
              <div
                key={rest.id}
                className="bg-white border border-[#E7E2D8] rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <ResilientImage
                    src={rest.featuredImage}
                    alt={rest.imageAlt}
                    fallbackTitle={lang === 'bn' ? rest.nameBn : rest.nameEn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#102C40]/60 mb-2">
                      {lang === 'bn' ? rest.areaBn : rest.areaEn}
                      {rest.isSampleData && ` · ${t.common.sampleBadge}`}
                    </p>
                    <h3 className="font-display text-xl font-bold text-[#102C40] mb-2">
                      {lang === 'bn' ? rest.nameBn : rest.nameEn}
                    </h3>
                    <p className="text-sm font-medium text-[#268B55] mb-2">
                      {lang === 'bn' ? rest.specialtyBn : rest.specialtyEn}
                    </p>
                    <p className="text-sm text-[#102C40]/75 leading-relaxed mb-4">
                      {lang === 'bn' ? rest.reviewBn : rest.reviewEn}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('food')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#102C40] hover:text-[#39A9DB] transition-colors"
                  >
                    <Utensils className="w-4 h-4 text-[#F5C542]" />
                    <span>{t.common.readMore}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Latest Khulna Stories (Editorial 3-Tier Lead + Stack) */}
      <section className="py-14 sm:py-16 bg-white border-t border-[#E7E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102C40]">
                {t.sections.storiesTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#102C40]/70 mt-1.5">
                {t.sections.storiesSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('lifestyle')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#102C40] hover:text-[#39A9DB] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{t.common.viewAll}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {leadStory && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('article', leadStory.slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="lg:col-span-7 text-left group bg-[#FBF9F5] border border-[#E7E2D8] rounded-xl overflow-hidden flex flex-col hover:border-[#39A9DB] transition-colors"
              >
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <ResilientImage
                    src={leadStory.featuredImage}
                    alt={lang === 'bn' ? leadStory.imageAltBn : leadStory.imageAltEn}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#102C40]/60 mb-2">
                      {leadStory.categorySlug.replace(/-/g, ' ')} · {leadStory.authorName} ·{' '}
                      <span className="font-mono-num">
                        {leadStory.readTimeMinutes} {t.common.minRead}
                      </span>
                    </p>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#102C40] group-hover:text-[#39A9DB] transition-colors mb-3">
                      {lang === 'bn' ? leadStory.titleBn : leadStory.titleEn}
                    </h3>
                    <p className="text-sm sm:text-base text-[#102C40]/75 leading-relaxed">
                      {lang === 'bn' ? leadStory.excerptBn : leadStory.excerptEn}
                    </p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#102C40]">
                    {t.common.readMore}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </button>
            )}

            <div className="lg:col-span-5 flex flex-col divide-y divide-[#E7E2D8] border border-[#E7E2D8] rounded-xl bg-white">
              {secondaryStories.map((story) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => {
                    onNavigate('article', story.slug);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left group p-6 flex-1 flex gap-4 items-start hover:bg-[#FBF9F5] transition-colors"
                >
                  <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0 border border-[#E7E2D8]">
                    <ResilientImage
                      src={story.featuredImage}
                      alt={lang === 'bn' ? story.imageAltBn : story.imageAltEn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#102C40]/60 mb-1">
                      {story.categorySlug.replace(/-/g, ' ')} ·{' '}
                      <span className="font-mono-num">
                        {story.readTimeMinutes} {t.common.minRead}
                      </span>
                    </p>
                    <h3 className="font-display text-lg font-bold text-[#102C40] group-hover:text-[#39A9DB] transition-colors leading-snug mb-1.5">
                      {lang === 'bn' ? story.titleBn : story.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#102C40]/70 line-clamp-2">
                      {lang === 'bn' ? story.excerptBn : story.excerptEn}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. YouTube Video Section */}
      <section className="py-14 sm:py-16 bg-[#102C40] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {t.sections.videosTitle}
              </h2>
              <p className="text-sm sm:text-base text-white/75 mt-1.5">
                {t.sections.videosSubtitle}
              </p>
            </div>
            <a
              href={youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F5C542] hover:underline whitespace-nowrap shrink-0"
            >
              <span>{t.common.visitYoutube}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredVideos.map((vid, idx) => {
              const fallbackCovers = [
                '/src/assets/images/hero_khulna_rupsha_1794914379194.jpg',
                '/src/assets/images/dest_sundarbans_mangrove_1794914379796.jpg',
                '/src/assets/images/food_khulna_chui_jhal_1794914380590.jpg',
              ];
              const cover = vid.youtubeId
                ? `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`
                : fallbackCovers[idx % fallbackCovers.length];

              return (
                <div
                  key={vid.id}
                  className="bg-[#163852] border border-white/10 rounded-xl overflow-hidden flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => setActiveVideo(vid)}
                    className="relative aspect-[16/9] w-full overflow-hidden group text-left"
                  >
                    <ResilientImage
                      src={cover}
                      alt={lang === 'bn' ? vid.titleBn : vid.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-[#F5C542] text-[#102C40] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </span>
                    </div>
                  </button>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-[#39A9DB] font-medium mb-1.5">
                        {vid.category}
                      </p>
                      <h3 className="font-display text-lg font-bold text-white mb-2">
                        {lang === 'bn' ? vid.titleBn : vid.titleEn}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                        {lang === 'bn' ? vid.descriptionBn : vid.descriptionEn}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Hidden Gems & 8. Local Business Directory Preview */}
      <section className="py-14 sm:py-16 bg-[#FBF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Hidden Gems */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102C40]">
                  {t.sections.hiddenGemsTitle}
                </h2>
                <p className="text-sm sm:text-base text-[#102C40]/70 mt-1.5">
                  {t.sections.hiddenGemsSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('explore')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#102C40] hover:text-[#39A9DB]"
              >
                <span>{t.common.viewAll}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hiddenGems.map((gem) => (
                <button
                  key={gem.id}
                  type="button"
                  onClick={() => onNavigate('explore')}
                  className="text-left group bg-white border border-[#E7E2D8] rounded-xl p-6 hover:border-[#268B55] transition-colors"
                >
                  <p className="text-xs text-[#268B55] font-medium mb-2">
                    {gem.locationText}
                  </p>
                  <h3 className="font-display text-xl font-bold text-[#102C40] group-hover:text-[#268B55] transition-colors mb-2">
                    {lang === 'bn' ? gem.nameBn : gem.nameEn}
                  </h3>
                  <p className="text-sm text-[#102C40]/75 leading-relaxed">
                    {lang === 'bn' ? gem.summaryBn : gem.summaryEn}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Local Business Directory Preview */}
          <div className="pt-12 border-t border-[#E7E2D8]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102C40]">
                  {t.sections.businessTitle}
                </h2>
                <p className="text-sm sm:text-base text-[#102C40]/70 mt-1.5">
                  {t.sections.businessSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('directory')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#102C40] hover:text-[#39A9DB]"
              >
                <span>{t.common.viewAll}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredBusinesses.map((biz) => (
                <div
                  key={biz.id}
                  className="bg-white border border-[#E7E2D8] rounded-xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs text-[#102C40]/60 mb-2 capitalize">
                      {biz.businessType} · {biz.area}
                      {biz.isSampleData && ` · ${t.common.sampleBadge}`}
                    </p>
                    <h3 className="font-display text-lg font-bold text-[#102C40] mb-2">
                      {lang === 'bn' ? biz.nameBn : biz.nameEn}
                    </h3>
                    <p className="text-sm text-[#102C40]/75 leading-relaxed mb-4">
                      {lang === 'bn' ? biz.descriptionBn : biz.descriptionEn}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('directory')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#39A9DB] hover:text-[#102C40]"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t.common.readMore}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. Facebook & YouTube Follow + Newsletter Subscription */}
      <section className="py-14 sm:py-16 bg-white border-t border-[#E7E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Social Hub */}
          <div className="bg-[#FBF9F5] border border-[#E7E2D8] rounded-xl p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-[#39A9DB] mb-2">
                @thekhulnavlogs
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102C40] mb-3">
                {t.sections.socialTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#102C40]/75 leading-relaxed mb-6">
                {t.sections.socialSubtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#102C40] hover:bg-[#193F5B] rounded-lg transition-colors"
              >
                <span>{t.common.followFacebook}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#102C40] bg-[#F5C542] hover:bg-[#e5b535] rounded-lg transition-colors"
              >
                <span>{t.common.visitYoutube}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-[#FBF9F5] border border-[#E7E2D8] rounded-xl p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-[#268B55] mb-2">
                Khulna Vlogs Dispatch
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102C40] mb-3">
                {t.sections.newsletterTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#102C40]/75 leading-relaxed mb-6">
                {t.sections.newsletterSubtitle}
              </p>
            </div>

            <form onSubmit={handleNewsletter} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={t.sections.newsletterPlaceholder}
                  aria-label={t.sections.newsletterPlaceholder}
                  className="flex-1 px-4 py-2.5 text-sm bg-white border border-[#E7E2D8] rounded-lg text-[#102C40] focus:outline-none focus:border-[#39A9DB]"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'saving'}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#268B55] hover:bg-[#1f7446] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  {t.sections.newsletterCta}
                </button>
              </div>
              {newsletterStatus === 'saved' && (
                <p className="text-xs font-medium text-[#268B55]">
                  {t.sections.newsletterSuccess}
                </p>
              )}
              {newsletterStatus === 'error' && (
                <p className="text-xs font-medium text-red-700">
                  Unable to subscribe right now. Please verify your email address.
                </p>
              )}
              {newsletterStatus === 'unavailable' && (
                <p className="text-xs font-medium text-[#102C40]/75">
                  Newsletter storage requires the full-stack backend server. Follow @thekhulnavlogs on Facebook or YouTube for updates.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Video Player Modal */}
      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div className="bg-[#102C40] text-white rounded-xl max-w-3xl w-full overflow-hidden border border-white/15">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="font-display text-lg font-bold truncate pr-4">
                {lang === 'bn' ? activeVideo.titleBn : activeVideo.titleEn}
              </h3>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                aria-label={t.common.close}
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {activeVideo.youtubeId ? (
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                  title={activeVideo.titleEn}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-8 text-center space-y-4">
                <p className="text-sm text-white/80 max-w-lg mx-auto">
                  {lang === 'bn' ? activeVideo.descriptionBn : activeVideo.descriptionEn}
                </p>
                <a
                  href={activeVideo.youtubeUrl || YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#102C40] bg-[#F5C542] rounded-lg"
                >
                  <span>{t.common.visitYoutube}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
