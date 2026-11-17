import { sql } from 'drizzle-orm';
import { db } from './index';
import {
  articles,
  businesses,
  categories,
  destinations,
  events,
  galleryItems,
  restaurants,
  siteSettings,
  videos,
} from './schema';

let seedPromise: Promise<void> | null = null;

const IMG_HERO = '/src/assets/images/hero_khulna_rupsha_1794914379194.jpg';
const IMG_SUNDARBANS = '/src/assets/images/dest_sundarbans_mangrove_1794914379796.jpg';
const IMG_MOSQUE = '/src/assets/images/dest_sixty_dome_mosque_1794914380104.jpg';
const IMG_CHUI_JHAL = '/src/assets/images/food_khulna_chui_jhal_1794914380590.jpg';
const IMG_LIFESTYLE = '/src/assets/images/lifestyle_khulna_street_1794914380876.jpg';

export async function ensureSeeded(): Promise<void> {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    try {
      const existingSettings = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(siteSettings);
      if ((existingSettings[0]?.count ?? 0) === 0) {
        await db.insert(siteSettings).values({});
      }

      const existing = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(categories);
      if ((existing[0]?.count ?? 0) > 0) {
        return;
      }

      await db.insert(categories).values([
        {
          slug: 'rivers-bridges',
          nameEn: 'Rivers & Bridges',
          nameBn: 'নদী ও সেতু',
          descriptionEn: 'Sunset ferry crossings, Rupsha ghats, and iconic riverfront engineering.',
          descriptionBn: 'রূপসা ঘাট, সূর্যাস্তের নৌকা ভ্রমণ এবং খুলনার ঐতিহ্যবাহী নদীতীরের সৌন্দর্য।',
          section: 'explore',
          sortOrder: 1,
        },
        {
          slug: 'sundarbans-nature',
          nameEn: 'Sundarbans & Nature',
          nameBn: 'সুন্দরবন ও প্রকৃতি',
          descriptionEn: 'Gateway routes to the world’s largest mangrove forest and coastal wildlife.',
          descriptionBn: 'বিশ্বের বৃহত্তম ম্যানগ্রোভ বন সুন্দরবনের প্রবেশদ্বার ও প্রাকৃতিক বৈচিত্র্য।',
          section: 'explore',
          sortOrder: 2,
        },
        {
          slug: 'heritage-history',
          nameEn: 'Heritage & History',
          nameBn: 'ঐতিহ্য ও ইতিহাস',
          descriptionEn: 'Sultanate mosques in Bagerhat, Tagore’s Dakshin Dihi, and colonial landmarks.',
          descriptionBn: 'বাগেরহাটের ষাটগম্বুজ মসজিদ, দক্ষিণডিহি রবীন্দ্র কমপ্লেক্স ও প্রাচীন স্থাপত্য।',
          section: 'explore',
          sortOrder: 3,
        },
        {
          slug: 'chui-jhal-dining',
          nameEn: 'Chui Jhal & Dining',
          nameBn: 'চুইঝাল ও খাবার',
          descriptionEn: 'Khulna’s signature piper chaba spice curries, river fish, and street flavours.',
          descriptionBn: 'খুলনার ঐতিহ্যবাহী চুইঝাল মাংস, নদীর তাজা মাছ ও স্থানীয় স্ট্রিট ফুড।',
          section: 'food',
          sortOrder: 4,
        },
        {
          slug: 'city-lifestyle',
          nameEn: 'City Life & Markets',
          nameBn: 'নগর জীবন ও বাজার',
          descriptionEn: 'Morning bazaars, campus avenues, and everyday rhythms across Khulna.',
          descriptionBn: 'ভোরের বাজার, বৃক্ষশোভিত সড়ক এবং খুলনার প্রতিদিনের জনজীবন।',
          section: 'lifestyle',
          sortOrder: 5,
        },
        {
          slug: 'hidden-gems',
          nameEn: 'Hidden Gems',
          nameBn: 'অজানা সৌন্দর্য',
          descriptionEn: 'Quiet river bends, rural pottery clusters, and offbeat picnic trails.',
          descriptionBn: 'নিরিবিলি নদীর বাঁক, গ্রামীণ শিল্প ও পর্যটকদের অদেখা স্থানসমূহ।',
          section: 'explore',
          sortOrder: 6,
        },
      ]);

      await db.insert(destinations).values([
        {
          slug: 'khan-jahan-ali-rupsha-bridge',
          nameEn: 'Khan Jahan Ali Bridge & Rupsha Waterfront',
          nameBn: 'খান জাহান আলী (রূপসা) সেতু ও নদীতীর',
          category: 'river',
          summaryEn:
            'Khulna’s iconic cable-box girder bridge spanning the Rupsha River, celebrated for golden-hour boat views and breezy evening walks.',
          summaryBn:
            'রূপসা নদীর ওপর নির্মিত খুলনার অন্যতম প্রধান স্থাপত্য, যা গোধূলি বেলায় নৌভ্রমণ ও নদীতীরের দৃশ্যের জন্য পরিচিত।',
          descriptionEn:
            'Connecting Khulna city toward Bagerhat and Mongla, the Khan Jahan Ali Bridge (popularly known as Rupsha Bridge) frames one of southern Bangladesh’s finest river panoramas. Traditional wooden country boats cross beneath its sweeping arches from dawn until dusk, carrying commuters and local produce between the riverbanks.',
          descriptionBn:
            'খুলনা শহরকে বাগেরহাট ও মোংলার সঙ্গে যুক্ত করা খান জাহান আলী সেতু দক্ষিণ বাংলার অন্যতম দৃষ্টিনন্দন নদী-দৃশ্যপট। ভোর থেকে সন্ধ্যা পর্যন্ত সেতুর নিচে কাঠের নৌকা ও ট্রলারের যাতায়াত খুলনার চিরচেনা নদীর জীবনকে জীবন্ত করে তোলে।',
          locationText: 'Rupsha River, South Khulna, Bangladesh',
          travelTipsEn:
            'Visit between 4:30 PM and 6:00 PM for soft golden sunlight; riverbanks near Rupsha Ghat offer safe pedestrian vantage points.',
          travelTipsBn:
            'বিকেল ৪:৩০ থেকে ৬:০০টার মধ্যে সোনালী আলোয় সেতু ও নদীর দৃশ্য সবচেয়ে সুন্দর দেখায়।',
          bestTimeEn: 'October to March (Cool dry evenings)',
          bestTimeBn: 'অক্টোবর থেকে মার্চ (শীতল ও শুষ্ক বিকেল)',
          featuredImage: IMG_HERO,
          imageAlt: 'Golden hour sunset view of Khan Jahan Ali Bridge over Rupsha River in Khulna with traditional wooden boats',
          isFeatured: true,
          isHiddenGem: false,
          isSampleData: false,
          status: 'published',
          seoTitle: 'Rupsha Bridge Travel Guide | Khulna Vlogs',
          seoDescription: 'Explore Khan Jahan Ali Bridge and the Rupsha waterfront in Khulna, Bangladesh with timing and photography tips.',
        },
        {
          slug: 'sundarbans-karamjal-gateway',
          nameEn: 'Sundarbans Mangrove Gateway (Karamjal & Mongla)',
          nameBn: 'সুন্দরবন ম্যানগ্রোভ প্রবেশদ্বার (করমজল ও মোংলা)',
          category: 'sundarbans',
          summaryEn:
            'The accessible northern threshold of the UNESCO World Heritage Sundarbans mangrove forest, reachable via Khulna and Mongla.',
          summaryBn:
            'খুলনা ও মোংলা হয়ে ইউনেস্কো বিশ্ব ঐতিহ্য সুন্দরবনের শ্বাসমূলীয় অরণ্য ও বন্যপ্রাণী দেখার সহজতম প্রবেশপথ।',
          descriptionEn:
            'Khulna serves as the primary cultural and logistical gateway to the Sundarbans, the largest contiguous mangrove forest on Earth. Day excursions from Khulna via Mongla lead visitors along calm tidal creeks to Karamjal Eco-Tourism Center, where wooden boardwalks wind through Sundri and Gewa canopies.',
          descriptionBn:
            'পৃথিবীর বৃহত্তম ম্যানগ্রোভ অরণ্য সুন্দরবনের মূল প্রবেশদ্বার হলো খুলনা। মোংলা হয়ে একদিনের ভ্রমণে করমজল ইকো-ট্যুরিজম কেন্দ্রে কাঠের ট্রেইল ধরে সুন্দরী ও গেওয়া বনের ভেতর হাঁটা এবং জোয়ার-ভাটার খাল দেখা যায়।',
          locationText: 'Mongla & Karamjal Route, Khulna Division',
          travelTipsEn:
            'Arrange Forest Department permits through registered tour operators in Khulna or Mongla before boarding boats.',
          travelTipsBn:
            'নৌযানে ওঠার আগে খুলনা বা মোংলার নিবন্ধিত ট্যুর অপারেটরের মাধ্যমে বন বিভাগের অনুমতি সংগ্রহ করুন।',
          bestTimeEn: 'November to February',
          bestTimeBn: 'নভেম্বর থেকে ফেব্রুয়ারি',
          featuredImage: IMG_SUNDARBANS,
          imageAlt: 'Morning mist over calm tidal creek and mangrove trees in the Sundarbans near Khulna',
          isFeatured: true,
          isHiddenGem: false,
          isSampleData: false,
          status: 'published',
          seoTitle: 'Sundarbans Travel Guide from Khulna | Khulna Vlogs',
          seoDescription: 'Plan your Sundarbans day trip or river cruise from Khulna and Mongla with permit and seasonal tips.',
        },
        {
          slug: 'shat-gambuj-mosque-bagerhat',
          nameEn: 'Sixty Dome Mosque (Shat Gambuj Masjid), Bagerhat',
          nameBn: 'ষাটগম্বুজ মসজিদ, বাগেরহাট',
          category: 'bagerhat',
          summaryEn:
            'A 15th-century UNESCO World Heritage terracotta brick masterpiece just a short scenic drive east of Khulna city.',
          summaryBn:
            'খুলনা শহর থেকে অল্প দূরত্বে বাগেরহাটে অবস্থিত পঞ্চদশ শতাব্দীর ইউনেস্কো বিশ্ব ঐতিহ্যবাহী পোড়ামাটির স্থাপত্য।',
          descriptionEn:
            'Built under Khan Jahan Ali in the 15th century, the Mosque City of Bagerhat features the iconic Sixty Dome Mosque with its 77 low domes, slender stone pillars, and tranquil reflecting pond (Ghora Dighi). It remains one of the finest day-excursions for travelers staying in Khulna.',
          descriptionBn:
            'পঞ্চদশ শতাব্দীতে উলুঘ খান জাহান নির্মিত ষাটগম্বুজ মসজিদে রয়েছে ৭৭টি গম্বুজ, পাথরের স্তম্ভ এবং ঐতিহাসিক ঘোড়া দীঘি। খুলনা ভ্রমণকারীদের জন্য এটি অন্যতম সেরা ঐতিহ্যবাহী গন্তব্য।',
          locationText: 'Bagerhat District (approx. 1 hour east of Khulna)',
          travelTipsEn:
            'Combine your morning mosque visit with the adjacent Bagerhat Archaeological Museum and Nine Dome Mosque.',
          travelTipsBn:
            'সকালে মসজিদ পরিদর্শনের পাশাপাশি বাগেরহাট জাদুঘর ও নয়গম্বুজ মসজিদ ঘুরে দেখতে পারেন।',
          bestTimeEn: 'Year-round (Morning light ideal)',
          bestTimeBn: 'সারা বছর (সকালের আলো ফটোগ্রাফির জন্য উপযুক্ত)',
          featuredImage: IMG_MOSQUE,
          imageAlt: 'Historic terracotta domes of Sixty Dome Mosque Shat Gambuj Masjid reflected in courtyard pond',
          isFeatured: true,
          isHiddenGem: false,
          isSampleData: false,
          status: 'published',
          seoTitle: 'Sixty Dome Mosque Bagerhat Guide | Khulna Vlogs',
          seoDescription: 'Visit Shat Gambuj Masjid in Bagerhat from Khulna: architectural highlights and heritage routes.',
        },
        {
          slug: 'dakshin-dihi-rabindra-complex',
          nameEn: 'Rabindra Complex, Dakshin Dihi',
          nameBn: 'দক্ষিণডিহি রবীন্দ্র কমপ্লেক্স, ফুলতলা',
          category: 'historical',
          summaryEn:
            'The quiet heritage home of Rabindranath Tagore’s in-laws in Phultala, surrounded by mango groves and rural calm.',
          summaryBn:
            'ফুলতলার দক্ষিণডিহিতে রবীন্দ্রনাথ ঠাকুরের শ্বশুরবাড়ি, আমবাগান ও গ্রামীণ প্রশান্তির মাঝে অবস্থিত সাহিত্য-ঐতিহ্য।',
          descriptionEn:
            'Located in Phultala Upazila north of Khulna city, Dakshin Dihi preserves the ancestral residence linked to Rabindranath Tagore and Mrinalini Devi. Today it serves as a peaceful heritage house and cultural landmark away from urban traffic.',
          descriptionBn:
            'খুলনার ফুলতলা উপজেলায় অবস্থিত দক্ষিণডিহি রবীন্দ্রনাথ ঠাকুর ও মৃণালিনী দেবীর স্মৃতিবিজড়িত ঐতিহাসিক স্থান। শহরের কোলাহল থেকে দূরে সাহিত্যপ্রেমীদের জন্য এটি একটি চমৎকার নিরিবিলি গন্তব্য।',
          locationText: 'Phultala Upazila, Khulna',
          travelTipsEn:
            'Ideal for a calm weekday afternoon cultural trip north of Khulna city.',
          travelTipsBn:
            'সাপ্তাহিক ছুটির দিন বাদে শান্ত বিকেলে ভ্রমণের জন্য উপযোগী।',
          bestTimeEn: 'Winter & Spring',
          bestTimeBn: 'শীত ও বসন্তকাল',
          featuredImage: IMG_LIFESTYLE,
          imageAlt: 'Tree-lined heritage avenue and peaceful sunlit environment in Khulna region',
          isFeatured: false,
          isHiddenGem: true,
          isSampleData: false,
          status: 'published',
          seoTitle: 'Dakshin Dihi Rabindra Complex Khulna | Khulna Vlogs',
          seoDescription: 'Discover the literary heritage of Dakshin Dihi Rabindra Complex in Phultala, Khulna.',
        },
        {
          slug: 'bhairab-pashur-river-bend',
          nameEn: 'Bhairab & Pashur Confluence Eco-Trail',
          nameBn: 'ভৈরব ও পশুর নদীর মোহনা ইকো-ট্রেইল',
          category: 'hidden_gem',
          summaryEn:
            'Quiet riverside embankments south of Khulna where river cargo, fishing skiffs, and rural green horizons meet.',
          summaryBn:
            'খুলনার দক্ষিণে ভৈরব ও পশুর নদীর শান্ত মোহনা, যেখানে জেলের নৌকা ও সবুজ প্রকৃতি মিলেমিশে আছে।',
          descriptionEn:
            'Away from busy ferry terminals, the southern embankments along the Bhairab and Pashur waterways reveal timeless rural Bengal—brick kilns along distant bends, late-afternoon fishing nets, and cool river breezes heading toward Mongla.',
          descriptionBn:
            'ব্যস্ত ঘাট ছাড়িয়ে ভৈরব ও পশুর নদীর দক্ষিণ পাড়ে রয়েছে নিস্তব্ধ গ্রামবাংলার রূপ—দূরের নদীর বাঁকে জেলের জাল, পাখির ডাক আর মোংলামুখী শীতল বাতাস।',
          locationText: 'Southern River Corridor, Khulna–Mongla',
          travelTipsEn:
            'Travel with a local companion and plan return before nightfall.',
          travelTipsBn:
            'স্থানীয় পথপ্রদর্শকের সাথে ভ্রমণ করুন এবং সন্ধ্যার আগেই ফিরে আসুন।',
          bestTimeEn: 'Late Afternoon',
          bestTimeBn: 'বিকেল বেলা',
          featuredImage: IMG_HERO,
          imageAlt: 'Serene river boats on southern waterways near Khulna at sunset',
          isFeatured: false,
          isHiddenGem: true,
          isSampleData: true,
          status: 'published',
          seoTitle: 'Hidden River Trails in Khulna | Khulna Vlogs',
          seoDescription: 'Explore quiet hidden river bends and coastal embankments between Khulna and Mongla.',
        },
        {
          slug: 'gallamari-university-boulevard',
          nameEn: 'Khulna University & Gallamari Green Corridor',
          nameBn: 'খুলনা বিশ্ববিদ্যালয় ও গল্লামারী সবুজ প্রাঙ্গণ',
          category: 'park',
          summaryEn:
            'Leafy campus walkways, the Gallamari Liberation War Memorial, and Khulna’s vibrant student culture.',
          summaryBn:
            'গাছগাছালিতে ঘেরা বিশ্ববিদ্যালয় ক্যাম্পাস, গল্লামারী বধ্যভূমি স্মৃতিসৌধ ও তরুণদের প্রাণবন্ত আড্ডা।',
          descriptionEn:
            'The Gallamari–Gollamari corridor hosts both solemn Liberation War history and the lively intellectual energy of Khulna University. Late afternoons bring students, families, and photographers beneath tall rain trees.',
          descriptionBn:
            'গল্লামারী স্মৃতিসৌধ ও খুলনা বিশ্ববিদ্যালয় এলাকা যেমন মুক্তিযুদ্ধের ইতিহাসের সাক্ষী, তেমনি বিকেলে শিক্ষার্থী ও নগরবাসীর পদচারণায় মুখর থাকে।',
          locationText: 'Gallamari, Khulna City',
          travelTipsEn:
            'Stroll along the shaded campus roads in the late afternoon.',
          travelTipsBn:
            'বিকেলের রোদে ছায়াঘেরা ক্যাম্পাসের রাস্তায় হাঁটার জন্য চমৎকার সময়।',
          bestTimeEn: 'Afternoon & Early Evening',
          bestTimeBn: 'বিকেল ও সন্ধ্যার শুরু',
          featuredImage: IMG_LIFESTYLE,
          imageAlt: 'Shaded green avenue and rickshaws in Khulna city',
          isFeatured: false,
          isHiddenGem: true,
          isSampleData: false,
          status: 'published',
          seoTitle: 'Gallamari & Khulna University Guide | Khulna Vlogs',
          seoDescription: 'Visit Gallamari Memorial and the green walkways of Khulna University.',
        },
      ]);

      await db.insert(restaurants).values([
        {
          slug: 'traditional-chui-jhal-heritage-kitchen',
          nameEn: 'Chui Jhal Heritage Kitchen (Sample Listing)',
          nameBn: 'ঐতিহ্যবাহী চুইঝাল কিচেন (নমুনা তালিকা)',
          cuisineType: 'local',
          specialtyEn: 'Slow-cooked Beef & Mutton Chui Jhal with Piper Chaba stem',
          specialtyBn: 'খাঁটি চুইঝাল ও দেশি মসলায় রান্না করা গরু ও খাসির মাংস',
          reviewEn:
            'Khulna’s culinary signature relies on the woody, peppery warmth of the Chui Jhal vine rather than harsh chili heat. Served alongside steaming rice and fresh lime, this sample feature illustrates what makes southern Bengali cooking unforgettable.',
          reviewBn:
            'খুলনার রান্নার স্বাতন্ত্র্য লুকিয়ে আছে চুই লতার ঝাঁঝালো ও সুগন্ধি স্বাদে। সাদা ভাত ও লেবুর সাথে পরিবেশিত এই পদটি দক্ষিণাঞ্চলের অন্যতম জনপ্রিয় খাবার।',
          areaEn: 'Zero Point & Chuknagar Corridor, Khulna',
          areaBn: 'জিরো পয়েন্ট ও চুকনগর রোড এলাকা, খুলনা',
          address: null,
          phone: null,
          priceRange: null,
          openingHours: null,
          featuredImage: IMG_CHUI_JHAL,
          imageAlt: 'Traditional Khulna Chui Jhal curry in clay bowl with steamed rice and fried fish',
          isFeatured: true,
          isSampleData: true,
          status: 'published',
          seoTitle: 'Khulna Chui Jhal Food Guide | Khulna Vlogs',
          seoDescription: 'Discover Khulna’s signature Chui Jhal cuisine and culinary traditions.',
        },
        {
          slug: 'rupsha-river-hilsa-dining-sample',
          nameEn: 'Rupsha Riverbank Fish House (Sample Listing)',
          nameBn: 'রূপসা নদীতীর ফিশ হাউস (নমুনা তালিকা)',
          cuisineType: 'restaurant',
          specialtyEn: 'Pan-fried River Hilsa, Bagda Prawn Curry & Mustard Bhorta',
          specialtyBn: 'ভাজা ইলিশ, বাগদা চিংড়ির মালাইকারি ও সরিষা ভর্তা',
          reviewEn:
            'Close to Khulna’s river markets, fresh Bagda prawns and seasonal river fish remain staples of local dining. This demonstration listing highlights classic coastal flavors enjoyed across Rupsha and Khulna city.',
          reviewBn:
            'রূপসা ঘাট ও নদীর কাছাকাছি থাকায় খুলনায় তাজা বাগদা চিংড়ি ও নদীর মাছের পদ সবসময়ই আকর্ষণের কেন্দ্রে থাকে।',
          areaEn: 'Rupsha & Jailkhana Ghat Area, Khulna',
          areaBn: 'রূপসা ও জেলখানা ঘাট এলাকা, খুলনা',
          address: null,
          phone: null,
          priceRange: null,
          openingHours: null,
          featuredImage: IMG_CHUI_JHAL,
          imageAlt: 'Fried river fish and Bengali platter in Khulna',
          isFeatured: true,
          isSampleData: true,
          status: 'published',
          seoTitle: 'River Fish & Prawn Dining in Khulna | Khulna Vlogs',
          seoDescription: 'Explore Khulna’s fresh river fish, Bagda prawn curries, and traditional bhorta.',
        },
        {
          slug: 'shib-bari-evening-street-food-sample',
          nameEn: 'Shib Bari Evening Street Food Corner (Sample Listing)',
          nameBn: 'শিববাড়ি সন্ধ্যা স্ট্রিট ফুড কর্নার (নমুনা তালিকা)',
          cuisineType: 'street_food',
          specialtyEn: 'Fuchka, Chotpoti, Jhalmuri & Spiced Cha',
          specialtyBn: 'ফুচকা, চটপটি, ঝালমুড়ি ও মসলা চা',
          reviewEn:
            'As dusk settles over Shib Bari Mor and New Market, street carts come alive with tamarind-drenched fuchka, roasted cumin chotpoti, and hot clay-cup tea. Check locally on-site for vendor hours.',
          reviewBn:
            'সন্ধ্যার পর শিববাড়ি মোড় ও নিউমার্কেট এলাকায় ফুচকা, চটপটি ও গরম চায়ের আড্ডা জমে ওঠে।',
          areaEn: 'Shib Bari Mor & Boyra, Khulna',
          areaBn: 'শিববাড়ি মোড় ও বয়রা, খুলনা',
          address: null,
          phone: null,
          priceRange: null,
          openingHours: null,
          featuredImage: IMG_LIFESTYLE,
          imageAlt: 'Vibrant Khulna street atmosphere and local food culture',
          isFeatured: true,
          isSampleData: true,
          status: 'published',
          seoTitle: 'Khulna Street Food Guide | Khulna Vlogs',
          seoDescription: 'Guide to evening street food culture around Shib Bari Mor and Khulna city.',
        },
        {
          slug: 'dak-bangla-mistanno-sweets-sample',
          nameEn: 'Dak Bangla Traditional Mistanno (Sample Listing)',
          nameBn: 'ডাকবাংলা ঐতিহ্যবাহী মিষ্টান্ন (নমুনা তালিকা)',
          cuisineType: 'sweets',
          specialtyEn: 'Chana Sandesh, Roshogolla & Winter Date-Palm Gur Sweets',
          specialtyBn: 'ছানার সন্দেশ, রসগোল্লা ও খেজুর গুড়ের মিষ্টি',
          reviewEn:
            'Khulna’s historic market quarters have long been known for fresh milk sweets and winter Khejur Gur delicacies sourced from southern Bengal.',
          reviewBn:
            'খুলনার পুরনো বাজারগুলোতে খাঁটি দুধের ছানা ও শীতকালের খেজুর গুড়ের মিষ্টির দীর্ঘ ঐতিহ্য রয়েছে।',
          areaEn: 'Dak Bangla & KDA Avenue, Khulna',
          areaBn: 'ডাকবাংলা ও কেডিএ এভিনিউ, খুলনা',
          address: null,
          phone: null,
          priceRange: null,
          openingHours: null,
          featuredImage: IMG_CHUI_JHAL,
          imageAlt: 'Traditional culinary heritage of Khulna',
          isFeatured: false,
          isSampleData: true,
          status: 'published',
          seoTitle: 'Traditional Sweets of Khulna | Khulna Vlogs',
          seoDescription: 'Traditional Bengali sweets and winter date-palm gur treats in Khulna.',
        },
      ]);

      await db.insert(articles).values([
        {
          slug: 'chui-jhal-soul-of-khulna-cuisine',
          titleEn: 'Chui Jhal: The Woody Spice That Defines Khulna’s Table',
          titleBn: 'চুইঝাল: খুলনার রন্ধনশিল্পের অনন্য প্রাণ',
          excerptEn:
            'How a humble climbing vine from southern Bangladesh turned slow-cooked beef and mutton into a regional culinary pilgrimage.',
          excerptBn:
            'দক্ষিণ বাংলার একটি সাধারণ লতা কীভাবে খুলনার গরুর মাংস ও রান্নাকে সারাদেশে অনন্য পরিচিতি এনে দিয়েছে।',
          contentEn: `Across Bangladesh, mention Khulna at the dinner table and the conversation turns almost immediately to Chui Jhal. Unlike ordinary chili heat that stings the tongue, Chui Jhal (Piper chaba) uses the dried and fresh stems of a pepper vine native to southwestern Bengal to infuse slow-braised meat with an earthy, citrus-warm aroma.

In traditional Khulna households and roadside kitchens along the Chuknagar and Zero Point corridors, cooks slice the fibrous stem into small pieces and drop them into bubbling pots of mustard oil, whole garlic cloves, roasted cumin, and tender beef or mutton. As the hours pass, the woody stem softens, absorbing rich meat juices while releasing its signature peppery perfume.

When visiting Khulna, locals recommend pairing Chui Jhal curry with plain steamed rice, crisp fried river fish, and a squeeze of fragrant kagzi lebu (local lime). Beyond its flavor, Chui Jhal represents the warmth of southern Bangladeshi hospitality—generous, unhurried, and deeply rooted in the delta’s soil.`,
          contentBn: `বাংলাদেশের যেকোনো প্রান্তে খুলনার খাবারের কথা উঠলেই সবার আগে মনে পড়ে চুইঝালের নাম। সাধারণ মরিচের ঝালের চেয়ে সম্পূর্ণ আলাদা, চুই (Piper chaba) নামক এক প্রকার লতার কাণ্ড ও শিকড় থেকে আসা এই মসলা মাংসের ঝোলে এক অদ্ভুত মাটির সুবাস ও উষ্ণ ঝাঁঝ এনে দেয়।

খুলনার চুকনগর, জিরো পয়েন্ট এবং শহরের ঐতিহ্যবাহী রন্ধনশালাগুলোতে সরিষার তেল, গোটা রসুন, ভাজা জিরা এবং চুইঝালের টুকরো দিয়ে ধীমে আঁচে মাংস রান্না করা হয়। দীর্ঘ সময় রান্নার ফলে চুইয়ের টুকরোগুলো নরম হয়ে যায় এবং মাংসের রসের সাথে মিশে এক অনবদ্য স্বাদ তৈরি করে।

গরম সাদা ভাত, কাগজি লেবু এবং নদীর তাজা মাছ ভাজার সাথে চুইঝাল মাংস খুলনার অতিথিপরায়ণতার এক অবিচ্ছেদ্য অংশ।`,
          categorySlug: 'chui-jhal-dining',
          featuredImage: IMG_CHUI_JHAL,
          imageAltEn: 'Clay pot of Khulna Chui Jhal beef curry with steamed rice and fried fish',
          imageAltBn: 'মাটির পাত্রে খুলনার ঐতিহ্যবাহী চুইঝাল মাংস ও ভাত',
          authorName: 'Khulna Vlogs Editorial',
          readTimeMinutes: 5,
          status: 'published',
          isFeatured: true,
          seoTitle: 'Chui Jhal: Khulna’s Signature Cuisine Story | Khulna Vlogs',
          seoDescription: 'Read the full cultural and culinary story behind Khulna’s famous Chui Jhal spice and slow-cooked curries.',
        },
        {
          slug: 'dawn-to-dusk-along-the-rupsha-river',
          titleEn: 'Dawn to Dusk Along the Rupsha: Portrait of a Working River',
          titleBn: 'ভোর থেকে গোধূলি: রূপসা নদীর কর্মমুখর জীবনচিত্র',
          excerptEn:
            'Following wooden ferrymen, shipbuilders, and sunset walkers along Khulna’s most beloved waterway.',
          excerptBn:
            'কাঠের নৌকার মাঝি, শিপইয়ার্ডের শ্রমিক আর গোধূলির পথচারীদের চোখে খুলনার রূপসা নদীর গল্প।',
          contentEn: `Long before traffic rises along KDA Avenue, the Rupsha River is already awake. In the pale morning light, rows of wooden country boats ferry commuters, baskets of fresh greens, and glistening silver fish from East Rupsha toward the city ghats.

Formed where the Bhairab and Atai rivers meet, the Rupsha has shaped Khulna’s identity for centuries—from its historic riverside shipyards and jute warehouses to the sweeping concrete span of the Khan Jahan Ali Bridge.

At 5:00 PM, the industrial pace softens. Families gather along the embankments, tea sellers pour steaming cups, and the sun drops behind the bridge arches, turning the wide delta waters into liquid gold.`,
          contentBn: `শহরের কোলাহল জাগার আগেই জেগে ওঠে রূপসা নদী। ভোরের ম্লান আলোয় পূর্ব রূপসা থেকে কাঠের নৌকায় করে যাত্রী, তাজা শাকসবজি আর নদীর রূপালী মাছ শহরের ঘাটে এসে পৌঁছায়।

ভৈরব ও আত্রাই নদীর মিলনস্থলে গড়ে ওঠা এই রূপসা নদী শতাব্দীর পর শতাব্দী ধরে খুলনার অর্থনীতি ও সংস্কৃতিকে গড়ে তুলেছে—পুরনো শিপইয়ার্ড, পাটকল থেকে শুরু করে আধুনিক খান জাহান আলী সেতু পর্যন্ত।

বিকেল পাঁচটার পর নদীর পাড়ে নামে এক শান্ত আবহ। পরিবার ও তরুণরা নদীর বাতাস উপভোগ করতে ঘাটে ভিড় জমায়, আর সেতুর খিলানের পেছনে সূর্য ডোবার সাথে সাথে পুরো নদী সোনালী রঙে রাঙা হয়ে ওঠে।`,
          categorySlug: 'rivers-bridges',
          featuredImage: IMG_HERO,
          imageAltEn: 'Wooden boats crossing Rupsha River beneath Khan Jahan Ali Bridge at sunset',
          imageAltBn: 'সূর্যাস্তের সময় রূপসা সেতুর নিচে কাঠের নৌকা',
          authorName: 'Khulna Vlogs Editorial',
          readTimeMinutes: 6,
          status: 'published',
          isFeatured: true,
          seoTitle: 'Dawn to Dusk Along Rupsha River, Khulna | Khulna Vlogs',
          seoDescription: 'An editorial photo essay exploring daily life, ferries, and sunsets on the Rupsha River in Khulna.',
        },
        {
          slug: 'weekend-itinerary-khulna-bagerhat-sundarbans',
          titleEn: '48 Hours in Khulna, Bagerhat & the Mangrove Edge',
          titleBn: 'খুলনা, বাগেরহাট ও সুন্দরবন প্রান্তে ৪৮ ঘণ্টার ভ্রমণ গাইড',
          excerptEn:
            'A balanced two-day route combining 15th-century terracotta heritage, river cruises, and city street markets.',
          excerptBn:
            'প্রাচীন মসজিদ, ম্যানগ্রোভ বনের খাল আর খুলনা শহরের প্রাণবন্ত বাজার নিয়ে দুই দিনের পূর্ণাঙ্গ ভ্রমণ পরিকল্পনা।',
          contentEn: `Day 1 begins early on the road east toward Bagerhat. Arriving at the Sixty Dome Mosque as morning mist lifts off the Ghora Dighi pond reveals the quiet majesty of Sultanate-era brick craftsmanship. By midday, return to Khulna for a slow traditional Chui Jhal lunch and an afternoon walk through Khulna University’s shaded lanes.

Day 2 turns south toward Mongla and the Karamjal mangrove boardwalk. Gliding down tidal creeks beneath Sundri canopies offers an unforgettable glimpse of the Sundarbans ecosystem before returning to Rupsha Bridge at sunset.`,
          contentBn: `প্রথম দিন ভোরেই বেরিয়ে পড়ুন বাগেরহাটের পথে। সকালের শান্ত আলোয় ঘোড়া দীঘির পাড়ে ষাটগম্বুজ মসজিদের পোড়ামাটির কারুকাজ দেখার অভিজ্ঞতা অসাধারণ। দুপুরে খুলনায় ফিরে ঐতিহ্যবাহী চুইঝাল ভোজ সেরে বিকেলে ঘুরে দেখতে পারেন খুলনা বিশ্ববিদ্যালয় ও গল্লামারী প্রাঙ্গণ।

দ্বিতীয় দিন যাত্রা করুন মোংলা ও করমজলের উদ্দেশ্যে। সুন্দরী ও কেওড়া বনের খাল ধরে নৌভ্রমণ শেষ করে সন্ধ্যায় রূপসা সেতুর পাড়ে সূর্যাস্ত দেখে আপনার ৪৮ ঘণ্টার খুলনা ভ্রমণ পূর্ণতা পাবে।`,
          categorySlug: 'sundarbans-nature',
          featuredImage: IMG_SUNDARBANS,
          imageAltEn: 'Wooden eco-boat gliding through Sundarbans mangrove creek near Khulna',
          imageAltBn: 'সুন্দরবনের শান্ত খালে কাঠের নৌকা',
          authorName: 'Khulna Vlogs Editorial',
          readTimeMinutes: 7,
          status: 'published',
          isFeatured: false,
          seoTitle: '48 Hours in Khulna & Sundarbans Travel Guide | Khulna Vlogs',
          seoDescription: 'Complete 2-day Khulna, Bagerhat Shat Gambuj Masjid, and Karamjal Sundarbans itinerary.',
        },
        {
          slug: 'morning-rickshaws-bazaars-khulna-lifestyle',
          titleEn: 'Morning Rickshaws & Rain Trees: Everyday Life in Khulna',
          titleBn: 'ভোরের রিকশা ও রেইন ট্রি: খুলনার চিরচেনা নগর জীবন',
          excerptEn:
            'Why visitors fall in love with Khulna’s unhurried pace, tree-lined avenues, and warm neighborhood markets.',
          excerptBn:
            'গাছপালায় ঘেরা প্রশস্ত রাস্তা, রিকশার টুংটাং আর পাড়ার বাজারের আড্ডা কেন খুলনাকে এত আপন করে তোলে।',
          contentEn: `Unlike the frenetic rush of larger metropolises, Khulna moves to a gentler rhythm. Beneath towering rain trees along Upper Jessore Road and Boyra, hand-painted cycle rickshaws carry morning shoppers past fruit stalls, bookshops, and neighborhood tea corners.

From KDA New Market to Daulatpur’s river markets, everyday life in Khulna balances urban convenience with the warmth of a tight-knit coastal town.`,
          contentBn: `বড় মহানগরীর তীব্র ব্যস্ততার চেয়ে খুলনার জীবনযাত্রা অনেকটাই শান্ত ও ছন্দময়। আপার যশোর রোড ও বয়রার বিশাল রেইন ট্রি গাছের ছায়ায় রঙিন রিকশা, বইয়ের দোকান আর সকালের ফলের বাজার মিলে তৈরি হয় এক অন্যরকম আবহ।

কেডিএ নিউমার্কেট থেকে দৌলতপুরের হাট—সবখানেই শহরের আধুনিকতার সাথে মফস্বলের আন্তরিকতার অপূর্ব মেলবন্ধন দেখা যায়।`,
          categorySlug: 'city-lifestyle',
          featuredImage: IMG_LIFESTYLE,
          imageAltEn: 'Morning street market and cycle rickshaws under rain trees in Khulna',
          imageAltBn: 'খুলনার সকালে রেইন ট্রি গাছের নিচে রিকশা ও স্থানীয় বাজার',
          authorName: 'Khulna Vlogs Editorial',
          readTimeMinutes: 4,
          status: 'published',
          isFeatured: false,
          seoTitle: 'Daily Life & Culture in Khulna | Khulna Vlogs',
          seoDescription: 'Experience everyday lifestyle, local markets, and tree-lined streets of Khulna city.',
        },
      ]);

      await db.insert(businesses).values([
        {
          slug: 'sundarbans-eco-boat-cooperative-sample',
          nameEn: 'Sundarbans Eco-Boat Cooperative (Sample Listing)',
          nameBn: 'সুন্দরবন ইকো-বোট কো-অপারেটিভ (নমুনা তালিকা)',
          businessType: 'service',
          descriptionEn:
            'Demonstration directory entry representing licensed eco-tourism boat services operating between Khulna, Mongla, and Karamjal. Verify official Forest Department registration before booking.',
          descriptionBn:
            'খুলনা, মোংলা ও করমজল রুটে পরিচালিত পরিবেশবান্ধব ট্যুর বোট সেবার একটি নমুনা ডিরেক্টরি তথ্য।',
          area: 'Khulna Launch Ghat / Mongla Port',
          address: null,
          phone: null,
          websiteUrl: null,
          mapQuery: 'Khulna Launch Ghat Bangladesh',
          featuredImage: IMG_SUNDARBANS,
          isFeatured: true,
          isSampleData: true,
          status: 'published',
        },
        {
          slug: 'rupsha-riverside-guest-house-sample',
          nameEn: 'Rupsha Riverside Guest House (Sample Listing)',
          nameBn: 'রূপসা রিভারসাইড গেস্ট হাউস (নমুনা তালিকা)',
          businessType: 'hotel',
          descriptionEn:
            'Sample accommodation listing illustrating boutique river-facing hospitality options in central Khulna. Official room rates and contact details are left blank until verified by the business owner.',
          descriptionBn:
            'খুলনা শহরের কেন্দ্রে অবস্থিত আবাসন ও অতিথি সেবার একটি নমুনা তালিকা। যাচাইকৃত ঠিকানা ও ফোন নম্বর পরবর্তীতে যুক্ত করা যাবে।',
          area: 'Shib Bari & KDA Avenue, Khulna',
          address: null,
          phone: null,
          websiteUrl: null,
          mapQuery: 'Shib Bari Mor Khulna Bangladesh',
          featuredImage: IMG_HERO,
          isFeatured: true,
          isSampleData: true,
          status: 'published',
        },
        {
          slug: 'khulna-heritage-handloom-sample',
          nameEn: 'Khulna Heritage Handloom & Craft (Sample Listing)',
          nameBn: 'খুলনা ঐতিহ্য হ্যান্ডলুম ও হস্তশিল্প (নমুনা তালিকা)',
          businessType: 'shop',
          descriptionEn:
            'Sample local craft showcase highlighting southern Bengal handloom textiles, bamboo crafts, and Sundarbans natural honey cooperatives.',
          descriptionBn:
            'দক্ষিণ বাংলার তাঁতবস্ত্র, বাঁশ-বেতের শিল্প ও সুন্দরবনের প্রাকৃতিক মধু বিপণনকারী স্থানীয় দোকানের নমুনা পরিচিতি।',
          area: 'KDA New Market Area, Khulna',
          address: null,
          phone: null,
          websiteUrl: null,
          mapQuery: 'KDA New Market Khulna Bangladesh',
          featuredImage: IMG_LIFESTYLE,
          isFeatured: true,
          isSampleData: true,
          status: 'published',
        },
        {
          slug: 'khulna-chui-jhal-spice-house-sample',
          nameEn: 'Southern Spice & Chui Jhal Traders (Sample Listing)',
          nameBn: 'দক্ষিণাঞ্চল চুইঝাল ও মসলা ভান্ডার (নমুনা তালিকা)',
          businessType: 'shop',
          descriptionEn:
            'Demonstration marketplace listing for regional spice vendors supplying authentic Chui Jhal stems and artisanal mustard oil.',
          descriptionBn:
            'খাঁটি চুইঝাল ও ঘানিভাঙা সরিষার তেল সরবরাহকারী স্থানীয় মসলা দোকানের একটি নমুনা তালিকা।',
          area: 'Boro Bazar, Khulna',
          address: null,
          phone: null,
          websiteUrl: null,
          mapQuery: 'Boro Bazar Khulna Bangladesh',
          featuredImage: IMG_CHUI_JHAL,
          isFeatured: false,
          isSampleData: true,
          status: 'published',
        },
      ]);

      await db.insert(videos).values([
        {
          titleEn: 'Sunset Over Rupsha Bridge — Khulna Waterfront Vlog',
          titleBn: 'রূপসা সেতুর সূর্যাস্ত — খুলনা ভ্লগস স্পেশাল',
          youtubeUrl: 'https://www.youtube.com/@khulnavlogs',
          youtubeId: '',
          descriptionEn:
            'Golden hour boats, street tea stalls, and panoramic views from Khan Jahan Ali Bridge. Replace with your direct YouTube video link from the Admin Dashboard.',
          descriptionBn:
            'খান জাহান আলী সেতুর ওপর থেকে সোনালী বিকেলের দৃশ্য ও নদীর গল্প। অ্যাডমিন ড্যাশবোর্ড থেকে সরাসরি ইউটিউব লিংক যুক্ত করুন।',
          category: 'Travel Vlog',
          isFeatured: true,
          status: 'published',
        },
        {
          titleEn: 'Exploring the Sundarbans Mangrove Creeks from Khulna',
          titleBn: 'খুলনা থেকে সুন্দরবনের অরণ্যে একদিন',
          youtubeUrl: 'https://www.youtube.com/@khulnavlogs',
          youtubeId: '',
          descriptionEn:
            'A calm boat journey through Karamjal and the mangrove trails south of Khulna. Add your YouTube episode URL in Admin to embed the player.',
          descriptionBn:
            'মোংলা ও করমজলের শান্ত খাল ধরে সুন্দরবন ভ্রমণের ভিডিও ডকুমেন্টারি।',
          category: 'Sundarbans',
          isFeatured: true,
          status: 'published',
        },
        {
          titleEn: 'Chui Jhal & Street Food Trail Across Khulna City',
          titleBn: 'খুলনা শহরের চুইঝাল ও স্ট্রিট ফুড ট্যুর',
          youtubeUrl: 'https://www.youtube.com/@khulnavlogs',
          youtubeId: '',
          descriptionEn:
            'Tasting Khulna’s signature slow-cooked Chui Jhal, river fish platters, and evening snacks around Shib Bari Mor.',
          descriptionBn:
            'শিববাড়ি মোড় ও চুকনগরের বিখ্যাত চুইঝাল এবং সন্ধ্যার স্ট্রিট ফুডের স্বাদ গ্রহণ।',
          category: 'Food Guide',
          isFeatured: false,
          status: 'published',
        },
      ]);

      await db.insert(events).values([
        {
          slug: 'khulna-boishakhi-cultural-mela-sample',
          titleEn: 'Khulna Boishakhi Folk & Craft Fair (Sample Event)',
          titleBn: 'খুলনা বৈশাখী লোকজ ও কারুশিল্প মেলা (নমুনা)',
          eventType: 'festival',
          descriptionEn:
            'Annual Bengali New Year celebration featuring Baul folk music, terracotta crafts, and traditional riverside processions.',
          descriptionBn:
            'বাংলা নববর্ষ উপলক্ষে বাউল গান, মৃৎশিল্প প্রদর্শনী ও বর্ষবরণ শোভাযাত্রা।',
          venueEn: 'Shaheed Hadis Park & Town Hall Ground, Khulna',
          venueBn: 'শহীদ হাদিস পার্ক ও টাউন হল ময়দান, খুলনা',
          eventDate: '2027-04-14',
          dateLabelEn: 'April 14 · Pohela Boishakh (Sample Schedule)',
          dateLabelBn: '১৪ এপ্রিল · পহেলা বৈশাখ (নমুনা সময়সূচি)',
          featuredImage: IMG_LIFESTYLE,
          isSampleData: true,
          status: 'published',
        },
        {
          slug: 'sundarbans-conservation-week-sample',
          titleEn: 'Sundarbans Eco-Heritage & Photography Week (Sample Event)',
          titleBn: 'সুন্দরবন পরিবেশ ও আলোকচিত্র সপ্তাহ (নমুনা)',
          eventType: 'exhibition',
          descriptionEn:
            'Community photography exhibition and conservation dialogue celebrating the biodiversity of the Sundarbans delta.',
          descriptionBn:
            'সুন্দরবনের জীববৈচিত্র্য সংরক্ষণ ও প্রামাণ্য আলোকচিত্র প্রদর্শনী।',
          venueEn: 'Khulna Shilpakala Academy (Sample Venue)',
          venueBn: 'খুলনা জেলা শিল্পকলা একাডেমি (নমুনা স্থান)',
          eventDate: '2027-02-14',
          dateLabelEn: 'February 14 · Sundarbans Day (Sample Schedule)',
          dateLabelBn: '১৪ ফেব্রুয়ারি · সুন্দরবন দিবস (নমুনা সময়সূচি)',
          featuredImage: IMG_SUNDARBANS,
          isSampleData: true,
          status: 'published',
        },
        {
          slug: 'poush-pitha-winter-festival-sample',
          titleEn: 'Winter Poush Pitha & River Heritage Evening (Sample Event)',
          titleBn: 'শীতকালীন পৌষ পিঠা ও লোকসংস্কৃতি উৎসব (নমুনা)',
          eventType: 'cultural',
          descriptionEn:
            'Traditional Bengali winter cakes made with khejur gur, accompanied by acoustic folk performances.',
          descriptionBn:
            'খেজুর গুড়ের নানান পিঠা ও গ্রামীণ লোকসংগীতের সন্ধ্যা।',
          venueEn: 'Khulna University Campus Ground (Sample Venue)',
          venueBn: 'খুলনা বিশ্ববিদ্যালয় প্রাঙ্গণ (নমুনা স্থান)',
          eventDate: '2027-01-15',
          dateLabelEn: 'January · Winter Season (Sample Schedule)',
          dateLabelBn: 'জানুয়ারি · শীতকালীন আয়োজন (নমুনা সময়সূচি)',
          featuredImage: IMG_CHUI_JHAL,
          isSampleData: true,
          status: 'published',
        },
      ]);

      await db.insert(galleryItems).values([
        {
          titleEn: 'Golden Hour at Rupsha Bridge',
          titleBn: 'রূপসা সেতুতে সোনালী গোধূলি',
          captionEn: 'Country boats crossing beneath Khan Jahan Ali Bridge as the evening sky turns amber.',
          captionBn: 'সন্ধ্যার লাল আভায় খান জাহান আলী সেতুর নিচে কাঠের নৌকার পারাপার।',
          locationEn: 'Rupsha River, Khulna',
          locationBn: 'রূপসা নদী, খুলনা',
          mediaType: 'photo',
          mediaUrl: IMG_HERO,
          category: 'Rivers',
          isFeatured: true,
          status: 'published',
        },
        {
          titleEn: 'Morning Light in the Sundarbans',
          titleBn: 'সুন্দরবনের ভোরের আলো',
          captionEn: 'Silent tidal creek framed by tangled mangrove roots near Karamjal.',
          captionBn: 'করমজলের কাছে শ্বাসমূলীয় বনের শান্ত খাল ও সকালের রোদ।',
          locationEn: 'Sundarbans Mangrove Edge',
          locationBn: 'সুন্দরবন প্রান্ত',
          mediaType: 'photo',
          mediaUrl: IMG_SUNDARBANS,
          category: 'Nature',
          isFeatured: true,
          status: 'published',
        },
        {
          titleEn: 'Sixty Dome Mosque Reflections',
          titleBn: 'ষাটগম্বুজ মসজিদের প্রতিবিম্ব',
          captionEn: 'Fifteenth-century terracotta domes reflected in the still courtyard pond of Bagerhat.',
          captionBn: 'পঞ্চদশ শতাব্দীর পোড়ামাটির গম্বুজ ও দীঘির শান্ত জল।',
          locationEn: 'Bagerhat, Khulna Division',
          locationBn: 'বাগেরহাট, খুলনা বিভাগ',
          mediaType: 'photo',
          mediaUrl: IMG_MOSQUE,
          category: 'Heritage',
          isFeatured: true,
          status: 'published',
        },
        {
          titleEn: 'Khulna’s Signature Chui Jhal Table',
          titleBn: 'খুলনার ঐতিহ্যবাহী চুইঝাল ভোজ',
          captionEn: 'Slow-cooked Chui Jhal curry, steamed rice, and golden fried river fish.',
          captionBn: 'মাটির বাটিতে চুইঝাল মাংস, সাদা ভাত ও ভাজা মাছ।',
          locationEn: 'Khulna Culinary Heritage',
          locationBn: 'খুলনার রন্ধন ঐতিহ্য',
          mediaType: 'photo',
          mediaUrl: IMG_CHUI_JHAL,
          category: 'Food',
          isFeatured: true,
          status: 'published',
        },
        {
          titleEn: 'Rain Trees & Morning Rickshaws',
          titleBn: 'রেইন ট্রি ও সকালের রিকশা',
          captionEn: 'Everyday urban rhythm under Khulna’s shaded avenues.',
          captionBn: 'গাছের ছায়ায় খুলনা শহরের সকালের কর্মচাঞ্চল্য।',
          locationEn: 'Khulna City Center',
          locationBn: 'খুলনা শহর',
          mediaType: 'photo',
          mediaUrl: IMG_LIFESTYLE,
          category: 'Lifestyle',
          isFeatured: false,
          status: 'published',
        },
      ]);
    } catch (error) {
      seedPromise = null;
      console.error('Failed to seed initial Khulna Vlogs data:', error);
      throw new Error('Failed to initialize demonstration content.', { cause: error });
    }
  })();

  return seedPromise;
}
