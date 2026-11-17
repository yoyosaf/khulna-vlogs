import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  ExternalLink,
  MapPin,
  Send,
  X,
} from 'lucide-react';
import {
  BootstrapPayload,
  Destination,
  GalleryItem,
  Language,
  PageRoute,
  Restaurant,
} from '../types';
import { BRAND_LOGO_URL, FACEBOOK_URL, YOUTUBE_URL, copy } from '../i18n/translations';
import { ResilientImage } from './ResilientImage';
import { SeoHead } from './SeoHead';

interface DirectoryPagesProps {
  page: Exclude<PageRoute, 'home' | 'article' | 'admin'>;
  data: BootstrapPayload;
  lang: Language;
  onNavigate: (page: PageRoute, slug?: string) => void;
}

export function DirectoryPages({
  page,
  data,
  lang,
  onNavigate,
}: DirectoryPagesProps) {
  const t = copy[lang];
  const [destFilter, setDestFilter] = useState<string>('all');
  const [foodFilter, setFoodFilter] = useState<string>('all');
  const [bizFilter, setBizFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [galleryFilter, setGalleryFilter] = useState<string>('all');
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [selectedRest, setSelectedRest] = useState<Restaurant | null>(null);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [contactState, setContactState] = useState<
    'idle' | 'sending' | 'sent' | 'error' | 'unavailable'
  >('idle');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDest(null);
        setSelectedRest(null);
        setLightboxItem(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactState('sending');
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.status === 404 || res.status === 405 || !contentType.includes('application/json')) {
        setContactState('unavailable');
        return;
      }
      if (res.ok) {
        setContactState('sent');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setContactState('error');
      }
    } catch {
      setContactState('unavailable');
    }
  };

  if (page === 'explore') {
    const categories = [
      { key: 'all', label: lang === 'bn' ? 'সকল স্থান' : 'All Places' },
      { key: 'river', label: lang === 'bn' ? 'নদী ও সেতু' : 'Rivers & Bridges' },
      { key: 'sundarbans', label: lang === 'bn' ? 'সুন্দরবন' : 'Sundarbans' },
      { key: 'bagerhat', label: lang === 'bn' ? 'বাগেরহাট' : 'Bagerhat' },
      { key: 'historical', label: lang === 'bn' ? 'ঐতিহাসিক' : 'Historical' },
      { key: 'park', label: lang === 'bn' ? 'পার্ক ও ক্যাম্পাস' : 'Parks & Campus' },
      { key: 'hidden_gem', label: lang === 'bn' ? 'অজানা সৌন্দর্য' : 'Hidden Gems' },
    ];
    const items =
      destFilter === 'all'
        ? data.destinations
        : destFilter === 'hidden_gem'
        ? data.destinations.filter((d) => d.isHiddenGem || d.category === 'hidden_gem')
        : data.destinations.filter((d) => d.category === destFilter);

    return (
      <section className="py-12 sm:py-16 bg-[#FBF9F5]">
        <SeoHead
          title="Explore Khulna – Tourist Attractions, Rivers & Hidden Gems | Khulna Vlogs"
          description="Explore Khulna tourist places, Rupsha Bridge, Sundarbans gateways, Shat Gambuj Mosque Bagerhat, parks, and hidden gems."
          canonicalPath="/explore"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <p className="text-xs font-semibold text-[#268B55] mb-2">
              {t.tagline}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#102C40] mb-3">
              {t.nav.explore}
            </h1>
            <p className="text-base text-[#102C40]/75">
              {t.sections.destinationsSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border border-[#E7E2D8] rounded-xl mb-10 w-fit">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setDestFilter(c.key)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  destFilter === c.key
                    ? 'bg-[#102C40] text-white'
                    : 'text-[#102C40]/70 hover:text-[#102C40]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((dest) => (
              <div
                key={dest.id}
                className="bg-white border border-[#E7E2D8] rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <ResilientImage
                    src={dest.featuredImage}
                    alt={dest.imageAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#102C40]/60 mb-2">
                      {dest.locationText}
                      {dest.isHiddenGem && ' · Hidden Gem'}
                      {dest.isSampleData && ` · ${t.common.sampleBadge}`}
                    </p>
                    <h2 className="font-display text-xl font-bold text-[#102C40] mb-2">
                      {lang === 'bn' ? dest.nameBn : dest.nameEn}
                    </h2>
                    <p className="text-sm text-[#102C40]/75 leading-relaxed mb-4">
                      {lang === 'bn' ? dest.summaryBn : dest.summaryEn}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDest(dest)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#102C40] hover:text-[#39A9DB]"
                  >
                    <span>{t.common.readMore}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedDest && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E7E2D8]">
              <div className="aspect-[16/9] w-full relative">
                <ResilientImage
                  src={selectedDest.featuredImage}
                  alt={selectedDest.imageAlt}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDest(null)}
                  className="absolute top-3 right-3 p-2 bg-white/95 rounded-full text-[#102C40]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 sm:p-8 space-y-4">
                <p className="text-xs text-[#268B55] font-semibold">
                  {selectedDest.locationText}
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#102C40]">
                  {lang === 'bn' ? selectedDest.nameBn : selectedDest.nameEn}
                </h3>
                <p className="text-sm sm:text-base text-[#102C40]/85 leading-relaxed">
                  {lang === 'bn' ? selectedDest.descriptionBn : selectedDest.descriptionEn}
                </p>
                {(selectedDest.bestTimeEn || selectedDest.travelTipsEn) && (
                  <div className="pt-4 border-t border-[#E7E2D8] space-y-2 text-sm text-[#102C40]/80">
                    {selectedDest.bestTimeEn && (
                      <p>
                        <strong>{t.common.bestTime}:</strong>{' '}
                        {lang === 'bn' ? selectedDest.bestTimeBn : selectedDest.bestTimeEn}
                      </p>
                    )}
                    {selectedDest.travelTipsEn && (
                      <p>
                        <strong>{t.common.travelTips}:</strong>{' '}
                        {lang === 'bn' ? selectedDest.travelTipsBn : selectedDest.travelTipsEn}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  if (page === 'food') {
    const types = [
      { key: 'all', label: lang === 'bn' ? 'সকল খাবার' : 'All Dining' },
      { key: 'local', label: lang === 'bn' ? 'স্থানীয় ঐতিহ্য' : 'Local Cuisine' },
      { key: 'restaurant', label: lang === 'bn' ? 'রেস্তোরাঁ' : 'Restaurants' },
      { key: 'street_food', label: lang === 'bn' ? 'স্ট্রিট ফুড' : 'Street Food' },
      { key: 'sweets', label: lang === 'bn' ? 'মিষ্টান্ন' : 'Sweets' },
    ];
    const items =
      foodFilter === 'all'
        ? data.restaurants
        : data.restaurants.filter((r) => r.cuisineType === foodFilter);

    return (
      <section className="py-12 sm:py-16 bg-[#FBF9F5]">
        <SeoHead
          title="Khulna Food & Restaurants – Chui Jhal & Local Cuisine | Khulna Vlogs"
          description="Explore Khulna’s signature Chui Jhal dishes, river fish dining, street food, and sweets. Verified local guide."
          canonicalPath="/food"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-6">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#102C40] mb-3">
              {t.nav.food}
            </h1>
            <p className="text-base text-[#102C40]/75 mb-3">
              {t.sections.foodSubtitle}
            </p>
            <p className="text-xs text-[#102C40]/65">
              {t.common.verifiedOnlyNote}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border border-[#E7E2D8] rounded-xl mb-10 w-fit">
            {types.map((tp) => (
              <button
                key={tp.key}
                type="button"
                onClick={() => setFoodFilter(tp.key)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  foodFilter === tp.key
                    ? 'bg-[#102C40] text-white'
                    : 'text-[#102C40]/70 hover:text-[#102C40]'
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((rest) => (
              <div
                key={rest.id}
                className="bg-white border border-[#E7E2D8] rounded-xl overflow-hidden flex flex-col sm:flex-row"
              >
                <div className="sm:w-48 aspect-[4/3] sm:aspect-auto shrink-0">
                  <ResilientImage
                    src={rest.featuredImage}
                    alt={rest.imageAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#102C40]/60 mb-1.5">
                      {lang === 'bn' ? rest.areaBn : rest.areaEn}
                      {rest.isSampleData && ` · ${t.common.sampleBadge}`}
                    </p>
                    <h2 className="font-display text-xl font-bold text-[#102C40] mb-1.5">
                      {lang === 'bn' ? rest.nameBn : rest.nameEn}
                    </h2>
                    <p className="text-xs font-semibold text-[#268B55] mb-2">
                      {lang === 'bn' ? rest.specialtyBn : rest.specialtyEn}
                    </p>
                    <p className="text-sm text-[#102C40]/75 leading-relaxed mb-3">
                      {lang === 'bn' ? rest.reviewBn : rest.reviewEn}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRest(rest)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#102C40] hover:text-[#39A9DB]"
                  >
                    <span>{t.common.readMore}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedRest && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-8 border border-[#E7E2D8] space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-[#102C40]/60 mb-1">
                    {lang === 'bn' ? selectedRest.areaBn : selectedRest.areaEn}
                    {selectedRest.isSampleData && ` · ${t.common.sampleBadge}`}
                  </p>
                  <h3 className="font-display text-2xl font-bold text-[#102C40]">
                    {lang === 'bn' ? selectedRest.nameBn : selectedRest.nameEn}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRest(null)}
                  className="p-1.5 rounded-lg hover:bg-[#FBF9F5]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-[#102C40]/80 leading-relaxed">
                {lang === 'bn' ? selectedRest.reviewBn : selectedRest.reviewEn}
              </p>
              <dl className="pt-4 border-t border-[#E7E2D8] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-[#102C40]/55">{t.common.address}</dt>
                  <dd className="font-medium text-[#102C40]">
                    {selectedRest.address || t.common.notVerifiedYet}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#102C40]/55">{t.common.phone}</dt>
                  <dd className="font-medium text-[#102C40]">
                    {selectedRest.phone || t.common.notVerifiedYet}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#102C40]/55">{t.common.hours}</dt>
                  <dd className="font-medium text-[#102C40]">
                    {selectedRest.openingHours || t.common.notVerifiedYet}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#102C40]/55">{t.common.price}</dt>
                  <dd className="font-medium text-[#102C40]">
                    {selectedRest.priceRange || t.common.notVerifiedYet}
                  </dd>
                </div>
              </dl>
              {selectedRest.isSampleData && (
                <p className="text-xs text-[#102C40]/65 pt-2 border-t border-[#E7E2D8]">
                  {t.common.sampleNotice}
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    );
  }

  if (page === 'travel') {
    const travelRoutes = data.destinations.filter((d) =>
      ['sundarbans', 'bagerhat', 'river', 'mongla'].includes(d.category)
    );
    return (
      <section className="py-12 sm:py-16 bg-[#FBF9F5]">
        <SeoHead
          title="Khulna Travel Guide – Sundarbans, Bagerhat & Mongla | Khulna Vlogs"
          description="Practical Khulna travel guides for Sundarbans mangrove cruises, Bagerhat Sixty Dome Mosque, and Mongla river corridors."
          canonicalPath="/travel"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#102C40] mb-3">
              {t.nav.travel}
            </h1>
            <p className="text-base text-[#102C40]/75">
              {lang === 'bn'
                ? 'খুলনা শহর, সুন্দরবন ম্যানগ্রোভ বনাঞ্চল, বাগেরহাট ঐতিহ্য ও মোংলা নৌপথের পূর্ণাঙ্গ ভ্রমণ গাইড।'
                : 'Essential travel routes connecting Khulna city with the Sundarbans mangrove delta, Bagerhat’s Sultanate monuments, and Mongla.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {travelRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white border border-[#E7E2D8] rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] w-full">
                  <ResilientImage
                    src={route.featuredImage}
                    alt={route.imageAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-3 flex-1">
                  <p className="text-xs font-semibold text-[#268B55]">
                    {route.locationText}
                  </p>
                  <h2 className="font-display text-xl font-bold text-[#102C40]">
                    {lang === 'bn' ? route.nameBn : route.nameEn}
                  </h2>
                  <p className="text-sm text-[#102C40]/75 leading-relaxed">
                    {lang === 'bn' ? route.descriptionBn : route.descriptionEn}
                  </p>
                  {route.travelTipsEn && (
                    <p className="text-xs text-[#102C40]/65 pt-3 border-t border-[#E7E2D8]">
                      <strong>{t.common.travelTips}:</strong>{' '}
                      {lang === 'bn' ? route.travelTipsBn : route.travelTipsEn}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Photo Stories */}
          <div className="pt-8 border-t border-[#E7E2D8]">
            <h2 className="font-display text-2xl font-bold text-[#102C40] mb-6">
              {t.sections.storiesTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.articles.map((art) => (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => {
                    onNavigate('article', art.slug);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left p-6 bg-white border border-[#E7E2D8] rounded-xl hover:border-[#39A9DB] transition-colors"
                >
                  <p className="text-xs text-[#102C40]/60 mb-1.5">
                    {art.categorySlug.replace(/-/g, ' ')} · {art.readTimeMinutes} {t.common.minRead}
                  </p>
                  <h3 className="font-display text-xl font-bold text-[#102C40] mb-2">
                    {lang === 'bn' ? art.titleBn : art.titleEn}
                  </h3>
                  <p className="text-sm text-[#102C40]/75">
                    {lang === 'bn' ? art.excerptBn : art.excerptEn}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (page === 'lifestyle') {
    return (
      <section className="py-12 sm:py-16 bg-[#FBF9F5]">
        <SeoHead
          title="Local Lifestyle & Stories of Khulna | Khulna Vlogs"
          description="Discover daily life in Khulna, local markets, shopping destinations, culture, traditions, and city stories."
          canonicalPath="/lifestyle"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#102C40] mb-3">
              {t.nav.lifestyle}
            </h1>
            <p className="text-base text-[#102C40]/75">
              {t.sections.storiesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.articles.map((art) => (
              <button
                key={art.id}
                type="button"
                onClick={() => {
                  onNavigate('article', art.slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left group bg-white border border-[#E7E2D8] rounded-xl overflow-hidden flex flex-col hover:border-[#39A9DB] transition-colors"
              >
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <ResilientImage
                    src={art.featuredImage}
                    alt={lang === 'bn' ? art.imageAltBn : art.imageAltEn}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs text-[#102C40]/60 mb-2">
                    {art.categorySlug.replace(/-/g, ' ')} · {art.readTimeMinutes} {t.common.minRead}
                  </p>
                  <h2 className="font-display text-2xl font-bold text-[#102C40] group-hover:text-[#39A9DB] transition-colors mb-2">
                    {lang === 'bn' ? art.titleBn : art.titleEn}
                  </h2>
                  <p className="text-sm text-[#102C40]/75 leading-relaxed">
                    {lang === 'bn' ? art.excerptBn : art.excerptEn}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (page === 'directory') {
    const types = [
      { key: 'all', label: lang === 'bn' ? 'সকল তালিকা' : 'All Businesses' },
      { key: 'shop', label: lang === 'bn' ? 'দোকান ও শপিং' : 'Shops' },
      { key: 'hotel', label: lang === 'bn' ? 'হোটেল ও আবাসন' : 'Hotels' },
      { key: 'restaurant', label: lang === 'bn' ? 'রেস্তোরাঁ' : 'Restaurants' },
      { key: 'service', label: lang === 'bn' ? 'স্থানীয় সেবা' : 'Local Services' },
    ];
    const items =
      bizFilter === 'all'
        ? data.businesses
        : data.businesses.filter((b) => b.businessType === bizFilter);

    return (
      <section className="py-12 sm:py-16 bg-[#FBF9F5]">
        <SeoHead
          title="Khulna Local Business Directory | Khulna Vlogs"
          description="Discover local shops, hospitality, tour services, and verified businesses in Khulna, Bangladesh."
          canonicalPath="/directory"
          structuredData={items.map((b) => ({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: b.nameEn,
            description: b.descriptionEn,
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Khulna',
              addressCountry: 'BD',
            },
          }))}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-6">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#102C40] mb-3">
              {t.nav.directory}
            </h1>
            <p className="text-base text-[#102C40]/75 mb-2">
              {t.sections.businessSubtitle}
            </p>
            <p className="text-xs text-[#102C40]/65">
              {t.common.verifiedOnlyNote}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border border-[#E7E2D8] rounded-xl mb-10 w-fit">
            {types.map((tp) => (
              <button
                key={tp.key}
                type="button"
                onClick={() => setBizFilter(tp.key)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  bizFilter === tp.key
                    ? 'bg-[#102C40] text-white'
                    : 'text-[#102C40]/70 hover:text-[#102C40]'
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((biz) => (
              <div
                key={biz.id}
                className="bg-white border border-[#E7E2D8] rounded-xl p-6 flex flex-col justify-between gap-4"
              >
                <div>
                  <p className="text-xs text-[#102C40]/60 mb-1.5 capitalize">
                    {biz.businessType} · {biz.area}
                    {biz.isSampleData && ` · ${t.common.sampleBadge}`}
                  </p>
                  <h2 className="font-display text-xl font-bold text-[#102C40] mb-2">
                    {lang === 'bn' ? biz.nameBn : biz.nameEn}
                  </h2>
                  <p className="text-sm text-[#102C40]/75 leading-relaxed mb-4">
                    {lang === 'bn' ? biz.descriptionBn : biz.descriptionEn}
                  </p>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-3 border-t border-[#E7E2D8]">
                    <div>
                      <dt className="text-[#102C40]/55">{t.common.address}</dt>
                      <dd className="text-[#102C40] font-medium">
                        {biz.address || t.common.notVerifiedYet}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#102C40]/55">{t.common.phone}</dt>
                      <dd className="text-[#102C40] font-medium">
                        {biz.phone || t.common.notVerifiedYet}
                      </dd>
                    </div>
                  </dl>
                </div>

                {biz.mapQuery && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.mapQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#39A9DB] hover:text-[#102C40]"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t.common.openInMaps}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (page === 'events') {
    const types = [
      { key: 'all', label: lang === 'bn' ? 'সকল আয়োজন' : 'All Events' },
      { key: 'festival', label: lang === 'bn' ? 'উৎসব' : 'Festivals' },
      { key: 'cultural', label: lang === 'bn' ? 'সাংস্কৃতিক অনুষ্ঠান' : 'Cultural' },
      { key: 'exhibition', label: lang === 'bn' ? 'প্রদর্শনী ও মেলা' : 'Exhibitions & Fairs' },
    ];
    const items =
      eventFilter === 'all'
        ? data.events
        : data.events.filter((ev) => ev.eventType === eventFilter);

    return (
      <section className="py-12 sm:py-16 bg-[#FBF9F5]">
        <SeoHead
          title="Khulna Events & Festivals | Khulna Vlogs"
          description="Upcoming cultural programs, local festivals, exhibitions, and fairs in Khulna, Bangladesh."
          canonicalPath="/events"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#102C40] mb-3">
              {t.nav.events}
            </h1>
            <p className="text-base text-[#102C40]/75">
              {lang === 'bn'
                ? 'খুলনার স্থানীয় উৎসব, মেলা, প্রদর্শনী এবং সাংস্কৃতিক অনুষ্ঠানের তালিকা।'
                : 'Local festivals, cultural gatherings, fairs, and exhibitions across Khulna.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border border-[#E7E2D8] rounded-xl mb-10 w-fit">
            {types.map((tp) => (
              <button
                key={tp.key}
                type="button"
                onClick={() => setEventFilter(tp.key)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  eventFilter === tp.key
                    ? 'bg-[#102C40] text-white'
                    : 'text-[#102C40]/70 hover:text-[#102C40]'
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((ev) => (
              <div
                key={ev.id}
                className="bg-white border border-[#E7E2D8] rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] w-full">
                  <ResilientImage
                    src={ev.featuredImage}
                    alt={lang === 'bn' ? ev.titleBn : ev.titleEn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-2.5 flex-1">
                  <p className="text-xs font-medium text-[#268B55] inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? ev.dateLabelBn : ev.dateLabelEn}</span>
                  </p>
                  <h2 className="font-display text-xl font-bold text-[#102C40]">
                    {lang === 'bn' ? ev.titleBn : ev.titleEn}
                  </h2>
                  <p className="text-xs text-[#102C40]/60">
                    {lang === 'bn' ? ev.venueBn : ev.venueEn}
                  </p>
                  <p className="text-sm text-[#102C40]/75 leading-relaxed">
                    {lang === 'bn' ? ev.descriptionBn : ev.descriptionEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (page === 'gallery') {
    const categories = ['all', ...Array.from(new Set(data.galleryItems.map((g) => g.category)))];
    const items =
      galleryFilter === 'all'
        ? data.galleryItems
        : data.galleryItems.filter((g) => g.category === galleryFilter);

    return (
      <section className="py-12 sm:py-16 bg-[#FBF9F5]">
        <SeoHead
          title="Khulna Photo & Video Gallery | Khulna Vlogs"
          description="Editorial photography and travel visual archive showcasing Khulna, Sundarbans, Bagerhat, and Rupsha River."
          canonicalPath="/gallery"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#102C40] mb-3">
              {t.nav.gallery}
            </h1>
            <p className="text-base text-[#102C40]/75">
              {lang === 'bn'
                ? 'খুলনা, রূপসা নদী, সুন্দরবন ও বাগেরহাটের নির্বাচিত আলোকচিত্র এবং ভ্রমণ দৃশ্য।'
                : 'Curated photography and travel frames from Khulna, the Rupsha waterfront, and nearby heritage landmarks.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border border-[#E7E2D8] rounded-xl mb-10 w-fit">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setGalleryFilter(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap capitalize ${
                  galleryFilter === cat
                    ? 'bg-[#102C40] text-white'
                    : 'text-[#102C40]/70 hover:text-[#102C40]'
                }`}
              >
                {cat === 'all' ? (lang === 'bn' ? 'সকল ছবি' : 'All') : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLightboxItem(item)}
                className="text-left group bg-white border border-[#E7E2D8] rounded-xl overflow-hidden hover:border-[#39A9DB] transition-colors"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <ResilientImage
                    src={item.mediaUrl}
                    alt={lang === 'bn' ? item.titleBn : item.titleEn}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-[#102C40]/60 mb-1">
                    {item.category} · {lang === 'bn' ? item.locationBn : item.locationEn}
                  </p>
                  <h2 className="font-display text-lg font-bold text-[#102C40]">
                    {lang === 'bn' ? item.titleBn : item.titleEn}
                  </h2>
                </div>
              </button>
            ))}
          </div>
        </div>

        {lightboxItem && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-[#102C40] text-white rounded-xl overflow-hidden border border-white/15">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div>
                  <h3 className="font-display text-lg font-bold">
                    {lang === 'bn' ? lightboxItem.titleBn : lightboxItem.titleEn}
                  </h3>
                  <p className="text-xs text-white/65">
                    {lang === 'bn' ? lightboxItem.locationBn : lightboxItem.locationEn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxItem(null)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-[16/10] w-full bg-black">
                <ResilientImage
                  src={lightboxItem.mediaUrl}
                  alt={lang === 'bn' ? lightboxItem.titleBn : lightboxItem.titleEn}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="px-5 py-4 text-sm text-white/85">
                {lang === 'bn' ? lightboxItem.captionBn : lightboxItem.captionEn}
              </p>
            </div>
          </div>
        )}
      </section>
    );
  }

  if (page === 'about') {
    return (
      <section className="py-12 sm:py-16 bg-[#FBF9F5]">
        <SeoHead
          title="About Us – Mission & Vision | Khulna Vlogs"
          description="Learn about the mission, vision, and editorial standards of Khulna Vlogs, the official city guide and travel platform for Khulna, Bangladesh."
          canonicalPath="/about"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-[#E7E2D8]">
            <img
              src={BRAND_LOGO_URL}
              alt="Khulna Vlogs Official Logo"
              className="w-24 h-24 object-contain shrink-0"
            />
            <div>
              <p className="text-xs font-semibold text-[#268B55] mb-2">
                {t.tagline}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#102C40] mb-2">
                {t.about.title}
              </h1>
              <p className="text-base text-[#102C40]/75">{t.about.subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white border border-[#E7E2D8] rounded-xl p-8">
              <h2 className="font-display text-2xl font-bold text-[#102C40] mb-3">
                {t.about.missionTitle}
              </h2>
              <p className="text-base text-[#102C40]/80 leading-relaxed">
                {t.about.missionBody}
              </p>
            </div>
            <div className="bg-white border border-[#E7E2D8] rounded-xl p-8">
              <h2 className="font-display text-2xl font-bold text-[#102C40] mb-3">
                {t.about.visionTitle}
              </h2>
              <p className="text-base text-[#102C40]/80 leading-relaxed">
                {t.about.visionBody}
              </p>
            </div>
            <div className="bg-white border border-[#E7E2D8] rounded-xl p-8">
              <h2 className="font-display text-2xl font-bold text-[#102C40] mb-3">
                {t.about.standardsTitle}
              </h2>
              <p className="text-base text-[#102C40]/80 leading-relaxed">
                {t.about.standardsBody}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Contact Page
  return (
    <section className="py-12 sm:py-16 bg-[#FBF9F5]">
      <SeoHead
        title="Contact Us | Khulna Vlogs"
        description="Get in touch with Khulna Vlogs to suggest destinations, submit verified local businesses, or collaborate."
        canonicalPath="/contact"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#102C40] mb-3">
            {t.contact.title}
          </h1>
          <p className="text-base text-[#102C40]/75">{t.contact.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleContactSubmit}
            className="lg:col-span-7 bg-white border border-[#E7E2D8] rounded-xl p-6 sm:p-8 space-y-5"
          >
            <div>
              <label className="block text-xs font-semibold text-[#102C40] mb-1.5">
                {t.contact.nameLabel}
              </label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full px-4 py-2.5 text-sm border border-[#E7E2D8] rounded-lg focus:outline-none focus:border-[#39A9DB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102C40] mb-1.5">
                {t.contact.emailLabel}
              </label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full px-4 py-2.5 text-sm border border-[#E7E2D8] rounded-lg focus:outline-none focus:border-[#39A9DB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102C40] mb-1.5">
                {t.contact.subjectLabel}
              </label>
              <input
                type="text"
                required
                value={contactForm.subject}
                onChange={(e) =>
                  setContactForm((f) => ({ ...f, subject: e.target.value }))
                }
                className="w-full px-4 py-2.5 text-sm border border-[#E7E2D8] rounded-lg focus:outline-none focus:border-[#39A9DB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102C40] mb-1.5">
                {t.contact.messageLabel}
              </label>
              <textarea
                rows={5}
                required
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm((f) => ({ ...f, message: e.target.value }))
                }
                className="w-full px-4 py-2.5 text-sm border border-[#E7E2D8] rounded-lg focus:outline-none focus:border-[#39A9DB]"
              />
            </div>

            <button
              type="submit"
              disabled={contactState === 'sending'}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#102C40] hover:bg-[#193F5B] rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{t.contact.submitButton}</span>
            </button>

            {contactState === 'sent' && (
              <p className="text-sm font-medium text-[#268B55]">
                {t.contact.successMessage}
              </p>
            )}
            {contactState === 'error' && (
              <p className="text-sm font-medium text-red-700">
                Could not submit message. Please try again.
              </p>
            )}
            {contactState === 'unavailable' && (
              <p className="text-sm font-medium text-[#102C40]/80">
                Contact form storage requires the full-stack backend server. Please reach out directly via Facebook (@thekhulnavlogs).
              </p>
            )}
          </form>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E7E2D8] rounded-xl p-6 sm:p-8 space-y-4">
              <h2 className="font-display text-xl font-bold text-[#102C40]">
                {t.contact.socialHeading}
              </h2>
              <p className="text-sm text-[#102C40]/75">
                Khulna, Bangladesh · {t.tagline}
              </p>
              <div className="space-y-3 pt-2">
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-lg border border-[#E7E2D8] hover:border-[#39A9DB] transition-colors"
                >
                  <span className="text-sm font-semibold text-[#102C40]">
                    Facebook · @thekhulnavlogs
                  </span>
                  <ExternalLink className="w-4 h-4 text-[#39A9DB]" />
                </a>
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-lg border border-[#E7E2D8] hover:border-[#F5C542] transition-colors"
                >
                  <span className="text-sm font-semibold text-[#102C40]">
                    YouTube · Khulna Vlogs
                  </span>
                  <ExternalLink className="w-4 h-4 text-[#102C40]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
