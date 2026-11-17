import { Language, PageRoute } from '../types';
import {
  BRAND_LOGO_URL,
  FACEBOOK_URL,
  YOUTUBE_URL,
  copy,
} from '../i18n/translations';

interface FooterProps {
  lang: Language;
  onNavigate: (page: PageRoute) => void;
}

export function Footer({ lang, onNavigate }: FooterProps) {
  const t = copy[lang];

  const handleNav = (page: PageRoute) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#102C40] text-white border-t border-[#1C415C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={BRAND_LOGO_URL}
                alt="Khulna Vlogs Logo"
                className="h-12 w-12 object-contain shrink-0"
              />
              <div>
                <p className="font-display text-xl font-bold text-white">
                  {t.brandName}
                </p>
                <p className="text-xs text-[#F5C542]">{t.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-white/75 leading-relaxed">
              {t.footer.aboutText}
            </p>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#F5C542] mb-4">
              {t.footer.exploreHeading}
            </h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <a href="/explore" onClick={handleNav('explore')} className="hover:text-white transition-colors">
                  {t.nav.explore}
                </a>
              </li>
              <li>
                <a href="/food" onClick={handleNav('food')} className="hover:text-white transition-colors">
                  {t.nav.food}
                </a>
              </li>
              <li>
                <a href="/travel" onClick={handleNav('travel')} className="hover:text-white transition-colors">
                  {t.nav.travel}
                </a>
              </li>
              <li>
                <a href="/lifestyle" onClick={handleNav('lifestyle')} className="hover:text-white transition-colors">
                  {t.nav.lifestyle}
                </a>
              </li>
              <li>
                <a href="/directory" onClick={handleNav('directory')} className="hover:text-white transition-colors">
                  {t.nav.directory}
                </a>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#F5C542] mb-4">
              {t.footer.communityHeading}
            </h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <a href="/events" onClick={handleNav('events')} className="hover:text-white transition-colors">
                  {t.nav.events}
                </a>
              </li>
              <li>
                <a href="/gallery" onClick={handleNav('gallery')} className="hover:text-white transition-colors">
                  {t.nav.gallery}
                </a>
              </li>
              <li>
                <a href="/about" onClick={handleNav('about')} className="hover:text-white transition-colors">
                  {t.nav.about}
                </a>
              </li>
              <li>
                <a href="/contact" onClick={handleNav('contact')} className="hover:text-white transition-colors">
                  {t.nav.contact}
                </a>
              </li>
              <li>
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#39A9DB] transition-colors"
                >
                  Facebook · @thekhulnavlogs
                </a>
              </li>
              <li>
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F5C542] transition-colors"
                >
                  YouTube · Khulna Vlogs
                </a>
              </li>
            </ul>
          </div>

          {/* Platform & SEO */}
          <div>
            <h3 className="text-sm font-semibold text-[#F5C542] mb-4">
              {t.footer.platformHeading}
            </h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <a href="/about" onClick={handleNav('about')} className="hover:text-white transition-colors">
                  {t.nav.about}
                </a>
              </li>
              <li>
                <a href="/contact" onClick={handleNav('contact')} className="hover:text-white transition-colors">
                  {t.nav.contact}
                </a>
              </li>
              <li>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  XML Sitemap (sitemap.xml)
                </a>
              </li>
              <li>
                <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Robots Policy (robots.txt)
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs text-white/60 leading-relaxed">
              {t.footer.disclaimer}
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/65">
          <p>{t.footer.copyright}</p>
          <p>Khulna, Bangladesh · {t.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
