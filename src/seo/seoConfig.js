import { dishRecommendationGroups, flattenRecommendedDishes } from './recommendedDishes';

const envSiteUrl = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SITE_URL)
  ? process.env.REACT_APP_SITE_URL.replace(/\/$/, '')
  : null;

const MONTREAL_DIRECTIONS =
  'https://www.google.com/maps/dir/?api=1&destination=1015+Sherbrooke+St+W+Montreal+QC+H3A+1G5';

export const siteSeo = {
  siteName: 'Masakali Indian Cuisine',
  siteUrl: envSiteUrl || 'https://masakalimontreal.ca',
  brandShort: 'Masakali',
  brandName: 'Masakali Indian Cuisine',
  groupName: 'Masakali Group',
  defaultTitle: 'Masakali Indian Cuisine | Indian Restaurant in Montreal',
  defaultDescription:
    'Authentic Indian dining at Masakali in Montreal (1015 Sherbrooke St W). View the menu, reserve a table, and order catering. English and French.',
  locale: 'en_CA',
  ogLocale: 'en_CA',
  htmlLang: 'en',
  cuisine: 'Indian',
  priceCurrency: 'CAD',
  priceRange: '$$',
  email: 'masakalimontreal@gmail.com',
  servesCuisine: ['Indian', 'North Indian', 'South Indian'],
  areaServed: 'Montreal, Quebec',
  ogImage: '/logo192.png',
  openingHours: ['Mo-Su 12:00-22:00'],
  services: ['Dine-in', 'Takeout', 'Delivery', 'Catering', 'Reservations'],
  restaurants: [
    {
      name: 'Masakali Indian Cuisine – Montreal',
      slug: 'montreal',
      streetAddress: '1015 Sherbrooke St W',
      addressLocality: 'Montreal',
      addressRegion: 'QC',
      postalCode: 'H3A 1G5',
      addressCountry: 'CA',
      telephone: '+1-514-228-6777',
      hasMap: MONTREAL_DIRECTIONS,
      opens: '12:00',
      closes: '22:00',
    },
  ],
};

export const pages = {
  home: {
    path: '/',
    title: 'Masakali Indian Cuisine | Montreal',
    description:
      'Masakali Indian Cuisine in Montreal — authentic Indian dishes, reservations, and catering at 1015 Sherbrooke St W.',
  },
  about: {
    path: '/about',
    title: 'About Us | Masakali Indian Cuisine Montreal',
    description: 'The story of Masakali Indian Cuisine and our Montreal restaurant on Sherbrooke Street West.',
  },
  menu: {
    path: '/menu',
    title: 'Menu | Masakali Indian Cuisine Montreal',
    description:
      'Explore the Masakali Montreal menu — authentic Indian curries, biryani, tandoor, and vegetarian specialties.',
  },
  locations: {
    path: '/locations',
    title: 'Location | Masakali Montreal',
    description:
      'Visit Masakali Indian Cuisine at 1015 Sherbrooke St W, Montreal, QC H3A 1G5. Hours, directions, and contact details.',
  },
  reservations: {
    path: '/reservations',
    title: 'Reservations | Masakali Montreal',
    description: 'Book a table at Masakali Indian Cuisine Montreal. Online reservations with confirmation.',
  },
  catering: {
    path: '/catering',
    title: 'Catering | Masakali Montreal',
    description: 'Indian catering in Montreal from Masakali — events, parties, and catering by the tray.',
  },
  cateringByTray: {
    path: '/catering-by-tray',
    title: 'Catering by the Tray | Masakali Montreal',
    description: 'Order Indian catering trays from Masakali Montreal for gatherings and corporate events.',
  },
  contact: {
    path: '/contact',
    title: 'Contact | Masakali Montreal',
    description:
      'Contact Masakali Montreal at (514) 228-6777 or masakalimontreal@gmail.com. 1015 Sherbrooke St W.',
  },
};

export function absoluteUrl(path = '/') {
  const normalized = path.startsWith('http')
    ? path
    : `${siteSeo.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
  return normalized;
}

export function slugifyEntityId(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'location';
}

function organizationId() {
  return `${absoluteUrl('/')}#organization`;
}

function brandOrganizationId() {
  return `${absoluteUrl('/')}#brand`;
}

function groupOrganizationId() {
  return `${absoluteUrl('/')}#masakali-group`;
}

function restaurantEntityId(nameOrSlug) {
  return `${absoluteUrl('/')}#restaurant-${slugifyEntityId(nameOrSlug)}`;
}

