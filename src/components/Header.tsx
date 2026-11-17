import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Language, PageRoute } from '../types';
import { BRAND_LOGO_URL, copy } from '../i18n/translations';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  currentPage: PageRoute;
  onNavigate: (page: PageRoute, slug?: string) => void;
  taglineOverride?: string;
}

export function Header({
  lang,
  setLang,
  currentPage,
  onNavigate,
  taglineOverride,
}: HeaderProps) {
  const t = copy[lang];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryLinks: { page: PageRoute; label: string }[] = [
    { page: 'explore', label: t.nav.explore },
    { page: 'food', label: t.nav.food },
    { page: 'travel', label: t.nav.travel },
    { page: 'directory', label: t.nav.directory },
    { page: 'lifestyle', label: t.nav.lifestyle },
  ];

  const secondaryLinks: { page: PageRoute; label: string }[] = [
    { page: 'events', label: t.nav.events },
    { page: 'gallery', label: t.nav.gallery },
    { page: 'about', label: t.nav.about },
    { page: 'contact', label: t.nav.contact },
  ];

  const handleLinkClick = (page: PageRoute) => {
    setMobileOpen(false);
    setMoreOpen(false);
    onNavigate(page);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E7E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Official Khulna Vlogs Logo + Single-line Brand Title */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('home');
            }}
            className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39A9DB] rounded-md"
          >
            <img
              src={BRAND_LOGO_URL}
              alt="Khulna Vlogs Official Logo"
              className="h-10 w-10 object-contain shrink-0"
            />
            <span className="font-display text-xl font-bold tracking-tight text-[#102C40]">
              {t.brandName}
            </span>
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#102C40]/80"
          >
            {primaryLinks.map((item) => {
              const active = currentPage === item.page;
              return (
                <a
                  key={item.page}
                  href={`/${item.page}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.page);
                  }}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39A9DB] ${
                    active
                      ? 'text-[#102C40] border-[#39A9DB] font-semibold'
                      : 'border-transparent hover:text-[#102C40] hover:border-[#F5C542]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((prev) => !prev)}
                aria-expanded={moreOpen}
                className="flex items-center gap-1 whitespace-nowrap shrink-0 py-1 text-[#102C40]/80 hover:text-[#102C40] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39A9DB]"
              >
                <span>{t.nav.more}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {moreOpen && (
                <div
                  onMouseLeave={() => setMoreOpen(false)}
                  className="absolute right-0 mt-2 w-48 bg-white border border-[#E7E2D8] rounded-lg shadow-lg py-1.5 z-50"
                >
                  {secondaryLinks.map((item) => (
                    <a
                      key={item.page}
                      href={`/${item.page}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(item.page);
                      }}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        currentPage === item.page
                          ? 'bg-[#FBF9F5] text-[#102C40] font-semibold'
                          : 'text-[#102C40]/80 hover:bg-[#FBF9F5] hover:text-[#102C40]'
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Language Switcher on Desktop + Mobile Menu Trigger (No Admin or Login Button) */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              role="group"
              aria-label="Language Switcher"
              className="hidden lg:flex items-center gap-1 p-0.5 bg-[#FBF9F5] border border-[#E7E2D8] rounded-lg"
            >
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'en'
                    ? 'bg-[#102C40] text-white'
                    : 'text-[#102C40]/70 hover:text-[#102C40]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'bn'
                    ? 'bg-[#102C40] text-white'
                    : 'text-[#102C40]/70 hover:text-[#102C40]'
                }`}
              >
                বাংলা
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle Menu"
              aria-expanded={mobileOpen}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#102C40] hover:bg-[#FBF9F5] transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-[#E7E2D8] px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
            {[...primaryLinks, ...secondaryLinks].map((item) => (
              <a
                key={item.page}
                href={`/${item.page}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.page);
                }}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentPage === item.page
                    ? 'bg-[#102C40] text-white'
                    : 'text-[#102C40] hover:bg-[#FBF9F5]'
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-3 mt-3 border-t border-[#E7E2D8] flex items-center justify-between gap-3">
              <span className="text-xs text-[#102C40]/65">
                {lang === 'bn' ? 'ভাষা নির্বাচন করুন' : 'Language'}
              </span>
              <div className="flex items-center gap-1 p-1 bg-[#FBF9F5] border border-[#E7E2D8] rounded-lg">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    lang === 'en' ? 'bg-[#102C40] text-white' : 'text-[#102C40]/70'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang('bn')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    lang === 'bn' ? 'bg-[#102C40] text-white' : 'text-[#102C40]/70'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Non-sticky Editorial Sub-Bar: Tagline & Secondary Links */}
      <div className="bg-[#FBF9F5] border-b border-[#E7E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-[#102C40]/75">
            <span className="font-medium text-[#102C40]">
              {taglineOverride || t.tagline}
            </span>
            <span aria-hidden="true" className="hidden sm:inline text-[#102C40]/30">
              ·
            </span>
            <span className="hidden sm:inline">Khulna, Bangladesh</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex items-center gap-4 text-[#102C40]/75">
              {secondaryLinks.map((item) => (
                <a
                  key={item.page}
                  href={`/${item.page}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.page);
                  }}
                  className={`whitespace-nowrap hover:text-[#102C40] transition-colors ${
                    currentPage === item.page
                      ? 'text-[#102C40] font-semibold underline underline-offset-4'
                      : ''
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div
              role="group"
              aria-label="Mobile Language Switcher"
              className="lg:hidden flex items-center gap-1 p-0.5 bg-white border border-[#E7E2D8] rounded-md"
            >
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'en'
                    ? 'bg-[#102C40] text-white'
                    : 'text-[#102C40]/70 hover:text-[#102C40]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'bn'
                    ? 'bg-[#102C40] text-white'
                    : 'text-[#102C40]/70 hover:text-[#102C40]'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
