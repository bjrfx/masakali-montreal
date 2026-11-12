const envSiteUrl = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SITE_URL)
  ? process.env.REACT_APP_SITE_URL.replace(/\/$/, '')
  : null;

export const siteSeo = {
  siteName: "Masakali Indian Cuisine Montreal",
  siteUrl: envSiteUrl || "https://masakalimontreal.ca",
  brandShort: "Masakali Montreal",
  defaultTitle: "Masakali Indian Cuisine | Indian Restaurant in Montreal",
  defaultDescription: "Authentic Indian dining at Masakali in Montreal (1015 Sherbrooke St W). View the menu, reserve a table, and order catering. English and French.",
  locale: "en_CA",
  ogLocale: "en_CA",
  htmlLang: 'en',
  cuisine: "Indian",
  priceRange: "$$",
  email: "masakalimontreal@gmail.com",
  servesCuisine: ["Indian"],
  areaServed: "Montreal, Quebec",
  ogImage: '/logo192.png',
  openingHours: ['Mo-Su 11:30-22:00'],
  restaurants: [
  {
    name: "Masakali Indian Cuisine – Montreal",
    streetAddress: "1015 Sherbrooke St W",
    addressLocality: "Montreal",
    addressRegion: "QC",
    postalCode: "H3A 1G5",
    addressCountry: "CA",
    telephone: "+1-514-228-6777",
  }
  ],
};

export const pages = {
  home: {
    path: "/",
    title: "Masakali Indian Cuisine | Montreal",
    description: "Masakali Indian Cuisine in Montreal — authentic Indian dishes, reservations, and catering at 1015 Sherbrooke St W.",
  },
  about: {
    path: "/about",
    title: "About Us | Masakali Indian Cuisine Montreal",
    description: "The story of Masakali Indian Cuisine and our Montreal restaurant on Sherbrooke Street West.",
  },
  menu: {
    path: "/menu",
    title: "Menu | Masakali Indian Cuisine Montreal",
    description: "Explore the Masakali Montreal menu — authentic Indian curries, biryani, tandoor, and vegetarian specialties.",
  },
  locations: {
    path: "/locations",
    title: "Location | Masakali Montreal",
    description: "Visit Masakali Indian Cuisine at 1015 Sherbrooke St W, Montreal, QC H3A 1G5. Directions and contact details.",
  },
  reservations: {
    path: "/reservations",
    title: "Reservations | Masakali Montreal",
    description: "Book a table at Masakali Indian Cuisine Montreal. Online reservations with confirmation.",
  },
  catering: {
    path: "/catering",
    title: "Catering | Masakali Montreal",
    description: "Indian catering in Montreal from Masakali — events, parties, and catering by the tray.",
  },
  cateringByTray: {
    path: "/catering-by-tray",
    title: "Catering by the Tray | Masakali Montreal",
    description: "Order Indian catering trays from Masakali Montreal for gatherings and corporate events.",
  },
  contact: {
    path: "/contact",
    title: "Contact | Masakali Montreal",
    description: "Contact Masakali Montreal at (514) 228-6777 or masakalimontreal@gmail.com. 1015 Sherbrooke St W.",
  }
};

export function absoluteUrl(path = '/') {
  const normalized = path.startsWith('http') ? path : `${siteSeo.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
  return normalized;
}

export function buildRestaurantJsonLd() {
  return siteSeo.restaurants.map((restaurant) => ({
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${absoluteUrl('/')}#restaurant-${restaurant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: restaurant.name,
    image: absoluteUrl(siteSeo.ogImage),
    url: absoluteUrl('/'),
    telephone: restaurant.telephone,
    email: siteSeo.email,
    servesCuisine: siteSeo.servesCuisine,
    priceRange: siteSeo.priceRange,
    menu: absoluteUrl('/menu'),
    acceptsReservations: true,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.streetAddress,
      addressLocality: restaurant.addressLocality,
      addressRegion: restaurant.addressRegion,
      postalCode: restaurant.postalCode,
      addressCountry: restaurant.addressCountry,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '11:30',
      closes: '22:00',
    },
    areaServed: siteSeo.areaServed,
  }));
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${absoluteUrl('/')}#website`,
    name: siteSeo.siteName,
    url: absoluteUrl('/'),
    description: siteSeo.defaultDescription,
    publisher: {
      '@type': 'Organization',
      name: siteSeo.siteName,
      url: absoluteUrl('/'),
      logo: absoluteUrl(siteSeo.ogImage),
      email: siteSeo.email,
    },
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
    offers: item.price != null && item.price !== '' ? {
      '@type': 'Offer',
      priceCurrency: "CAD",
      price: String(item.price),
      availability: 'https://schema.org/InStock',
    } : undefined,
  };
  return data;
}

export const siteFaqs = [["Where is Masakali Montreal located?", "Masakali Indian Cuisine is at 1015 Sherbrooke St W, Montreal, QC H3A 1G5."], ["What is the phone number?", "You can call Masakali Montreal at (514) 228-6777."], ["Can I reserve a table online?", "Yes. Use the Reservations page on this website to book a table."], ["Is the website available in French?", "Yes. French pages are available under the /fr path."]];

export function pageSeo(key, overrides = {}) {
  const page = pages[key] || {};
  return {
    title: overrides.title || page.title,
    description: overrides.description || page.description,
    path: overrides.path || page.path,
  };
}
