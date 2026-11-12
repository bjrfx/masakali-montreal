/**
 * Route-level HTML shell enhancement for crawlers (SPA prerender substitute).
 * Injects correct title/description/canonical/OG/JSON-LD and meaningful #root
 * content into the CRA index.html for known public routes.
 * React replaces #root on hydrate; data-seo-prerender tags are removed by Seo.js.
 * Site-specific: do not copy this file between repositories.
 */
'use strict';

const SITE = {
  "siteUrl": "https://masakalimontreal.ca",
  "siteName": "Masakali Indian Cuisine",
  "brandH1": "Masakali Indian Cuisine",
  "htmlLang": "en",
  "locale": "en_CA",
  "hasFr": true,
  "navLinks": [
    [
      "/",
      "Home"
    ],
    [
      "/about",
      "About"
    ],
    [
      "/menu",
      "Menu"
    ],
    [
      "/locations",
      "Locations"
    ],
    [
      "/reservations",
      "Reservations"
    ],
    [
      "/catering-by-tray",
      "Catering"
    ],
    [
      "/contact",
      "Contact"
    ]
  ],
  "locationLines": [
    "Masakali Indian Cuisine – Montreal — 1015 Sherbrooke St W, Montreal"
  ],
  "pages": {
    "/": {
      "title": "Masakali Indian Cuisine | Montreal",
      "description": "Masakali Indian Cuisine in Montreal — authentic Indian dishes, reservations, and catering at 1015 Sherbrooke St W."
    },
    "/about": {
      "title": "About Us | Masakali Indian Cuisine Montreal",
      "description": "The story of Masakali Indian Cuisine and our Montreal restaurant on Sherbrooke Street West."
    },
    "/menu": {
      "title": "Menu | Masakali Indian Cuisine Montreal",
      "description": "Explore the Masakali Montreal menu — authentic Indian curries, biryani, tandoor, and vegetarian specialties."
    },
    "/locations": {
      "title": "Location | Masakali Montreal",
      "description": "Visit Masakali Indian Cuisine at 1015 Sherbrooke St W, Montreal, QC H3A 1G5. Hours, directions, and contact details."
    },
    "/reservations": {
      "title": "Reservations | Masakali Montreal",
      "description": "Book a table at Masakali Indian Cuisine Montreal. Online reservations with confirmation."
    },
    "/catering": {
      "title": "Catering | Masakali Montreal",
      "description": "Indian catering in Montreal from Masakali — events, parties, and catering by the tray."
    },
    "/catering-by-tray": {
      "title": "Catering by the Tray | Masakali Montreal",
      "description": "Order Indian catering trays from Masakali Montreal for gatherings and corporate events."
    },
    "/contact": {
      "title": "Contact | Masakali Montreal",
      "description": "Contact Masakali Montreal at (514) 228-6777 or masakalimontreal@gmail.com. 1015 Sherbrooke St W."
    },
    "/fr": {
      "title": "Masakali Cuisine Indienne | Restauration indienne de qualité à Montréal",
      "description": "Masakali Cuisine Indienne — expérience culinaire indienne de qualité à Montréal. Réservez votre table, explorez notre menu et commandez un service de traiteur."
    },
    "/fr/about": {
      "title": "À propos | Masakali Cuisine Indienne",
      "description": "L'histoire de Masakali à Montréal — cuisine indienne authentique, réservations et traiteur."
    },
    "/fr/menu": {
      "title": "Menu | Masakali Cuisine Indienne Montréal",
      "description": "Découvrez notre menu soigneusement élaboré comprenant des plats indiens authentiques, des currys classiques aux créations innovantes."
    },
    "/fr/locations": {
      "title": "Emplacements | Masakali Cuisine Indienne Montréal",
      "description": "Visitez Masakali Cuisine Indienne à Montréal. Les restaurants sœurs du groupe Masakali sont listés avec des liens vers leurs sites web."
    },
    "/fr/reservations": {
      "title": "Réservations | Masakali Cuisine Indienne Montréal",
      "description": "Réservez votre expérience culinaire chez Masakali Cuisine Indienne à Montréal."
    },
    "/fr/catering": {
      "title": "Traiteur | Masakali Cuisine Indienne Montréal",
      "description": "Laissez Masakali organiser le traiteur de votre prochain événement avec une cuisine indienne authentique."
    },
    "/fr/catering-by-tray": {
      "title": "Traiteur par plateau | Masakali Montréal",
      "description": "Commandez des plateaux traiteur chez Masakali Cuisine Indienne à Montréal."
    },
    "/fr/contact": {
      "title": "Contactez-nous | Masakali Cuisine Indienne Montréal",
      "description": "Vous avez une question ou un commentaire ? Contactez Masakali Cuisine Indienne à Montréal."
    }
  }
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function normalizePath(pathname) {
  const raw = String(pathname || '/').split('?')[0].split('#')[0] || '/';
  if (raw.length > 1 && raw.endsWith('/')) return raw.replace(/\/+$/, '') || '/';
  return raw || '/';
}

function toEnglishPath(pathname) {
  const p = normalizePath(pathname);
  if (p === '/fr') return '/';
  if (p.startsWith('/fr/')) return p.slice(3) || '/';
  return p;
}

function toFrenchPath(pathname) {
  const en = toEnglishPath(pathname);
  return en === '/' ? '/fr' : `/fr${en}`;
}

function resolvePage(pathname) {
  const p = normalizePath(pathname);
  if (SITE.pages[p]) return { path: p, ...SITE.pages[p], isFrench: p === '/fr' || p.startsWith('/fr/') };
  // FR fallback: reuse EN page copy with /fr path (Montreal)
  if (SITE.hasFr) {
    const en = toEnglishPath(p);
    if (SITE.pages[en] && (p === '/fr' || p.startsWith('/fr/'))) {
      return { path: p, ...SITE.pages[en], isFrench: true };
    }
  }
  return null;
}

function buildWebPageJsonLd(page) {
  const url = `${SITE.siteUrl}${page.path === '/' ? '/' : page.path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE.siteName,
      url: SITE.siteUrl + '/',
    },
  };
}

function buildBodyHtml(page) {
  const nav = SITE.navLinks
    .map(([href, label]) => {
      const link = page.isFrench
        ? (href === '/' ? '/fr' : `/fr${href}`)
        : href;
      return `<a href="${escapeAttr(link)}">${escapeHtml(label)}</a>`;
    })
    .join(' · ');
  const locs = (SITE.locationLines || [])
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join('');
  return (
    `<div data-seo-prerender-body>` +
    `<header><p>${escapeHtml(SITE.siteName)}</p>` +
    `<h1>${escapeHtml(SITE.brandH1)}</h1>` +
    `<p>${escapeHtml(page.description)}</p>` +
    `<nav aria-label="Primary">${nav}</nav></header>` +
    `<main><h2>${escapeHtml(page.title)}</h2>` +
    `<p>${escapeHtml(page.description)}</p>` +
    (locs ? `<ul>${locs}</ul>` : '') +
    `</main></div>`
  );
}

function upsertMetaByName(html, name, content) {
  const re = new RegExp(`<meta\\s+[^>]*name=["']${name}["'][^>]*>`, 'i');
  const tag = `<meta name="${name}" content="${escapeAttr(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function upsertMetaByProperty(html, property, content) {
  const re = new RegExp(`<meta\\s+[^>]*property=["']${property}["'][^>]*>`, 'i');
  const tag = `<meta property="${property}" content="${escapeAttr(content)}" data-seo-prerender="1" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

/**
 * @param {string} html - raw index.html
 * @param {string} pathname - request path
 * @returns {string} enhanced HTML (or original if route has no static page SEO)
 */
function applySeoShell(html, pathname) {
  const page = resolvePage(pathname);
  if (!page || !html) return html;

  let out = html;
  const canonical = `${SITE.siteUrl}${page.path === '/' ? '/' : page.path}`;
  const lang = page.isFrench ? 'fr' : SITE.htmlLang;

  out = out.replace(/<html([^>]*)lang=["'][^"']*["']/i, `<html$1lang="${lang}"`);
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);
  out = upsertMetaByName(out, 'description', page.description);
  out = upsertMetaByProperty(out, 'og:title', page.title);
  out = upsertMetaByProperty(out, 'og:description', page.description);
  out = upsertMetaByProperty(out, 'og:url', canonical);
  out = upsertMetaByProperty(out, 'og:locale', page.isFrench ? 'fr_CA' : SITE.locale);

  // Canonical: remove any existing then inject one marked for client cleanup
  out = out.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, '');
  let headInject = `    <link rel="canonical" href="${escapeAttr(canonical)}" data-seo-prerender="1" />\n`;

  if (SITE.hasFr) {
    const enPath = toEnglishPath(page.path);
    const frPath = toFrenchPath(page.path);
    headInject +=
      `    <link rel="alternate" hreflang="en-CA" href="${escapeAttr(SITE.siteUrl + (enPath === '/' ? '/' : enPath))}" data-seo-prerender="1" />\n` +
      `    <link rel="alternate" hreflang="fr-CA" href="${escapeAttr(SITE.siteUrl + frPath)}" data-seo-prerender="1" />\n` +
      `    <link rel="alternate" hreflang="x-default" href="${escapeAttr(SITE.siteUrl + (enPath === '/' ? '/' : enPath))}" data-seo-prerender="1" />\n`;
  }

  const jsonLd = buildWebPageJsonLd(page);
  headInject +=
    `    <script type="application/ld+json" data-seo-prerender="1">${JSON.stringify(jsonLd)}</script>\n`;

  out = out.replace(/<\/head>/i, `${headInject}  </head>`);

  const body = buildBodyHtml(page);
  if (/<div id="root"\s*><\/div>/i.test(out)) {
    out = out.replace(/<div id="root"\s*><\/div>/i, `<div id="root">${body}</div>`);
  } else if (/<div id="root"[^>]*>\s*<\/div>/i.test(out)) {
    out = out.replace(/<div id="root"[^>]*>\s*<\/div>/i, `<div id="root">${body}</div>`);
  }

  return out;
}

function canEnhancePath(pathname) {
  return !!resolvePage(pathname);
}

module.exports = {
  applySeoShell,
  canEnhancePath,
  SITE,
};
