import express from 'express';
import { asc, desc, eq, ilike, or } from 'drizzle-orm';
import { db, isPostgresConfigured } from '../db/index';
import {
  articles,
  businesses,
  categories,
  contactSubmissions,
  destinations,
  events,
  galleryItems,
  mediaUploads,
  newsletterSubscribers,
  restaurants,
  siteSettings,
  users,
  videos,
} from '../db/schema';
import { ensureSeeded } from '../db/seed';
import { isSuperAdminEmail } from '../db/users';
import { AuthRequest, requireAdmin, requireAuth } from '../middleware/auth';

function extractYoutubeId(url: string): string {
  if (!url) return '';
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const regex of patterns) {
    const match = url.match(regex);
    if (match && match[1]) return match[1];
  }
  return '';
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80) || `item-${Date.now()}`
  );
}

function requireDatabase(
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!isPostgresConfigured()) {
    return res.status(503).json({
      error:
        'PostgreSQL database is not configured for this environment. Set SQL_HOST, SQL_USER, SQL_PASSWORD, and SQL_DB_NAME in environment variables.',
    });
  }
  next();
}

export function createApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Vercel backend is running',
      storage: isPostgresConfigured() ? 'postgres' : 'unconfigured',
    });
  });

  // SEO: robots.txt
  app.get('/robots.txt', (req, res) => {
    const baseUrl =
      process.env.APP_URL?.replace(/\/$/, '') ||
      `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
  });

  // SEO: dynamic XML sitemap
  const handleSitemap = async (req: express.Request, res: express.Response) => {
    try {
      const baseUrl =
        process.env.APP_URL?.replace(/\/$/, '') ||
        `${req.protocol}://${req.get('host')}`;

      const staticRoutes = [
        '/',
        '/explore',
        '/food',
        '/travel',
        '/lifestyle',
        '/directory',
        '/events',
        '/gallery',
        '/about',
        '/contact',
      ];

      const urls: string[] = [];
      for (const route of staticRoutes) {
        urls.push(
          `<url><loc>${baseUrl}${route}</loc><changefreq>weekly</changefreq><priority>${
            route === '/' ? '1.0' : '0.8'
          }</priority></url>`
        );
      }

      if (isPostgresConfigured()) {
        await ensureSeeded();
        const [pubArticles, pubDest, pubRest, pubBiz, pubEvents] =
          await Promise.all([
            db
              .select({ slug: articles.slug, updatedAt: articles.updatedAt })
              .from(articles)
              .where(eq(articles.status, 'published')),
            db
              .select({ slug: destinations.slug })
              .from(destinations)
              .where(eq(destinations.status, 'published')),
            db
              .select({ slug: restaurants.slug })
              .from(restaurants)
              .where(eq(restaurants.status, 'published')),
            db
              .select({ slug: businesses.slug })
              .from(businesses)
              .where(eq(businesses.status, 'published')),
            db
              .select({ slug: events.slug })
              .from(events)
              .where(eq(events.status, 'published')),
          ]);

        for (const a of pubArticles) {
          urls.push(
            `<url><loc>${baseUrl}/stories/${a.slug}</loc><lastmod>${a.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`
          );
        }
        for (const d of pubDest) {
          urls.push(
            `<url><loc>${baseUrl}/explore/${d.slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`
          );
        }
        for (const r of pubRest) {
          urls.push(
            `<url><loc>${baseUrl}/food/${r.slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`
          );
        }
        for (const b of pubBiz) {
          urls.push(
            `<url><loc>${baseUrl}/directory/${b.slug}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`
          );
        }
        for (const e of pubEvents) {
          urls.push(
            `<url><loc>${baseUrl}/events/${e.slug}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`
          );
        }
      }

      res.type('application/xml').send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
          '\n'
        )}\n</urlset>`
      );
    } catch (error) {
      console.error('Sitemap generation failed:', error);
      res.status(500).type('text/plain').send('Error generating sitemap');
    }
  };

  app.get('/sitemap.xml', handleSitemap);
  app.get('/api/sitemap', handleSitemap);

  // Public media serving from PostgreSQL
  app.get('/api/media/:id', requireDatabase, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ error: 'Invalid media ID' });
      }
      const rows = await db
        .select()
        .from(mediaUploads)
        .where(eq(mediaUploads.id, id))
        .limit(1);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Media not found' });
      }
      const item = rows[0];
      const buffer = Buffer.from(item.dataBase64, 'base64');
      res.setHeader('Content-Type', item.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(buffer);
    } catch (error) {
      console.error('Error serving media:', error);
      res.status(500).json({ error: 'Failed to load media' });
    }
  });

  // Public bootstrap data
  app.get('/api/public/bootstrap', requireDatabase, async (_req, res) => {
    try {
      await ensureSeeded();
      const [
        cats,
        arts,
        dests,
        rests,
        biz,
        vids,
        evts,
        gallery,
        settingsRows,
      ] = await Promise.all([
        db.select().from(categories).orderBy(asc(categories.sortOrder)),
        db
          .select()
          .from(articles)
          .where(eq(articles.status, 'published'))
          .orderBy(desc(articles.publishedAt)),
        db
          .select()
          .from(destinations)
          .where(eq(destinations.status, 'published'))
          .orderBy(desc(destinations.isFeatured), asc(destinations.id)),
        db
          .select()
          .from(restaurants)
          .where(eq(restaurants.status, 'published'))
          .orderBy(desc(restaurants.isFeatured), asc(restaurants.id)),
        db
          .select()
          .from(businesses)
          .where(eq(businesses.status, 'published'))
          .orderBy(desc(businesses.isFeatured), asc(businesses.id)),
        db
          .select()
          .from(videos)
          .where(eq(videos.status, 'published'))
          .orderBy(desc(videos.isFeatured), desc(videos.publishedAt)),
        db
          .select()
          .from(events)
          .where(eq(events.status, 'published'))
          .orderBy(asc(events.eventDate)),
        db
          .select()
          .from(galleryItems)
          .where(eq(galleryItems.status, 'published'))
          .orderBy(desc(galleryItems.isFeatured), desc(galleryItems.createdAt)),
        db.select().from(siteSettings).limit(1),
      ]);

      res.json({
        categories: cats,
        articles: arts,
        destinations: dests,
        restaurants: rests,
        businesses: biz,
        videos: vids,
        events: evts,
        galleryItems: gallery,
        settings: settingsRows[0] || null,
      });
    } catch (error) {
      console.error('Bootstrap error:', error);
      res.status(500).json({ error: 'Failed to load Khulna Vlogs content' });
    }
  });

  // Public search
  app.get('/api/public/search', requireDatabase, async (req, res) => {
    try {
      await ensureSeeded();
      const q = String(req.query.q || '').trim();
      if (!q) {
        return res.json({
          articles: [],
          destinations: [],
          restaurants: [],
          businesses: [],
          events: [],
        });
      }
      const pattern = `%${q}%`;
      const [arts, dests, rests, biz, evts] = await Promise.all([
        db
          .select()
          .from(articles)
          .where(
            or(
              ilike(articles.titleEn, pattern),
              ilike(articles.titleBn, pattern),
              ilike(articles.excerptEn, pattern),
              ilike(articles.excerptBn, pattern)
            )
          )
          .limit(10),
        db
          .select()
          .from(destinations)
          .where(
            or(
              ilike(destinations.nameEn, pattern),
              ilike(destinations.nameBn, pattern),
              ilike(destinations.summaryEn, pattern),
              ilike(destinations.locationText, pattern)
            )
          )
          .limit(10),
        db
          .select()
          .from(restaurants)
          .where(
            or(
              ilike(restaurants.nameEn, pattern),
              ilike(restaurants.nameBn, pattern),
              ilike(restaurants.specialtyEn, pattern),
              ilike(restaurants.areaEn, pattern)
            )
          )
          .limit(10),
        db
          .select()
          .from(businesses)
          .where(
            or(
              ilike(businesses.nameEn, pattern),
              ilike(businesses.nameBn, pattern),
              ilike(businesses.area, pattern)
            )
          )
          .limit(10),
        db
          .select()
          .from(events)
          .where(
            or(
              ilike(events.titleEn, pattern),
              ilike(events.titleBn, pattern),
              ilike(events.venueEn, pattern)
            )
          )
          .limit(10),
      ]);

      res.json({
        articles: arts.filter((a) => a.status === 'published'),
        destinations: dests.filter((d) => d.status === 'published'),
        restaurants: rests.filter((r) => r.status === 'published'),
        businesses: biz.filter((b) => b.status === 'published'),
        events: evts.filter((e) => e.status === 'published'),
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Public contact form
  app.post('/api/public/contact', requireDatabase, async (req, res) => {
    try {
      const { name, email, subject, message } = req.body || {};
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      const inserted = await db
        .insert(contactSubmissions)
        .values({
          name: String(name).slice(0, 120),
          email: String(email).slice(0, 160),
          subject: String(subject).slice(0, 200),
          message: String(message).slice(0, 4000),
        })
        .returning();
      res.status(201).json({ ok: true, id: inserted[0].id });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ error: 'Failed to submit message' });
    }
  });

  // Public newsletter subscribe
  app.post('/api/public/newsletter', requireDatabase, async (req, res) => {
    try {
      const { email, language } = req.body || {};
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
      }
      await db
        .insert(newsletterSubscribers)
        .values({
          email: cleanEmail.slice(0, 160),
          language: language === 'bn' ? 'bn' : 'en',
        })
        .onConflictDoUpdate({
          target: newsletterSubscribers.email,
          set: { language: language === 'bn' ? 'bn' : 'en' },
        });
      res.status(201).json({ ok: true });
    } catch (error) {
      console.error('Newsletter error:', error);
      res.status(500).json({ error: 'Subscription failed' });
    }
  });

  // Auth verification
  app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
    res.json({ user: req.dbUser });
  });

  // Admin overview (all items including drafts)
  app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
    try {
      await ensureSeeded();
      const [
        cats,
        arts,
        dests,
        rests,
        biz,
        vids,
        evts,
        gallery,
        contacts,
        subscribers,
        allUsers,
        settingsRows,
      ] = await Promise.all([
        db.select().from(categories).orderBy(asc(categories.sortOrder)),
        db.select().from(articles).orderBy(desc(articles.updatedAt)),
        db.select().from(destinations).orderBy(desc(destinations.createdAt)),
        db.select().from(restaurants).orderBy(desc(restaurants.createdAt)),
        db.select().from(businesses).orderBy(desc(businesses.createdAt)),
        db.select().from(videos).orderBy(desc(videos.createdAt)),
        db.select().from(events).orderBy(asc(events.eventDate)),
        db.select().from(galleryItems).orderBy(desc(galleryItems.createdAt)),
        db
          .select()
          .from(contactSubmissions)
          .orderBy(desc(contactSubmissions.createdAt)),
        db
          .select()
          .from(newsletterSubscribers)
          .orderBy(desc(newsletterSubscribers.createdAt)),
        db.select().from(users).orderBy(asc(users.createdAt)),
        db.select().from(siteSettings).limit(1),
      ]);

      res.json({
        categories: cats,
        articles: arts,
        destinations: dests,
        restaurants: rests,
        businesses: biz,
        videos: vids,
        events: evts,
        galleryItems: gallery,
        contacts,
        subscribers,
        users: allUsers,
        settings: settingsRows[0] || null,
      });
    } catch (error) {
      console.error('Admin overview error:', error);
      res.status(500).json({ error: 'Failed to load admin overview' });
    }
  });

  // Admin image upload -> stored in PostgreSQL media_uploads
  app.post('/api/admin/media', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { filename, mimeType, dataBase64 } = req.body || {};
      if (!filename || !mimeType || !dataBase64) {
        return res.status(400).json({ error: 'Missing file payload' });
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(mimeType)) {
        return res.status(400).json({ error: 'Unsupported image format' });
      }
      const cleanedBase64 = String(dataBase64).replace(/^data:[^;]+;base64,/, '');
      const inserted = await db
        .insert(mediaUploads)
        .values({
          filename: String(filename).slice(0, 120),
          mimeType,
          dataBase64: cleanedBase64,
          uploadedBy: req.dbUser?.email || 'admin',
        })
        .returning({ id: mediaUploads.id });

      res.status(201).json({ url: `/api/media/${inserted[0].id}` });
    } catch (error) {
      console.error('Media upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });

  // Admin CRUD: Articles
  app.post('/api/admin/articles', requireAdmin, async (req, res) => {
    try {
      const b = req.body || {};
      const slug = b.slug ? slugify(b.slug) : slugify(b.titleEn || 'story');
      const created = await db
        .insert(articles)
        .values({
          slug,
          titleEn: b.titleEn,
          titleBn: b.titleBn || b.titleEn,
          excerptEn: b.excerptEn || '',
          excerptBn: b.excerptBn || b.excerptEn || '',
          contentEn: b.contentEn || '',
          contentBn: b.contentBn || b.contentEn || '',
          categorySlug: b.categorySlug || 'city-lifestyle',
          featuredImage:
            b.featuredImage || '/src/assets/images/hero_khulna_rupsha_1794914379194.jpg',
          imageAltEn: b.imageAltEn || b.titleEn,
          imageAltBn: b.imageAltBn || b.titleBn || b.titleEn,
          authorName: b.authorName || 'Khulna Vlogs Editorial',
          readTimeMinutes: Number(b.readTimeMinutes) || 5,
          status: b.status === 'draft' ? 'draft' : 'published',
          isFeatured: Boolean(b.isFeatured),
          seoTitle: b.seoTitle || b.titleEn,
          seoDescription: b.seoDescription || b.excerptEn,
        })
        .returning();
      res.status(201).json(created[0]);
    } catch (error) {
      console.error('Create article error:', error);
      res.status(500).json({ error: 'Failed to create article' });
    }
  });

  app.put('/api/admin/articles/:id', requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const b = req.body || {};
      const updated = await db
        .update(articles)
        .set({
          slug: b.slug ? slugify(b.slug) : undefined,
          titleEn: b.titleEn,
          titleBn: b.titleBn,
          excerptEn: b.excerptEn,
          excerptBn: b.excerptBn,
          contentEn: b.contentEn,
          contentBn: b.contentBn,
          categorySlug: b.categorySlug,
          featuredImage: b.featuredImage,
          imageAltEn: b.imageAltEn,
          imageAltBn: b.imageAltBn,
          authorName: b.authorName,
          readTimeMinutes: Number(b.readTimeMinutes) || 5,
          status: b.status === 'draft' ? 'draft' : 'published',
          isFeatured: Boolean(b.isFeatured),
          seoTitle: b.seoTitle,
          seoDescription: b.seoDescription,
          updatedAt: new Date(),
        })
        .where(eq(articles.id, id))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      console.error('Update article error:', error);
      res.status(500).json({ error: 'Failed to update article' });
    }
  });

  app.delete('/api/admin/articles/:id', requireAdmin, async (req, res) => {
    try {
      await db.delete(articles).where(eq(articles.id, Number(req.params.id)));
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete article error:', error);
      res.status(500).json({ error: 'Failed to delete article' });
    }
  });

  // Admin CRUD: Categories
  app.post('/api/admin/categories', requireAdmin, async (req, res) => {
    try {
      const b = req.body || {};
      const created = await db
        .insert(categories)
        .values({
          slug: slugify(b.slug || b.nameEn || 'category'),
          nameEn: b.nameEn,
          nameBn: b.nameBn || b.nameEn,
          descriptionEn: b.descriptionEn || '',
          descriptionBn: b.descriptionBn || b.descriptionEn || '',
          section: b.section || 'explore',
          sortOrder: Number(b.sortOrder) || 0,
        })
        .returning();
      res.status(201).json(created[0]);
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  });

  app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
      await db.delete(categories).where(eq(categories.id, Number(req.params.id)));
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // Admin CRUD: Destinations
  app.post('/api/admin/destinations', requireAdmin, async (req, res) => {
    try {
      const b = req.body || {};
      const created = await db
        .insert(destinations)
        .values({
          slug: slugify(b.slug || b.nameEn || 'destination'),
          nameEn: b.nameEn,
          nameBn: b.nameBn || b.nameEn,
          category: b.category || 'attraction',
          summaryEn: b.summaryEn || '',
          summaryBn: b.summaryBn || b.summaryEn || '',
          descriptionEn: b.descriptionEn || b.summaryEn || '',
          descriptionBn: b.descriptionBn || b.summaryBn || '',
          locationText: b.locationText || 'Khulna, Bangladesh',
          travelTipsEn: b.travelTipsEn || null,
          travelTipsBn: b.travelTipsBn || null,
          bestTimeEn: b.bestTimeEn || null,
          bestTimeBn: b.bestTimeBn || null,
          featuredImage:
            b.featuredImage || '/src/assets/images/dest_sundarbans_mangrove_1794914379796.jpg',
          imageAlt: b.imageAlt || b.nameEn,
          isFeatured: Boolean(b.isFeatured),
          isHiddenGem: Boolean(b.isHiddenGem),
          isSampleData: Boolean(b.isSampleData),
          status: b.status === 'draft' ? 'draft' : 'published',
          seoTitle: b.seoTitle || b.nameEn,
          seoDescription: b.seoDescription || b.summaryEn,
        })
        .returning();
      res.status(201).json(created[0]);
    } catch (error) {
      console.error('Create destination error:', error);
      res.status(500).json({ error: 'Failed to create destination' });
    }
  });

  app.put('/api/admin/destinations/:id', requireAdmin, async (req, res) => {
    try {
      const b = req.body || {};
      const updated = await db
        .update(destinations)
        .set({
          nameEn: b.nameEn,
          nameBn: b.nameBn,
          category: b.category,
          summaryEn: b.summaryEn,
          summaryBn: b.summaryBn,
          descriptionEn: b.descriptionEn,
          descriptionBn: b.descriptionBn,
          locationText: b.locationText,
          travelTipsEn: b.travelTipsEn,
          travelTipsBn: b.travelTipsBn,
          bestTimeEn: b.bestTimeEn,
          bestTimeBn: b.bestTimeBn,
          featuredImage: b.featuredImage,
          imageAlt: b.imageAlt,
          isFeatured: Boolean(b.isFeatured),
          isHiddenGem: Boolean(b.isHiddenGem),
          isSampleData: Boolean(b.isSampleData),
          status: b.status === 'draft' ? 'draft' : 'published',
          seoTitle: b.seoTitle,
          seoDescription: b.seoDescription,
        })
        .where(eq(destinations.id, Number(req.params.id)))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      console.error('Update destination error:', error);
      res.status(500).json({ error: 'Failed to update destination' });
    }
  });

  app.delete('/api/admin/destinations/:id', requireAdmin, async (req, res) => {
    try {
      await db.delete(destinations).where(eq(destinations.id, Number(req.params.id)));
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete destination error:', error);
      res.status(500).json({ error: 'Failed to delete destination' });
    }
  });

  // Admin CRUD: Restaurants
  app.post('/api/admin/restaurants', requireAdmin, async (req, res) => {
    try {
      const b = req.body || {};
      const created = await db
        .insert(restaurants)
        .values({
          slug: slugify(b.slug || b.nameEn || 'restaurant'),
          nameEn: b.nameEn,
          nameBn: b.nameBn || b.nameEn,
          cuisineType: b.cuisineType || 'local',
          specialtyEn: b.specialtyEn || '',
          specialtyBn: b.specialtyBn || b.specialtyEn || '',
          reviewEn: b.reviewEn || '',
          reviewBn: b.reviewBn || b.reviewEn || '',
          areaEn: b.areaEn || 'Khulna City',
          areaBn: b.areaBn || 'খুলনা শহর',
          address: b.address || null,
          phone: b.phone || null,
          priceRange: b.priceRange || null,
          openingHours: b.openingHours || null,
          featuredImage:
            b.featuredImage || '/src/assets/images/food_khulna_chui_jhal_1794914380590.jpg',
          imageAlt: b.imageAlt || b.nameEn,
          isFeatured: Boolean(b.isFeatured),
          isSampleData: Boolean(b.isSampleData),
          status: b.status === 'draft' ? 'draft' : 'published',
          seoTitle: b.seoTitle || b.nameEn,
          seoDescription: b.seoDescription || b.specialtyEn,
        })
        .returning();
      res.status(201).json(created[0]);
    } catch (error) {
      console.error('Create restaurant error:', error);
      res.status(500).json({ error: 'Failed to create restaurant' });
    }
  });

  app.put('/api/admin/restaurants/:id', requireAdmin, async (req, res) => {
    try {
      const b = req.body || {};
      const updated = await db
        .update(restaurants)
        .set({
          nameEn: b.nameEn,
          nameBn: b.nameBn,
          cuisineType: b.cuisineType,
          specialtyEn: b.specialtyEn,
          specialtyBn: b.specialtyBn,
          reviewEn: b.reviewEn,
          reviewBn: b.reviewBn,
          areaEn: b.areaEn,
          areaBn: b.areaBn,
          address: b.address || null,
          phone: b.phone || null,
          priceRange: b.priceRange || null,
          openingHours: b.openingHours || null,
          featuredImage: b.featuredImage,
          imageAlt: b.imageAlt,
          isFeatured: Boolean(b.isFeatured),
          isSampleData: Boolean(b.isSampleData),
          status: b.status === 'draft' ? 'draft' : 'published',
          seoTitle: b.seoTitle,
          seoDescription: b.seoDescription,
        })
        .where(eq(restaurants.id, Number(req.params.id)))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      console.error('Update restaurant error:', error);
      res.status(500).json({ error: 'Failed to update restaurant' });
    }
  });

  app.delete('/api/admin/restaurants/:id', requireAdmin, async (req, res) => {
    try {
      await db.delete(restaurants).where(eq(restaurants.id, Number(req.params.id)));
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete restaurant error:', error);
      res.status(500).json({ error: 'Failed to delete restaurant' });
    }
  });

  // Admin CRUD: Businesses
  app.post('/api/admin/businesses', requireAdmin, async (req, res) => {
    try {
      const b = req.body || {};
      const created = await db
        .insert(businesses)
        .values({
          slug: slugify(b.slug || b.nameEn || 'business'),
          nameEn: b.nameEn,
          nameBn: b.nameBn || b.nameEn,
          businessType: b.businessType || 'shop',
          descriptionEn: b.descriptionEn || '',
          descriptionBn: b.descriptionBn || b.descriptionEn || '',
          area: b.area || 'Khulna City',
          address: b.address || null,
          phone: b.phone || null,
          websiteUrl: b.websiteUrl || null,
          mapQuery: b.mapQuery || `${b.nameEn} Khulna Bangladesh`,
          featuredImage:
            b.featuredImage || '/src/assets/images/lifestyle_khulna_street_1794914380876.jpg',
          isFeatured: Boolean(b.isFeatured),
          isSampleData: Boolean(b.isSampleData),
          status: b.status === 'draft' ? 'draft' : 'published',
        })
        .returning();
      res.status(201).json(created[0]);
    } catch (error) {
      console.error('Create business error:', error);
      res.status(500).json({ error: 'Failed to create business' });
    }
  });

  app.delete('/api/admin/businesses/:id', requireAdmin, async (req, res) => {
    try {
      await db.delete(businesses).where(eq(businesses.id, Number(req.params.id)));
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete business error:', error);
      res.status(500).json({ error: 'Failed to delete business' });
    }
  });

  // Admin CRUD: Videos
  app.post('/api/admin/videos', requireAdmin, async (req, res) => {
    try {
      const b = req.body || {};
      const youtubeId = extractYoutubeId(b.youtubeUrl || '');
      const created = await db
        .insert(videos)
        .values({
          titleEn: b.titleEn,
          titleBn: b.titleBn || b.titleEn,
          youtubeUrl: b.youtubeUrl,
          youtubeId,
          descriptionEn: b.descriptionEn || '',
          descriptionBn: b.descriptionBn || b.descriptionEn || '',
          category: b.category || 'Travel Vlog',
          isFeatured: Boolean(b.isFeatured),
          status: b.status === 'draft' ? 'draft' : 'published',
        })
        .returning();
      res.status(201).json(created[0]);
    } catch (error) {
      console.error('Create video error:', error);
      res.status(500).json({ error: 'Failed to add video' });
    }
  });

  app.delete('/api/admin/videos/:id', requireAdmin, async (req, res) => {
    try {
      await db.delete(videos).where(eq(videos.id, Number(req.params.id)));
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete video error:', error);
      res.status(500).json({ error: 'Failed to delete video' });
    }
  });

  // Admin CRUD: Events
  app.post('/api/admin/events', requireAdmin, async (req, res) => {
    try {
      const b = req.body || {};
      const created = await db
        .insert(events)
        .values({
          slug: slugify(b.slug || b.titleEn || 'event'),
          titleEn: b.titleEn,
          titleBn: b.titleBn || b.titleEn,
          eventType: b.eventType || 'cultural',
          descriptionEn: b.descriptionEn || '',
          descriptionBn: b.descriptionBn || b.descriptionEn || '',
          venueEn: b.venueEn || 'Khulna, Bangladesh',
          venueBn: b.venueBn || 'খুলনা, বাংলাদেশ',
          eventDate: b.eventDate || new Date().toISOString().slice(0, 10),
          dateLabelEn: b.dateLabelEn || b.eventDate || 'Upcoming',
          dateLabelBn: b.dateLabelBn || b.dateLabelEn || 'আসন্ন',
          featuredImage:
            b.featuredImage || '/src/assets/images/lifestyle_khulna_street_1794914380876.jpg',
          isSampleData: Boolean(b.isSampleData),
          status: b.status === 'draft' ? 'draft' : 'published',
        })
        .returning();
      res.status(201).json(created[0]);
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  });

  app.delete('/api/admin/events/:id', requireAdmin, async (req, res) => {
    try {
      await db.delete(events).where(eq(events.id, Number(req.params.id)));
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  });

  // Admin CRUD: Gallery
  app.post('/api/admin/gallery', requireAdmin, async (req, res) => {
    try {
      const b = req.body || {};
      const youtubeId =
        b.mediaType === 'video' ? extractYoutubeId(b.mediaUrl || '') : null;
      const created = await db
        .insert(galleryItems)
        .values({
          titleEn: b.titleEn,
          titleBn: b.titleBn || b.titleEn,
          captionEn: b.captionEn || '',
          captionBn: b.captionBn || b.captionEn || '',
          locationEn: b.locationEn || 'Khulna, Bangladesh',
          locationBn: b.locationBn || 'খুলনা, বাংলাদেশ',
          mediaType: b.mediaType === 'video' ? 'video' : 'photo',
          mediaUrl: b.mediaUrl,
          youtubeId,
          category: b.category || 'Khulna',
          isFeatured: Boolean(b.isFeatured),
          status: b.status === 'draft' ? 'draft' : 'published',
        })
        .returning();
      res.status(201).json(created[0]);
    } catch (error) {
      console.error('Create gallery item error:', error);
      res.status(500).json({ error: 'Failed to add gallery item' });
    }
  });

  app.delete('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
    try {
      await db.delete(galleryItems).where(eq(galleryItems.id, Number(req.params.id)));
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete gallery item error:', error);
      res.status(500).json({ error: 'Failed to delete gallery item' });
    }
  });

  // Admin: Contacts & Users management
  app.patch('/api/admin/contacts/:id', requireAdmin, async (req, res) => {
    try {
      const status = ['unread', 'read', 'replied'].includes(req.body?.status)
        ? req.body.status
        : 'read';
      const updated = await db
        .update(contactSubmissions)
        .set({ status })
        .where(eq(contactSubmissions.id, Number(req.params.id)))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      console.error('Update contact status error:', error);
      res.status(500).json({ error: 'Failed to update contact status' });
    }
  });

  app.delete('/api/admin/contacts/:id', requireAdmin, async (req, res) => {
    try {
      await db
        .delete(contactSubmissions)
        .where(eq(contactSubmissions.id, Number(req.params.id)));
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete contact error:', error);
      res.status(500).json({ error: 'Failed to delete contact' });
    }
  });

  app.patch('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
    try {
      const targetId = Number(req.params.id);
      const role = req.body?.role === 'admin' ? 'admin' : 'viewer';
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.id, targetId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (isSuperAdminEmail(existing[0].email) && role !== 'admin') {
        return res
          .status(403)
          .json({ error: 'Super administrator accounts cannot be demoted.' });
      }

      const updated = await db
        .update(users)
        .set({ role })
        .where(eq(users.id, targetId))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  // Admin: Website Settings
  app.put('/api/admin/settings', requireAdmin, async (req, res) => {
    try {
      const b = req.body || {};
      const existing = await db.select().from(siteSettings).limit(1);
      if (existing.length === 0) {
        const created = await db
          .insert(siteSettings)
          .values({
            siteName: b.siteName || 'Khulna Vlogs',
            taglineEn: b.taglineEn || 'Explore • Travel • Discover Khulna',
            taglineBn: b.taglineBn || 'অন্বেষণ • ভ্রমণ • জানুন খুলনাকে',
            heroHeadlineEn: b.heroHeadlineEn || 'Discover the Beauty of Khulna',
            heroHeadlineBn: b.heroHeadlineBn || 'আবিষ্কার করুন খুলনার অপরূপ সৌন্দর্য',
            heroSubtitleEn:
              b.heroSubtitleEn ||
              'Explore the Places, People, Food and Stories of Khulna.',
            heroSubtitleBn:
              b.heroSubtitleBn ||
              'জানুন খুলনার স্থান, মানুষ, ঐতিহ্যবাহী খাবার এবং অজানা গল্প।',
            facebookUrl:
              b.facebookUrl || 'https://www.facebook.com/thekhulnavlogs/',
            youtubeUrl:
              b.youtubeUrl || 'https://www.youtube.com/@khulnavlogs',
            contactEmail: b.contactEmail || '',
            defaultSeoTitle:
              b.defaultSeoTitle ||
              'Khulna Vlogs – Explore, Travel & Discover Khulna, Bangladesh',
            defaultSeoDescription: b.defaultSeoDescription || '',
          })
          .returning();
        return res.json(created[0]);
      }

      const updated = await db
        .update(siteSettings)
        .set({
          siteName: b.siteName ?? existing[0].siteName,
          taglineEn: b.taglineEn ?? existing[0].taglineEn,
          taglineBn: b.taglineBn ?? existing[0].taglineBn,
          heroHeadlineEn: b.heroHeadlineEn ?? existing[0].heroHeadlineEn,
          heroHeadlineBn: b.heroHeadlineBn ?? existing[0].heroHeadlineBn,
          heroSubtitleEn: b.heroSubtitleEn ?? existing[0].heroSubtitleEn,
          heroSubtitleBn: b.heroSubtitleBn ?? existing[0].heroSubtitleBn,
          facebookUrl: b.facebookUrl ?? existing[0].facebookUrl,
          youtubeUrl: b.youtubeUrl ?? existing[0].youtubeUrl,
          contactEmail: b.contactEmail ?? existing[0].contactEmail,
          defaultSeoTitle: b.defaultSeoTitle ?? existing[0].defaultSeoTitle,
          defaultSeoDescription:
            b.defaultSeoDescription ?? existing[0].defaultSeoDescription,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, existing[0].id))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ error: 'Failed to update website settings' });
    }
  });

  // Never serve index.html for unknown /api/* requests
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  return app;
}
