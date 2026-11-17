import { useCallback, useEffect, useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  Edit3,
  ExternalLink,
  FileText,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  Upload,
  Utensils,
  Video,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND_LOGO_URL } from '../i18n/translations';
import {
  AdminSection,
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
} from '../types';
import { SeoHead } from './SeoHead';

interface AdminOverviewData {
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
  settings: SiteSettings | null;
}

interface AdminDashboardProps {
  section: AdminSection;
  onNavigateSection: (section: AdminSection) => void;
  onNavigatePublic: () => void;
  onLoggedOut: () => void;
  onContentUpdated: () => Promise<void>;
}

export function AdminDashboard({
  section,
  onNavigateSection,
  onNavigatePublic,
  onLoggedOut,
  onContentUpdated,
}: AdminDashboardProps) {
  const { profile, signOut, getIdToken } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [articleForm, setArticleForm] = useState({
    titleEn: '',
    titleBn: '',
    slug: '',
    excerptEn: '',
    excerptBn: '',
    contentEn: '',
    contentBn: '',
    categorySlug: 'city-lifestyle',
    featuredImage: '/src/assets/images/hero_khulna_rupsha_1794914379194.jpg',
    imageAltEn: '',
    imageAltBn: '',
    authorName: 'Khulna Vlogs Editorial',
    readTimeMinutes: 5,
    status: 'published' as 'published' | 'draft',
    isFeatured: false,
    seoTitle: '',
    seoDescription: '',
  });

  const [catForm, setCatForm] = useState({
    nameEn: '',
    nameBn: '',
    slug: '',
    descriptionEn: '',
    descriptionBn: '',
    section: 'explore',
    sortOrder: 0,
  });

  const [editingDestId, setEditingDestId] = useState<number | null>(null);
  const [destForm, setDestForm] = useState({
    nameEn: '',
    nameBn: '',
    category: 'attraction',
    summaryEn: '',
    summaryBn: '',
    descriptionEn: '',
    descriptionBn: '',
    locationText: 'Khulna, Bangladesh',
    travelTipsEn: '',
    travelTipsBn: '',
    bestTimeEn: '',
    bestTimeBn: '',
    featuredImage: '/src/assets/images/dest_sundarbans_mangrove_1794914379796.jpg',
    imageAlt: '',
    isFeatured: false,
    isHiddenGem: false,
    isSampleData: false,
    status: 'published' as 'published' | 'draft',
    seoTitle: '',
    seoDescription: '',
  });

  const [editingRestId, setEditingRestId] = useState<number | null>(null);
  const [restForm, setRestForm] = useState({
    nameEn: '',
    nameBn: '',
    cuisineType: 'local',
    specialtyEn: '',
    specialtyBn: '',
    reviewEn: '',
    reviewBn: '',
    areaEn: 'Khulna City',
    areaBn: 'খুলনা শহর',
    address: '',
    phone: '',
    priceRange: '',
    openingHours: '',
    featuredImage: '/src/assets/images/food_khulna_chui_jhal_1794914380590.jpg',
    imageAlt: '',
    isFeatured: false,
    isSampleData: false,
    status: 'published' as 'published' | 'draft',
    seoTitle: '',
    seoDescription: '',
  });

  const [bizForm, setBizForm] = useState({
    nameEn: '',
    nameBn: '',
    businessType: 'shop',
    descriptionEn: '',
    descriptionBn: '',
    area: 'Khulna City',
    address: '',
    phone: '',
    websiteUrl: '',
    mapQuery: '',
    featuredImage: '/src/assets/images/lifestyle_khulna_street_1794914380876.jpg',
    isFeatured: false,
    isSampleData: false,
    status: 'published' as 'published' | 'draft',
  });

  const [videoForm, setVideoForm] = useState({
    titleEn: '',
    titleBn: '',
    youtubeUrl: '',
    descriptionEn: '',
    descriptionBn: '',
    category: 'Travel Vlog',
    isFeatured: true,
    status: 'published' as 'published' | 'draft',
  });

  const [eventForm, setEventForm] = useState({
    titleEn: '',
    titleBn: '',
    eventType: 'cultural',
    descriptionEn: '',
    descriptionBn: '',
    venueEn: 'Khulna, Bangladesh',
    venueBn: 'খুলনা, বাংলাদেশ',
    eventDate: '2027-04-14',
    dateLabelEn: '',
    dateLabelBn: '',
    featuredImage: '/src/assets/images/lifestyle_khulna_street_1794914380876.jpg',
    isSampleData: false,
    status: 'published' as 'published' | 'draft',
  });

  const [galleryForm, setGalleryForm] = useState({
    titleEn: '',
    titleBn: '',
    captionEn: '',
    captionBn: '',
    locationEn: 'Khulna, Bangladesh',
    locationBn: 'খুলনা, বাংলাদেশ',
    mediaType: 'photo' as 'photo' | 'video',
    mediaUrl: '/src/assets/images/hero_khulna_rupsha_1794914379194.jpg',
    category: 'Khulna',
    isFeatured: true,
    status: 'published' as 'published' | 'draft',
  });

  const [settingsForm, setSettingsForm] = useState({
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
    defaultSeoTitle: 'Khulna Vlogs – Explore, Travel & Discover Khulna, Bangladesh',
    defaultSeoDescription: '',
  });

  const fetchOverview = useCallback(async () => {
    const token = await getIdToken();
    if (!token) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json: AdminOverviewData = await res.json();
        setData(json);
        if (json.settings) {
          setSettingsForm({
            siteName: json.settings.siteName,
            taglineEn: json.settings.taglineEn,
            taglineBn: json.settings.taglineBn,
            heroHeadlineEn: json.settings.heroHeadlineEn,
            heroHeadlineBn: json.settings.heroHeadlineBn,
            heroSubtitleEn: json.settings.heroSubtitleEn,
            heroSubtitleBn: json.settings.heroSubtitleBn,
            facebookUrl: json.settings.facebookUrl,
            youtubeUrl: json.settings.youtubeUrl,
            contactEmail: json.settings.contactEmail,
            defaultSeoTitle: json.settings.defaultSeoTitle,
            defaultSeoDescription: json.settings.defaultSeoDescription,
          });
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Failed to load admin workspace');
      }
    } finally {
      setBusy(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchOverview();
    }
  }, [profile, fetchOverview]);

  const adminRequest = async (
    url: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: unknown
  ) => {
    const token = await getIdToken();
    if (!token) throw new Error('Not authenticated');
    setErrorMsg(null);
    setNotice(null);
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Operation failed');
    }
    await fetchOverview();
    await onContentUpdated();
    setNotice('Changes saved successfully.');
  };

  const handleImageUpload = async (
    file: File,
    onSuccessUrl: (url: string) => void
  ) => {
    const token = await getIdToken();
    if (!token) return;
    if (file.size > 6 * 1024 * 1024) {
      setErrorMsg('Please choose an image smaller than 6 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = String(reader.result || '');
        const res = await fetch('/api/admin/media', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            dataBase64: dataUrl,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Upload failed');
        }
        const json = await res.json();
        onSuccessUrl(json.url);
        setNotice('Image uploaded and attached.');
      } catch (err: any) {
        setErrorMsg(err.message || 'Image upload failed');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await signOut();
    onLoggedOut();
  };

  const navItems: {
    key: AdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { key: 'articles', label: 'Manage Articles', icon: FileText },
    { key: 'categories', label: 'Manage Categories', icon: FolderTree },
    { key: 'destinations', label: 'Manage Destinations', icon: Compass },
    { key: 'restaurants', label: 'Manage Restaurants', icon: Utensils },
    { key: 'businesses', label: 'Manage Businesses', icon: Building2 },
    { key: 'events', label: 'Manage Events', icon: Calendar },
    { key: 'gallery', label: 'Manage Gallery', icon: ImageIcon },
    { key: 'videos', label: 'YouTube Videos', icon: Video },
    {
      key: 'messages',
      label: `Contact Messages (${data?.contacts.length ?? 0})`,
      icon: MessageSquare,
    },
    { key: 'settings', label: 'Website Settings', icon: Settings },
  ];

  const activeTitle =
    navItems.find((n) => n.key === section)?.label || 'Admin Dashboard';

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#102C40] flex">
      <SeoHead
        title={`${activeTitle} | Khulna Vlogs Admin`}
        description="Khulna Vlogs administrator CMS workspace."
        canonicalPath={`/admin/${section}`}
      />

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-68 bg-[#102C40] text-white flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Sidebar Brand */}
          <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={BRAND_LOGO_URL}
                alt="Khulna Vlogs"
                className="h-9 w-9 object-contain shrink-0"
              />
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-white truncate">
                  Khulna Vlogs
                </p>
                <p className="text-[11px] text-[#F5C542] truncate">Admin Panel</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded hover:bg-white/10"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onNavigateSection(item.key);
                    setSidebarOpen(false);
                    setNotice(null);
                    setErrorMsg(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                    active
                      ? 'bg-[#F5C542] text-[#102C40] font-semibold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2.5 shrink-0">
          <p className="text-[11px] text-white/60 truncate px-1">
            {profile?.email}
          </p>
          <button
            type="button"
            onClick={onNavigatePublic}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Website</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-red-600/85 hover:bg-red-600 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Header */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#102C40] hover:bg-[#F5F7FA]"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#102C40] truncate">
              {activeTitle}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#102C40] border border-[#CBD5E1] rounded-lg hover:bg-[#F5F7FA] whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {notice && (
            <div className="flex items-center gap-2 text-xs font-medium text-[#14532D] bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
          {errorMsg && (
            <div className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {errorMsg}
            </div>
          )}

          {busy && !data && (
            <p className="text-sm text-[#102C40]/65">Loading dashboard records...</p>
          )}

          {/* DASHBOARD OVERVIEW */}
          {data && section === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <p className="text-xs text-[#102C40]/60">Articles</p>
                  <p className="font-mono-num text-2xl font-bold text-[#102C40] mt-1">
                    {data.articles.length}
                  </p>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <p className="text-xs text-[#102C40]/60">Destinations</p>
                  <p className="font-mono-num text-2xl font-bold text-[#102C40] mt-1">
                    {data.destinations.length}
                  </p>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <p className="text-xs text-[#102C40]/60">Restaurants &amp; Businesses</p>
                  <p className="font-mono-num text-2xl font-bold text-[#102C40] mt-1">
                    {data.restaurants.length + data.businesses.length}
                  </p>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <p className="text-xs text-[#102C40]/60">Subscribers &amp; Inquiries</p>
                  <p className="font-mono-num text-2xl font-bold text-[#102C40] mt-1">
                    {data.subscribers.length + data.contacts.length}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-[#102C40]">
                  Administrator Access &amp; Users
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-[#102C40]/60">
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Role</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {data.users.map((u) => (
                        <tr key={u.id}>
                          <td className="py-2.5 pr-4 font-medium">{u.email}</td>
                          <td className="py-2.5 pr-4">{u.displayName || '—'}</td>
                          <td className="py-2.5 pr-4 capitalize">{u.role}</td>
                          <td className="py-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                adminRequest(`/api/admin/users/${u.id}/role`, 'PATCH', {
                                  role: u.role === 'admin' ? 'viewer' : 'admin',
                                })
                              }
                              className="text-xs font-semibold text-[#39A9DB] hover:text-[#102C40]"
                            >
                              {u.role === 'admin' ? 'Set Viewer' : 'Make Admin'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-3">
                <h2 className="font-display text-lg font-bold text-[#102C40]">
                  Newsletter Subscribers ({data.subscribers.length})
                </h2>
                {data.subscribers.length === 0 ? (
                  <p className="text-xs text-[#102C40]/65">No subscribers yet.</p>
                ) : (
                  <ul className="divide-y divide-[#E2E8F0] text-xs">
                    {data.subscribers.map((s) => (
                      <li key={s.id} className="py-2 flex justify-between">
                        <span>{s.email}</span>
                        <span className="text-[#102C40]/60 uppercase">{s.language}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* ARTICLES & SEO */}
          {data && section === 'articles' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (editingArticleId) {
                    await adminRequest(`/api/admin/articles/${editingArticleId}`, 'PUT', articleForm);
                    setEditingArticleId(null);
                  } else {
                    await adminRequest('/api/admin/articles', 'POST', articleForm);
                  }
                  setArticleForm({
                    titleEn: '',
                    titleBn: '',
                    slug: '',
                    excerptEn: '',
                    excerptBn: '',
                    contentEn: '',
                    contentBn: '',
                    categorySlug: data.categories[0]?.slug || 'city-lifestyle',
                    featuredImage: '/src/assets/images/hero_khulna_rupsha_1794914379194.jpg',
                    imageAltEn: '',
                    imageAltBn: '',
                    authorName: 'Khulna Vlogs Editorial',
                    readTimeMinutes: 5,
                    status: 'published',
                    isFeatured: false,
                    seoTitle: '',
                    seoDescription: '',
                  });
                }}
                className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-[#102C40]">
                    {editingArticleId ? 'Edit Article' : 'Create New Article'}
                  </h2>
                  {editingArticleId && (
                    <button
                      type="button"
                      onClick={() => setEditingArticleId(null)}
                      className="text-xs text-[#102C40]/70 hover:text-[#102C40]"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="English Title *"
                    value={articleForm.titleEn}
                    onChange={(e) => setArticleForm((f) => ({ ...f, titleEn: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                  <input
                    placeholder="Bangla Title"
                    value={articleForm.titleBn}
                    onChange={(e) => setArticleForm((f) => ({ ...f, titleBn: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    placeholder="URL Slug (optional)"
                    value={articleForm.slug}
                    onChange={(e) => setArticleForm((f) => ({ ...f, slug: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                  <select
                    value={articleForm.categorySlug}
                    onChange={(e) => setArticleForm((f) => ({ ...f, categorySlug: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  >
                    {data.categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.nameEn}
                      </option>
                    ))}
                  </select>
                  <select
                    value={articleForm.status}
                    onChange={(e) =>
                      setArticleForm((f) => ({
                        ...f,
                        status: e.target.value === 'draft' ? 'draft' : 'published',
                      }))
                    }
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="English Excerpt *"
                  value={articleForm.excerptEn}
                  onChange={(e) => setArticleForm((f) => ({ ...f, excerptEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <textarea
                  rows={2}
                  placeholder="Bangla Excerpt"
                  value={articleForm.excerptBn}
                  onChange={(e) => setArticleForm((f) => ({ ...f, excerptBn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <textarea
                  rows={5}
                  required
                  placeholder="Full English Article Content *"
                  value={articleForm.contentEn}
                  onChange={(e) => setArticleForm((f) => ({ ...f, contentEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <textarea
                  rows={4}
                  placeholder="Full Bangla Article Content"
                  value={articleForm.contentBn}
                  onChange={(e) => setArticleForm((f) => ({ ...f, contentBn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />

                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-2">
                  <label className="block text-xs font-semibold text-[#102C40]">
                    Featured Image (Upload or URL)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={articleForm.featuredImage}
                      onChange={(e) =>
                        setArticleForm((f) => ({ ...f, featuredImage: e.target.value }))
                      }
                      className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#E2E8F0] rounded cursor-pointer hover:border-[#39A9DB]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, (url) =>
                              setArticleForm((f) => ({ ...f, featuredImage: url }))
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    placeholder="Image Alt Text (SEO)"
                    value={articleForm.imageAltEn}
                    onChange={(e) => setArticleForm((f) => ({ ...f, imageAltEn: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-[#E2E8F0]">
                  <input
                    placeholder="SEO Title (50-60 chars recommended)"
                    value={articleForm.seoTitle}
                    onChange={(e) => setArticleForm((f) => ({ ...f, seoTitle: e.target.value }))}
                    className="px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                  <input
                    placeholder="SEO Meta Description (120-160 chars recommended)"
                    value={articleForm.seoDescription}
                    onChange={(e) =>
                      setArticleForm((f) => ({ ...f, seoDescription: e.target.value }))
                    }
                    className="px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#102C40] rounded-lg hover:bg-[#193F5B]"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingArticleId ? 'Update Article' : 'Save Article'}</span>
                </button>
              </form>

              <div className="lg:col-span-6 space-y-3">
                <h3 className="font-display text-lg font-bold text-[#102C40]">
                  All Articles ({data.articles.length})
                </h3>
                {data.articles.map((art) => (
                  <div
                    key={art.id}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-[#102C40]/60 mb-1">
                        {art.status.toUpperCase()} · {art.categorySlug}
                      </p>
                      <p className="font-display font-bold text-[#102C40] truncate">
                        {art.titleEn}
                      </p>
                      <p className="text-xs text-[#102C40]/65 truncate">/stories/{art.slug}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingArticleId(art.id);
                          setArticleForm({
                            titleEn: art.titleEn,
                            titleBn: art.titleBn,
                            slug: art.slug,
                            excerptEn: art.excerptEn,
                            excerptBn: art.excerptBn,
                            contentEn: art.contentEn,
                            contentBn: art.contentBn,
                            categorySlug: art.categorySlug,
                            featuredImage: art.featuredImage,
                            imageAltEn: art.imageAltEn,
                            imageAltBn: art.imageAltBn,
                            authorName: art.authorName,
                            readTimeMinutes: art.readTimeMinutes,
                            status: art.status,
                            isFeatured: art.isFeatured,
                            seoTitle: art.seoTitle || '',
                            seoDescription: art.seoDescription || '',
                          });
                        }}
                        className="p-2 text-[#102C40] hover:bg-[#F5F7FA] rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => adminRequest(`/api/admin/articles/${art.id}`, 'DELETE')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORIES */}
          {data && section === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await adminRequest('/api/admin/categories', 'POST', catForm);
                  setCatForm({
                    nameEn: '',
                    nameBn: '',
                    slug: '',
                    descriptionEn: '',
                    descriptionBn: '',
                    section: 'explore',
                    sortOrder: 0,
                  });
                }}
                className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-3 h-fit"
              >
                <h2 className="font-display text-lg font-bold text-[#102C40]">Add Category</h2>
                <input
                  required
                  placeholder="English Name *"
                  value={catForm.nameEn}
                  onChange={(e) => setCatForm((f) => ({ ...f, nameEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <input
                  placeholder="Bangla Name"
                  value={catForm.nameBn}
                  onChange={(e) => setCatForm((f) => ({ ...f, nameBn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <select
                  value={catForm.section}
                  onChange={(e) => setCatForm((f) => ({ ...f, section: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                >
                  <option value="explore">Explore</option>
                  <option value="food">Food</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="business">Business</option>
                </select>
                <textarea
                  rows={2}
                  placeholder="English Description"
                  value={catForm.descriptionEn}
                  onChange={(e) => setCatForm((f) => ({ ...f, descriptionEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#102C40] rounded-lg"
                >
                  Add Category
                </button>
              </form>

              <div className="lg:col-span-7 space-y-3">
                {data.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs text-[#102C40]/60">
                        {cat.section} · {cat.slug}
                      </p>
                      <p className="font-display font-bold text-[#102C40]">
                        {cat.nameEn} / {cat.nameBn}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => adminRequest(`/api/admin/categories/${cat.id}`, 'DELETE')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DESTINATIONS */}
          {data && section === 'destinations' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (editingDestId) {
                    await adminRequest(`/api/admin/destinations/${editingDestId}`, 'PUT', destForm);
                    setEditingDestId(null);
                  } else {
                    await adminRequest('/api/admin/destinations', 'POST', destForm);
                  }
                  setDestForm({
                    nameEn: '',
                    nameBn: '',
                    category: 'attraction',
                    summaryEn: '',
                    summaryBn: '',
                    descriptionEn: '',
                    descriptionBn: '',
                    locationText: 'Khulna, Bangladesh',
                    travelTipsEn: '',
                    travelTipsBn: '',
                    bestTimeEn: '',
                    bestTimeBn: '',
                    featuredImage: '/src/assets/images/dest_sundarbans_mangrove_1794914379796.jpg',
                    imageAlt: '',
                    isFeatured: false,
                    isHiddenGem: false,
                    isSampleData: false,
                    status: 'published',
                    seoTitle: '',
                    seoDescription: '',
                  });
                }}
                className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-3"
              >
                <h2 className="font-display text-lg font-bold text-[#102C40]">
                  {editingDestId ? 'Edit Destination' : 'Add Destination'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="English Name *"
                    value={destForm.nameEn}
                    onChange={(e) => setDestForm((f) => ({ ...f, nameEn: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                  <input
                    placeholder="Bangla Name"
                    value={destForm.nameBn}
                    onChange={(e) => setDestForm((f) => ({ ...f, nameBn: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={destForm.category}
                    onChange={(e) => setDestForm((f) => ({ ...f, category: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  >
                    <option value="attraction">Tourist Attraction</option>
                    <option value="river">River &amp; Bridge</option>
                    <option value="sundarbans">Sundarbans</option>
                    <option value="bagerhat">Bagerhat</option>
                    <option value="mongla">Mongla</option>
                    <option value="historical">Historical</option>
                    <option value="park">Park &amp; Recreation</option>
                    <option value="hidden_gem">Hidden Gem</option>
                  </select>
                  <input
                    placeholder="Location"
                    value={destForm.locationText}
                    onChange={(e) => setDestForm((f) => ({ ...f, locationText: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="English Summary *"
                  value={destForm.summaryEn}
                  onChange={(e) => setDestForm((f) => ({ ...f, summaryEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <textarea
                  rows={3}
                  placeholder="Full English Description"
                  value={destForm.descriptionEn}
                  onChange={(e) => setDestForm((f) => ({ ...f, descriptionEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={destForm.isHiddenGem}
                      onChange={(e) => setDestForm((f) => ({ ...f, isHiddenGem: e.target.checked }))}
                    />
                    Hidden Gem
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={destForm.isSampleData}
                      onChange={(e) => setDestForm((f) => ({ ...f, isSampleData: e.target.checked }))}
                    />
                    Sample Data
                  </label>
                  <select
                    value={destForm.status}
                    onChange={(e) =>
                      setDestForm((f) => ({
                        ...f,
                        status: e.target.value === 'draft' ? 'draft' : 'published',
                      }))
                    }
                    className="px-2 py-1 border border-[#E2E8F0] rounded"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={destForm.featuredImage}
                    onChange={(e) => setDestForm((f) => ({ ...f, featuredImage: e.target.value }))}
                    className="flex-1 px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                  <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-[#E2E8F0] rounded-lg cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(f, (url) => setDestForm((p) => ({ ...p, featuredImage: url })));
                      }}
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#102C40] rounded-lg"
                >
                  {editingDestId ? 'Update Destination' : 'Save Destination'}
                </button>
              </form>

              <div className="lg:col-span-6 space-y-3">
                {data.destinations.map((d) => (
                  <div
                    key={d.id}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-[#102C40]/60">
                        {d.status.toUpperCase()} · {d.category} · {d.locationText}
                      </p>
                      <p className="font-display font-bold text-[#102C40] truncate">{d.nameEn}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDestId(d.id);
                          setDestForm({
                            nameEn: d.nameEn,
                            nameBn: d.nameBn,
                            category: d.category,
                            summaryEn: d.summaryEn,
                            summaryBn: d.summaryBn,
                            descriptionEn: d.descriptionEn,
                            descriptionBn: d.descriptionBn,
                            locationText: d.locationText,
                            travelTipsEn: d.travelTipsEn || '',
                            travelTipsBn: d.travelTipsBn || '',
                            bestTimeEn: d.bestTimeEn || '',
                            bestTimeBn: d.bestTimeBn || '',
                            featuredImage: d.featuredImage,
                            imageAlt: d.imageAlt,
                            isFeatured: d.isFeatured,
                            isHiddenGem: d.isHiddenGem,
                            isSampleData: d.isSampleData,
                            status: d.status,
                            seoTitle: d.seoTitle || '',
                            seoDescription: d.seoDescription || '',
                          });
                        }}
                        className="p-2 text-[#102C40] hover:bg-[#F5F7FA] rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => adminRequest(`/api/admin/destinations/${d.id}`, 'DELETE')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESTAURANTS */}
          {data && section === 'restaurants' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (editingRestId) {
                    await adminRequest(`/api/admin/restaurants/${editingRestId}`, 'PUT', restForm);
                    setEditingRestId(null);
                  } else {
                    await adminRequest('/api/admin/restaurants', 'POST', restForm);
                  }
                  setRestForm({
                    nameEn: '',
                    nameBn: '',
                    cuisineType: 'local',
                    specialtyEn: '',
                    specialtyBn: '',
                    reviewEn: '',
                    reviewBn: '',
                    areaEn: 'Khulna City',
                    areaBn: 'খুলনা শহর',
                    address: '',
                    phone: '',
                    priceRange: '',
                    openingHours: '',
                    featuredImage: '/src/assets/images/food_khulna_chui_jhal_1794914380590.jpg',
                    imageAlt: '',
                    isFeatured: false,
                    isSampleData: false,
                    status: 'published',
                    seoTitle: '',
                    seoDescription: '',
                  });
                }}
                className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-3"
              >
                <h2 className="font-display text-lg font-bold text-[#102C40]">
                  {editingRestId ? 'Edit Restaurant' : 'Add Restaurant / Food Spot'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="English Name *"
                    value={restForm.nameEn}
                    onChange={(e) => setRestForm((f) => ({ ...f, nameEn: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                  <input
                    placeholder="Bangla Name"
                    value={restForm.nameBn}
                    onChange={(e) => setRestForm((f) => ({ ...f, nameBn: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={restForm.cuisineType}
                    onChange={(e) => setRestForm((f) => ({ ...f, cuisineType: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  >
                    <option value="local">Local Cuisine</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="street_food">Street Food</option>
                    <option value="sweets">Sweets</option>
                  </select>
                  <input
                    placeholder="Area (e.g., Shib Bari)"
                    value={restForm.areaEn}
                    onChange={(e) => setRestForm((f) => ({ ...f, areaEn: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <input
                  required
                  placeholder="Signature Dish / Specialty *"
                  value={restForm.specialtyEn}
                  onChange={(e) => setRestForm((f) => ({ ...f, specialtyEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <textarea
                  rows={2}
                  required
                  placeholder="Review / Notes *"
                  value={restForm.reviewEn}
                  onChange={(e) => setRestForm((f) => ({ ...f, reviewEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    placeholder="Verified Address (optional)"
                    value={restForm.address}
                    onChange={(e) => setRestForm((f) => ({ ...f, address: e.target.value }))}
                    className="px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                  <input
                    placeholder="Verified Phone (optional)"
                    value={restForm.phone}
                    onChange={(e) => setRestForm((f) => ({ ...f, phone: e.target.value }))}
                    className="px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                  <input
                    placeholder="Verified Price Info (optional)"
                    value={restForm.priceRange}
                    onChange={(e) => setRestForm((f) => ({ ...f, priceRange: e.target.value }))}
                    className="px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                  <input
                    placeholder="Verified Hours (optional)"
                    value={restForm.openingHours}
                    onChange={(e) => setRestForm((f) => ({ ...f, openingHours: e.target.value }))}
                    className="px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={restForm.featuredImage}
                    onChange={(e) => setRestForm((f) => ({ ...f, featuredImage: e.target.value }))}
                    className="flex-1 px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                  <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-[#E2E8F0] rounded-lg cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(f, (url) => setRestForm((p) => ({ ...p, featuredImage: url })));
                      }}
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#102C40] rounded-lg"
                >
                  {editingRestId ? 'Update Restaurant' : 'Save Restaurant'}
                </button>
              </form>

              <div className="lg:col-span-6 space-y-3">
                {data.restaurants.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-[#102C40]/60">
                        {r.cuisineType} · {r.areaEn}
                      </p>
                      <p className="font-display font-bold text-[#102C40] truncate">{r.nameEn}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRestId(r.id);
                          setRestForm({
                            nameEn: r.nameEn,
                            nameBn: r.nameBn,
                            cuisineType: r.cuisineType,
                            specialtyEn: r.specialtyEn,
                            specialtyBn: r.specialtyBn,
                            reviewEn: r.reviewEn,
                            reviewBn: r.reviewBn,
                            areaEn: r.areaEn,
                            areaBn: r.areaBn,
                            address: r.address || '',
                            phone: r.phone || '',
                            priceRange: r.priceRange || '',
                            openingHours: r.openingHours || '',
                            featuredImage: r.featuredImage,
                            imageAlt: r.imageAlt,
                            isFeatured: r.isFeatured,
                            isSampleData: r.isSampleData,
                            status: r.status,
                            seoTitle: r.seoTitle || '',
                            seoDescription: r.seoDescription || '',
                          });
                        }}
                        className="p-2 text-[#102C40] hover:bg-[#F5F7FA] rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => adminRequest(`/api/admin/restaurants/${r.id}`, 'DELETE')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BUSINESSES */}
          {data && section === 'businesses' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await adminRequest('/api/admin/businesses', 'POST', bizForm);
                  setBizForm({
                    nameEn: '',
                    nameBn: '',
                    businessType: 'shop',
                    descriptionEn: '',
                    descriptionBn: '',
                    area: 'Khulna City',
                    address: '',
                    phone: '',
                    websiteUrl: '',
                    mapQuery: '',
                    featuredImage: '/src/assets/images/lifestyle_khulna_street_1794914380876.jpg',
                    isFeatured: false,
                    isSampleData: false,
                    status: 'published',
                  });
                }}
                className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-3 h-fit"
              >
                <h2 className="font-display text-lg font-bold text-[#102C40]">
                  Add Business Listing
                </h2>
                <input
                  required
                  placeholder="Business Name (EN) *"
                  value={bizForm.nameEn}
                  onChange={(e) => setBizForm((f) => ({ ...f, nameEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <input
                  placeholder="Business Name (BN)"
                  value={bizForm.nameBn}
                  onChange={(e) => setBizForm((f) => ({ ...f, nameBn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <select
                  value={bizForm.businessType}
                  onChange={(e) => setBizForm((f) => ({ ...f, businessType: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                >
                  <option value="shop">Shop</option>
                  <option value="hotel">Hotel</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="service">Local Service</option>
                </select>
                <input
                  placeholder="Area (e.g., KDA Avenue, Khulna)"
                  value={bizForm.area}
                  onChange={(e) => setBizForm((f) => ({ ...f, area: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <textarea
                  rows={2}
                  required
                  placeholder="Description *"
                  value={bizForm.descriptionEn}
                  onChange={(e) => setBizForm((f) => ({ ...f, descriptionEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <input
                  placeholder="Verified Address (optional)"
                  value={bizForm.address}
                  onChange={(e) => setBizForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                />
                <input
                  placeholder="Verified Phone (optional)"
                  value={bizForm.phone}
                  onChange={(e) => setBizForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#102C40] rounded-lg"
                >
                  Save Business
                </button>
              </form>

              <div className="lg:col-span-7 space-y-3">
                {data.businesses.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs text-[#102C40]/60 capitalize">
                        {b.businessType} · {b.area}
                      </p>
                      <p className="font-display font-bold text-[#102C40]">{b.nameEn}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => adminRequest(`/api/admin/businesses/${b.id}`, 'DELETE')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YOUTUBE VIDEOS */}
          {data && section === 'videos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await adminRequest('/api/admin/videos', 'POST', videoForm);
                  setVideoForm({
                    titleEn: '',
                    titleBn: '',
                    youtubeUrl: '',
                    descriptionEn: '',
                    descriptionBn: '',
                    category: 'Travel Vlog',
                    isFeatured: true,
                    status: 'published',
                  });
                }}
                className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-3 h-fit"
              >
                <h2 className="font-display text-lg font-bold text-[#102C40]">Add YouTube Video</h2>
                <input
                  required
                  placeholder="Video Title (EN) *"
                  value={videoForm.titleEn}
                  onChange={(e) => setVideoForm((f) => ({ ...f, titleEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <input
                  placeholder="Video Title (BN)"
                  value={videoForm.titleBn}
                  onChange={(e) => setVideoForm((f) => ({ ...f, titleBn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <input
                  required
                  placeholder="YouTube URL (https://www.youtube.com/watch?v=...) *"
                  value={videoForm.youtubeUrl}
                  onChange={(e) => setVideoForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <input
                  placeholder="Category (e.g., Food Guide, Sundarbans)"
                  value={videoForm.category}
                  onChange={(e) => setVideoForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <textarea
                  rows={2}
                  placeholder="Description"
                  value={videoForm.descriptionEn}
                  onChange={(e) => setVideoForm((f) => ({ ...f, descriptionEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#102C40] rounded-lg"
                >
                  Add Video
                </button>
              </form>

              <div className="lg:col-span-7 space-y-3">
                {data.videos.map((v) => (
                  <div
                    key={v.id}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-[#102C40]/60">
                        {v.category} · {v.youtubeId ? `ID: ${v.youtubeId}` : 'Channel Link'}
                      </p>
                      <p className="font-display font-bold text-[#102C40] truncate">{v.titleEn}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => adminRequest(`/api/admin/videos/${v.id}`, 'DELETE')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EVENTS */}
          {data && section === 'events' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await adminRequest('/api/admin/events', 'POST', eventForm);
                  setEventForm({
                    titleEn: '',
                    titleBn: '',
                    eventType: 'cultural',
                    descriptionEn: '',
                    descriptionBn: '',
                    venueEn: 'Khulna, Bangladesh',
                    venueBn: 'খুলনা, বাংলাদেশ',
                    eventDate: '2027-04-14',
                    dateLabelEn: '',
                    dateLabelBn: '',
                    featuredImage: '/src/assets/images/lifestyle_khulna_street_1794914380876.jpg',
                    isSampleData: false,
                    status: 'published',
                  });
                }}
                className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-3 h-fit"
              >
                <h2 className="font-display text-lg font-bold text-[#102C40]">Add Event</h2>
                <input
                  required
                  placeholder="Event Title (EN) *"
                  value={eventForm.titleEn}
                  onChange={(e) => setEventForm((f) => ({ ...f, titleEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <input
                  placeholder="Event Title (BN)"
                  value={eventForm.titleBn}
                  onChange={(e) => setEventForm((f) => ({ ...f, titleBn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={eventForm.eventType}
                    onChange={(e) => setEventForm((f) => ({ ...f, eventType: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  >
                    <option value="festival">Festival</option>
                    <option value="cultural">Cultural</option>
                    <option value="fair">Fair</option>
                    <option value="exhibition">Exhibition</option>
                  </select>
                  <input
                    type="date"
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm((f) => ({ ...f, eventDate: e.target.value }))}
                    className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <input
                  placeholder="Venue (EN)"
                  value={eventForm.venueEn}
                  onChange={(e) => setEventForm((f) => ({ ...f, venueEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <textarea
                  rows={2}
                  required
                  placeholder="Description *"
                  value={eventForm.descriptionEn}
                  onChange={(e) => setEventForm((f) => ({ ...f, descriptionEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#102C40] rounded-lg"
                >
                  Save Event
                </button>
              </form>

              <div className="lg:col-span-7 space-y-3">
                {data.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs text-[#102C40]/60">
                        {ev.eventDate} · {ev.venueEn}
                      </p>
                      <p className="font-display font-bold text-[#102C40]">{ev.titleEn}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => adminRequest(`/api/admin/events/${ev.id}`, 'DELETE')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY */}
          {data && section === 'gallery' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await adminRequest('/api/admin/gallery', 'POST', galleryForm);
                  setGalleryForm({
                    titleEn: '',
                    titleBn: '',
                    captionEn: '',
                    captionBn: '',
                    locationEn: 'Khulna, Bangladesh',
                    locationBn: 'খুলনা, বাংলাদেশ',
                    mediaType: 'photo',
                    mediaUrl: '/src/assets/images/hero_khulna_rupsha_1794914379194.jpg',
                    category: 'Khulna',
                    isFeatured: true,
                    status: 'published',
                  });
                }}
                className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-3 h-fit"
              >
                <h2 className="font-display text-lg font-bold text-[#102C40]">
                  Add Gallery Photo / Media
                </h2>
                <input
                  required
                  placeholder="Title (EN) *"
                  value={galleryForm.titleEn}
                  onChange={(e) => setGalleryForm((f) => ({ ...f, titleEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <input
                  placeholder="Location (e.g., Rupsha Ghat)"
                  value={galleryForm.locationEn}
                  onChange={(e) => setGalleryForm((f) => ({ ...f, locationEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <input
                  placeholder="Category (e.g., Rivers, Heritage, Food)"
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <textarea
                  rows={2}
                  placeholder="Caption"
                  value={galleryForm.captionEn}
                  onChange={(e) => setGalleryForm((f) => ({ ...f, captionEn: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <div className="flex items-center gap-2">
                  <input
                    value={galleryForm.mediaUrl}
                    onChange={(e) => setGalleryForm((f) => ({ ...f, mediaUrl: e.target.value }))}
                    className="flex-1 px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                  <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-[#E2E8F0] rounded-lg cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(f, (url) => setGalleryForm((p) => ({ ...p, mediaUrl: url })));
                      }}
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#102C40] rounded-lg"
                >
                  Add to Gallery
                </button>
              </form>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.galleryItems.map((g) => (
                  <div
                    key={g.id}
                    className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col"
                  >
                    <img
                      src={g.mediaUrl}
                      alt={g.titleEn}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#102C40] truncate">
                        {g.titleEn}
                      </span>
                      <button
                        type="button"
                        onClick={() => adminRequest(`/api/admin/gallery/${g.id}`, 'DELETE')}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTACT MESSAGES */}
          {data && section === 'messages' && (
            <div className="space-y-4">
              {data.contacts.length === 0 ? (
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center text-sm text-[#102C40]/65">
                  No contact messages submitted yet.
                </div>
              ) : (
                data.contacts.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <p className="text-xs text-[#102C40]/60">
                        {c.status.toUpperCase()} · {c.name} ({c.email}) ·{' '}
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                      <h3 className="font-display font-bold text-[#102C40]">{c.subject}</h3>
                      <p className="text-sm text-[#102C40]/80 leading-relaxed">{c.message}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          adminRequest(`/api/admin/contacts/${c.id}`, 'PATCH', {
                            status: c.status === 'replied' ? 'read' : 'replied',
                          })
                        }
                        className="px-3 py-1.5 text-xs font-semibold border border-[#E2E8F0] rounded-lg hover:border-[#268B55]"
                      >
                        {c.status === 'replied' ? 'Mark Read' : 'Mark Replied'}
                      </button>
                      <button
                        type="button"
                        onClick={() => adminRequest(`/api/admin/contacts/${c.id}`, 'DELETE')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* WEBSITE SETTINGS */}
          {data && section === 'settings' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await adminRequest('/api/admin/settings', 'PUT', settingsForm);
              }}
              className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6 max-w-3xl"
            >
              <div>
                <h2 className="font-display text-xl font-bold text-[#102C40]">
                  General Website &amp; SEO Settings
                </h2>
                <p className="text-xs text-[#102C40]/65 mt-1">
                  Updates here immediately reflect on the public Khulna Vlogs website.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#102C40] mb-1">
                    Brand Name
                  </label>
                  <input
                    value={settingsForm.siteName}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, siteName: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102C40] mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settingsForm.contactEmail}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, contactEmail: e.target.value }))}
                    placeholder="editorial@khulnavlogs.com"
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102C40] mb-1">
                    Tagline (English)
                  </label>
                  <input
                    value={settingsForm.taglineEn}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, taglineEn: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102C40] mb-1">
                    Tagline (Bangla)
                  </label>
                  <input
                    value={settingsForm.taglineBn}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, taglineBn: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102C40] mb-1">
                    Hero Headline (English)
                  </label>
                  <input
                    value={settingsForm.heroHeadlineEn}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, heroHeadlineEn: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102C40] mb-1">
                    Hero Headline (Bangla)
                  </label>
                  <input
                    value={settingsForm.heroHeadlineBn}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, heroHeadlineBn: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102C40] mb-1">
                    Hero Subtitle (English)
                  </label>
                  <input
                    value={settingsForm.heroSubtitleEn}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, heroSubtitleEn: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102C40] mb-1">
                    Hero Subtitle (Bangla)
                  </label>
                  <input
                    value={settingsForm.heroSubtitleBn}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, heroSubtitleBn: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102C40] mb-1">
                    Facebook Page URL
                  </label>
                  <input
                    value={settingsForm.facebookUrl}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, facebookUrl: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102C40] mb-1">
                    YouTube Channel URL
                  </label>
                  <input
                    value={settingsForm.youtubeUrl}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, youtubeUrl: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
                <div>
                  <label className="block text-xs font-semibold text-[#102C40] mb-1">
                    Default SEO Page Title
                  </label>
                  <input
                    value={settingsForm.defaultSeoTitle}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, defaultSeoTitle: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102C40] mb-1">
                    Default SEO Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.defaultSeoDescription}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, defaultSeoDescription: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold text-[#102C40] bg-[#F5C542] hover:bg-[#e5b535] rounded-lg transition-colors"
              >
                Save Website Settings
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
