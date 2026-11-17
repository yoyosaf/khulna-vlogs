import { useCallback, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { DirectoryPages } from './components/DirectoryPages';
import { ArticleDetailView } from './components/ArticleDetailView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AdminSection, BootstrapPayload, Language, PageRoute } from './types';
import { copy } from './i18n/translations';

type ParsedRoute =
  | { kind: 'public'; page: Exclude<PageRoute, 'admin'>; slug?: string }
  | { kind: 'admin-login' }
  | { kind: 'admin-panel'; section: AdminSection };

const ADMIN_SECTIONS: AdminSection[] = [
  'dashboard',
  'articles',
  'categories',
  'destinations',
  'restaurants',
  'businesses',
  'events',
  'gallery',
  'videos',
  'messages',
  'settings',
];

function parseLocation(): ParsedRoute {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path === '/admin/login') {
    return { kind: 'admin-login' };
  }

  if (path === '/admin' || path.startsWith('/admin/')) {
    const sub = path.replace(/^\/admin\/?/, '').split('/')[0] as AdminSection;
    if (ADMIN_SECTIONS.includes(sub)) {
      return { kind: 'admin-panel', section: sub };
    }
    return { kind: 'admin-panel', section: 'dashboard' };
  }

  if (path === '/') return { kind: 'public', page: 'home' };
  if (path.startsWith('/stories/')) {
    return {
      kind: 'public',
      page: 'article',
      slug: decodeURIComponent(path.replace('/stories/', '')),
    };
  }
  const segment = path.slice(1).split('/')[0] as Exclude<PageRoute, 'admin'>;
  const validPages: Exclude<PageRoute, 'admin'>[] = [
    'explore',
    'food',
    'travel',
    'lifestyle',
    'directory',
    'events',
    'gallery',
    'about',
    'contact',
  ];
  if (validPages.includes(segment)) {
    return { kind: 'public', page: segment };
  }
  return { kind: 'public', page: 'home' };
}

function KhulnaVlogsShell() {
  const { firebaseUser, profile, loading: authLoading } = useAuth();
  const [lang, setLang] = useState<Language>('en');
  const [route, setRoute] = useState<ParsedRoute>(() => parseLocation());
  const [data, setData] = useState<BootstrapPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/public/bootstrap');
      if (!res.ok) throw new Error('Unable to load Khulna Vlogs content.');
      const json: BootstrapPayload = await res.json();
      setData(json);
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err.message || 'Connection error');
    }
  }, []);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  useEffect(() => {
    const onPopState = () => setRoute(parseLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Protect all /admin/* routes and redirect unauthenticated/non-admin users to /admin/login
  useEffect(() => {
    if (authLoading) return;
    const isAuthorizedAdmin = Boolean(firebaseUser && profile?.role === 'admin');

    if (route.kind === 'admin-panel' && !isAuthorizedAdmin) {
      window.history.replaceState({}, '', '/admin/login');
      setRoute({ kind: 'admin-login' });
    } else if (route.kind === 'admin-login' && isAuthorizedAdmin) {
      window.history.replaceState({}, '', '/admin/dashboard');
      setRoute({ kind: 'admin-panel', section: 'dashboard' });
    }
  }, [authLoading, firebaseUser, profile, route.kind]);

  const handleNavigatePublic = (page: PageRoute, slug?: string) => {
    if (page === 'admin') {
      window.history.pushState({}, '', '/admin/login');
      setRoute({ kind: 'admin-login' });
      return;
    }
    const url =
      page === 'home'
        ? '/'
        : page === 'article' && slug
        ? `/stories/${encodeURIComponent(slug)}`
        : `/${page}`;
    if (window.location.pathname !== url) {
      window.history.pushState({}, '', url);
    }
    setRoute({ kind: 'public', page, slug });
  };

  const handleNavigateAdminSection = (section: AdminSection) => {
    const url = `/admin/${section}`;
    if (window.location.pathname !== url) {
      window.history.pushState({}, '', url);
    }
    setRoute({ kind: 'admin-panel', section });
  };

  // Dedicated Admin Login Page (separate from public header/footer)
  if (route.kind === 'admin-login') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center text-sm text-[#102C40]/70">
          Checking administrator session...
        </div>
      );
    }
    return (
      <AdminLoginPage
        onSuccessRedirect={() => handleNavigateAdminSection('dashboard')}
        onBackPublic={() => handleNavigatePublic('home')}
      />
    );
  }

  // Protected Admin Dashboard Routes (separate sidebar layout)
  if (route.kind === 'admin-panel') {
    if (authLoading || !firebaseUser || profile?.role !== 'admin') {
      return (
        <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center text-sm text-[#102C40]/70">
          Verifying administrator authorization...
        </div>
      );
    }
    return (
      <AdminDashboard
        section={route.section}
        onNavigateSection={handleNavigateAdminSection}
        onNavigatePublic={() => handleNavigatePublic('home')}
        onLoggedOut={() => {
          window.history.replaceState({}, '', '/admin/login');
          setRoute({ kind: 'admin-login' });
        }}
        onContentUpdated={fetchBootstrap}
      />
    );
  }

  // Public Khulna Vlogs Website
  const t = copy[lang];
  const taglineOverride =
    lang === 'bn' ? data?.settings?.taglineBn : data?.settings?.taglineEn;
  const activeArticle =
    route.page === 'article' && data
      ? data.articles.find((a) => a.slug === route.slug) || data.articles[0]
      : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#102C40]">
      <Header
        lang={lang}
        setLang={setLang}
        currentPage={route.page}
        onNavigate={handleNavigatePublic}
        taglineOverride={taglineOverride}
      />

      <main className="flex-1">
        {loadError ? (
          <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
            <p className="font-display text-2xl font-bold text-[#102C40]">
              {loadError}
            </p>
            <button
              type="button"
              onClick={fetchBootstrap}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#102C40] rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : !data ? (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center text-sm text-[#102C40]/65">
            {t.common.loading}
          </div>
        ) : route.page === 'home' ? (
          <HomePage data={data} lang={lang} onNavigate={handleNavigatePublic} />
        ) : route.page === 'article' && activeArticle ? (
          <ArticleDetailView
            article={activeArticle}
            relatedArticles={data.articles.filter((a) => a.id !== activeArticle.id)}
            lang={lang}
            onNavigate={handleNavigatePublic}
          />
        ) : (
          <DirectoryPages
            page={route.page === 'article' ? 'lifestyle' : route.page}
            data={data}
            lang={lang}
            onNavigate={handleNavigatePublic}
          />
        )}
      </main>

      <Footer lang={lang} onNavigate={handleNavigatePublic} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <KhulnaVlogsShell />
    </AuthProvider>
  );
}