function parseOpeningHoursSpec(location, fallbackOpens = '12:00', fallbackCloses = '22:00') {
  if (location?.opens && location?.closes) {
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: location.opens,
      closes: location.closes,
    };
  }

  const lines = Array.isArray(location?.opening_hours_lines)
    ? location.opening_hours_lines
    : Array.isArray(location?.opening_hours)
      ? location.opening_hours
      : String(location?.opening_hours || '')
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);

  const specs = [];
  const dayMap = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
    fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
  };

  lines.forEach((line) => {
    const text = String(line || '');
    const range = text.match(/(\d{1,2}:\d{2})\s*(AM|PM)?\s*-\s*(\d{1,2}:\d{2})\s*(AM|PM)?/i);
    if (!range) return;
    const to24 = (t, ampm) => {
      let [h, m] = t.split(':').map(Number);
      const ap = (ampm || '').toUpperCase();
      if (ap === 'PM' && h < 12) h += 12;
      if (ap === 'AM' && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };
    const opens = to24(range[1], range[2] || (text.match(/AM|PM/i) || [])[0]);
    const closes = to24(range[3], range[4] || (text.toUpperCase().includes('PM') ? 'PM' : ''));
    const lower = text.toLowerCase();
    let days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (lower.includes('mon-thu') || lower.includes('mon–thu')) {
      days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    } else if (lower.includes('fri-sun') || lower.includes('fri–sun')) {
      days = ['Friday', 'Saturday', 'Sunday'];
    } else if (lower.includes('mon-sun') || lower.includes('mon–sun') || lower.includes('daily')) {
      days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    }
    specs.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: days,
      opens,
      closes,
    });
  });

  if (specs.length) return specs;

  return {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: fallbackOpens,
    closes: fallbackCloses,
  };
}

function buildMapsUrlFromParts(parts) {
  const query = parts.filter(Boolean).join(' ');
  if (!query) return '';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export function resolveHasMap(location = {}) {
  const configured = String(location.google_maps_url || location.hasMap || '').trim();
  if (configured) {
    if (/google\.[^/]+\/maps/i.test(configured) || /maps\.google\./i.test(configured)) {
      return configured;
    }
    return configured;
  }
  const addressBits = [
    location.streetAddress || location.address,
    location.addressLocality || location.city,
    location.addressRegion || location.province_state,
    location.postalCode || location.postal_code,
    location.addressCountry || location.country,
  ];
  return buildMapsUrlFromParts(addressBits);
}

export function buildGroupOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': groupOrganizationId(),
    name: siteSeo.groupName,
    description:
      'Masakali Group operates Masakali Indian Cuisine, Masakali Indian Restobar, and RangDe Indian Cuisine restaurants.',
    url: absoluteUrl('/'),
    brand: [
      { '@type': 'Brand', name: 'Masakali Indian Cuisine' },
      { '@type': 'Brand', name: 'Masakali Indian Restobar' },
      { '@type': 'Brand', name: 'RangDe Indian Cuisine' },
    ],
  };
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId(),
    name: siteSeo.siteName,
    legalName: siteSeo.brandName,
    url: absoluteUrl('/'),
    logo: absoluteUrl(siteSeo.ogImage),
    email: siteSeo.email,
    description: siteSeo.defaultDescription,
    parentOrganization: { '@id': groupOrganizationId() },
    brand: { '@type': 'Brand', '@id': brandOrganizationId(), name: siteSeo.brandName },
    contactPoint: siteSeo.restaurants.map((restaurant) => ({
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: restaurant.telephone,
      areaServed: restaurant.addressLocality,
      availableLanguage: ['English', 'French'],
    })),
  };
}

function buildRestaurantNode(restaurant, overrides = {}) {
  const name = restaurant.name;
  const slug = restaurant.slug || name;
  const hasMap = resolveHasMap(restaurant);
  const telephone = restaurant.telephone || restaurant.phone || undefined;
  const email = restaurant.email || siteSeo.email;
  const website = restaurant.website || restaurant.url || absoluteUrl('/');
  const menuUrl = overrides.menuUrl || absoluteUrl('/menu');
  const node = {
    '@context': 'https://schema.org',
    '@type': ['Restaurant', 'LocalBusiness'],
    '@id': restaurantEntityId(slug),
    name,
    image: restaurant.image_url || restaurant.image || absoluteUrl(siteSeo.ogImage),
    url: website.startsWith('http') ? website : absoluteUrl(website),
    telephone: telephone || undefined,
    email: email || undefined,
    servesCuisine: siteSeo.servesCuisine,
    priceRange: siteSeo.priceRange,
    menu: menuUrl,
    acceptsReservations: true,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.streetAddress || restaurant.address || undefined,
      addressLocality: restaurant.addressLocality || restaurant.city || undefined,
      addressRegion: restaurant.addressRegion || restaurant.province_state || undefined,
      postalCode: restaurant.postalCode || restaurant.postal_code || undefined,
      addressCountry: restaurant.addressCountry || restaurant.country || undefined,
    },
    openingHoursSpecification: parseOpeningHoursSpec(restaurant),
    hasMap: hasMap || undefined,
    parentOrganization: { '@id': organizationId() },
    brand: { '@type': 'Brand', name: restaurant.brand || siteSeo.brandName },
  };

  const lat = Number(restaurant.latitude);
  const lng = Number(restaurant.longitude);
  if (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  ) {
    node.geo = {
      '@type': 'GeoCoordinates',
      latitude: lat,
      longitude: lng,
    };
  }

  return node;
}

export function buildRestaurantJsonLd() {
  return siteSeo.restaurants.map((restaurant) => buildRestaurantNode(restaurant));
}

