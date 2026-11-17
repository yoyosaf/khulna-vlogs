import { useState } from 'react';
import { ArrowLeft, Check, Copy, Share2 } from 'lucide-react';
import { Article, Language, PageRoute } from '../types';
import { FACEBOOK_URL, copy } from '../i18n/translations';
import { ResilientImage } from './ResilientImage';
import { SeoHead } from './SeoHead';

interface ArticleDetailViewProps {
  article: Article;
  relatedArticles: Article[];
  lang: Language;
  onNavigate: (page: PageRoute, slug?: string) => void;
}

export function ArticleDetailView({
  article,
  relatedArticles,
  lang,
  onNavigate,
}: ArticleDetailViewProps) {
  const t = copy[lang];
  const [copied, setCopied] = useState(false);

  const title = lang === 'bn' ? article.titleBn : article.titleEn;
  const excerpt = lang === 'bn' ? article.excerptBn : article.excerptEn;
  const content = lang === 'bn' ? article.contentBn : article.contentEn;
  const imageAlt = lang === 'bn' ? article.imageAltBn : article.imageAltEn;

  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const shareUrl = `${window.location.origin}/stories/${article.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    lang === 'bn' ? 'bn-BD' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <article className="py-10 sm:py-14 bg-[#FBF9F5]">
      <SeoHead
        title={article.seoTitle || `${title} | Khulna Vlogs`}
        description={article.seoDescription || excerpt}
        canonicalPath={`/stories/${article.slug}`}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description: excerpt,
            image: article.featuredImage,
            author: {
              '@type': 'Organization',
              name: article.authorName,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Khulna Vlogs',
            },
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: window.location.origin,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: title,
                item: shareUrl,
              },
            ],
          },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-[#102C40]/65">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-[#102C40] font-medium hover:text-[#39A9DB] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.common.backHome}</span>
          </button>
          <span aria-hidden="true">/</span>
          <span className="capitalize">{article.categorySlug.replace(/-/g, ' ')}</span>
          <span aria-hidden="true">/</span>
          <span className="truncate max-w-[220px]">{title}</span>
        </nav>

        {/* Unboxed Editorial Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#102C40]/65 mb-4">
          <span className="font-semibold text-[#268B55] capitalize">
            {article.categorySlug.replace(/-/g, ' ')}
          </span>
          <span aria-hidden="true">·</span>
          <span>{article.authorName}</span>
          <span aria-hidden="true">·</span>
          <span>{formattedDate}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-num">
            {article.readTimeMinutes} {t.common.minRead}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102C40] leading-tight text-balance mb-5">
          {title}
        </h1>

        <p className="text-lg text-[#102C40]/80 leading-relaxed mb-8 max-w-2xl">
          {excerpt}
        </p>

        {/* Share Toolbar */}
        <div className="flex flex-wrap items-center gap-3 pb-8 mb-8 border-b border-[#E7E2D8]">
          <span className="text-xs font-semibold text-[#102C40]/70 inline-flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            {t.common.shareStory}:
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-[#E7E2D8] rounded-md hover:border-[#102C40] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#268B55]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.common.linkCopied : t.common.copyLink}</span>
          </button>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-[#102C40] text-white rounded-md hover:bg-[#193F5B] transition-colors"
          >
            Facebook
          </a>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-white border border-[#E7E2D8] text-[#102C40] rounded-md hover:border-[#39A9DB] transition-colors"
          >
            @thekhulnavlogs
          </a>
        </div>

        {/* Hero Photography */}
        <figure className="mb-10">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#E7E2D8] bg-white">
            <ResilientImage
              src={article.featuredImage}
              alt={imageAlt}
              fallbackTitle={title}
              className="w-full h-full object-cover"
            />
          </div>
          <figcaption className="mt-2.5 text-xs italic text-[#102C40]/60">
            {imageAlt}
          </figcaption>
        </figure>

        {/* Optimal 65-75ch Editorial Reading Column */}
        <div className="max-w-2xl mx-auto space-y-6 text-[16px] sm:text-[17px] leading-[1.8] text-[#102C40]/90">
          {paragraphs.map((para, index) => (
            <p
              key={index}
              className={
                index === 0
                  ? 'first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#102C40]'
                  : ''
              }
            >
              {para}
            </p>
          ))}
        </div>

        {/* Related Stories */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#E7E2D8]">
            <h2 className="font-display text-2xl font-bold text-[#102C40] mb-6">
              {t.sections.storiesTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.slice(0, 2).map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => {
                    onNavigate('article', rel.slug);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left group bg-white border border-[#E7E2D8] rounded-xl overflow-hidden hover:border-[#39A9DB] transition-colors"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden">
                    <ResilientImage
                      src={rel.featuredImage}
                      alt={lang === 'bn' ? rel.imageAltBn : rel.imageAltEn}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-[#102C40]/60 mb-1.5">
                      {rel.categorySlug.replace(/-/g, ' ')} · {rel.readTimeMinutes} {t.common.minRead}
                    </p>
                    <h3 className="font-display text-lg font-bold text-[#102C40] group-hover:text-[#39A9DB] transition-colors">
                      {lang === 'bn' ? rel.titleBn : rel.titleEn}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