export function buildRestaurantJsonLdFromLocation(location) {
  if (!location) return null;
  return buildRestaurantNode(
    {
      name: location.name || location.brand,
      slug: location.slug || location.name,
      brand: location.brand,
      streetAddress: location.address,
      addressLocality: location.city,
      addressRegion: location.province_state,
      postalCode: location.postal_code,
      addressCountry: location.country,
      telephone: location.phone,
      email: location.email,
      website: location.website,
      google_maps_url: location.google_maps_url,
      opening_hours: location.opening_hours,
      opening_hours_lines: location.opening_hours_lines,
      latitude: location.latitude,
      longitude: location.longitude,
      image_url: location.image_url,
    },
    {
      menuUrl:
        location.website && String(location.website).replace(/\/$/, '') !== siteSeo.siteUrl
          ? `${String(location.website).replace(/\/$/, '')}/menu`
          : absoluteUrl('/menu'),
    },
  );
}

export function buildLocationsPageJsonLd(locations = []) {
  const restaurants = (locations || [])
    .map((location) => buildRestaurantJsonLdFromLocation(location))
    .filter(Boolean);

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${absoluteUrl('/locations')}#location-list`,
    name: `${siteSeo.siteName} restaurant locations`,
    description:
      'Active Masakali Group restaurant locations listed on this website, with addresses, phone numbers, hours, and Google Maps directions.',
    numberOfItems: restaurants.length,
    itemListElement: restaurants.map((restaurant, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: { '@id': restaurant['@id'] },
    })),
  };

  return [buildGroupOrganizationJsonLd(), buildOrganizationJsonLd(), ...restaurants, itemList];
}

export function buildRecommendedDishesJsonLd() {
  const dishes = flattenRecommendedDishes();
  const groups = dishRecommendationGroups.map((group) => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${absoluteUrl('/menu')}#${group.id}`,
    name: group.label,
    description: group.description,
    itemListElement: (group.dishes || []).map((dish, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'MenuItem',
        name: dish.name,
        description: dish.explanation,
        url: absoluteUrl('/menu'),
        suitableForDiet:
          dish.diet === 'vegetarian' ? 'https://schema.org/VegetarianDiet' : undefined,
      },
    })),
  }));

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': `${absoluteUrl('/menu')}#recommended-dishes`,
      name: `${siteSeo.siteName} recommended dishes`,
      description:
        'Signature, chef-recommended, vegetarian, customer-favourite, and must-try dishes curated from the restaurant menu. Not a sales ranking.',
      numberOfItems: dishes.length,
      itemListElement: dishes.map((dish, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: dish.name,
        item: {
          '@type': 'MenuItem',
          name: dish.name,
          description: `${dish.explanation} (${dish.groupLabel})`,
          url: absoluteUrl('/menu'),
        },
      })),
    },
    ...groups,
  ];
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${absoluteUrl('/')}#website`,
    name: siteSeo.siteName,
    url: absoluteUrl('/'),
    description: siteSeo.defaultDescription,
    publisher: { '@id': organizationId() },
    inLanguage: ['en-CA', 'fr-CA'],
    potentialAction: {
      '@type': 'ReserveAction',
      target: absoluteUrl('/reservations'),
      name: 'Reserve a table',
    },
  };
}

export function buildMenuItemJsonLd(item, path) {
  if (!item) return null;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: item.name,
    description: item.description || undefined,
    url: absoluteUrl(path),
    image: item.image_url || item.imageUrl || undefined,
    offers:
      item.price != null && item.price !== ''
        ? {
            '@type': 'Offer',
            priceCurrency: siteSeo.priceCurrency || 'CAD',
            price: String(item.price),
            availability: 'https://schema.org/InStock',
          }
        : undefined,
  };
  return data;
}

export const siteFaqs = [
  [
    'Where is Masakali Montreal located?',
    'Masakali Indian Cuisine is at 1015 Sherbrooke St W, Montreal, QC H3A 1G5.',
  ],
  [
    'What are the hours?',
    'Masakali Montreal is open Monday through Sunday, 12:00 PM to 10:00 PM.',
  ],
  [
    'What is the phone number?',
    'You can call Masakali Montreal at (514) 228-6777.',
  ],
  [
    'Can I reserve a table online?',
    'Yes. Use the Reservations page on this website to book a table.',
  ],
  [
    'Is the website available in French?',
    'Yes. French pages are available under the /fr path (for example https://masakalimontreal.ca/fr/menu).',
  ],
  [
    'What should I try at Masakali Montreal?',
    'Signature recommendations include Butter Chicken, Chicken Dum Biryani, and Paneer Butter Masala. Mango Lassi is called out on the menu as "Our FANS Favorite". See the full menu for current availability.',
  ],
];

export function pageSeo(key, overrides = {}) {
  const page = pages[key] || {};
  return {
    title: overrides.title || page.title,
    description: overrides.description || page.description,
    path: overrides.path || page.path,
  };
}

export { dishRecommendationGroups, flattenRecommendedDishes };
