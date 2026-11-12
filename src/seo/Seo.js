import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import {
  absoluteUrl,
  buildGroupOrganizationJsonLd,
  buildOrganizationJsonLd,
  buildRecommendedDishesJsonLd,
  buildRestaurantJsonLd,
  buildWebSiteJsonLd,
  pages,
  siteSeo,
} from './seoConfig';

function toEnglishPath(pathname) {
  if (!pathname || pathname === '/fr') return '/';
  if (pathname.startsWith('/fr/')) return pathname.slice(3) || '/';
  return pathname;
}

function toFrenchPath(pathname) {
  const en = toEnglishPath(pathname);
  return en === '/' ? '/fr' : `/fr${en}`;
}

export default function Seo({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex = false,
  jsonLd,
  breadcrumbs,
  hreflang,
  faqs,
}) {
  const location = useLocation();
  const rawPath = path || location.pathname || '/';
  const resolvedPath = String(rawPath).split('?')[0].split('#')[0] || '/';
  const isFrench = resolvedPath === '/fr' || resolvedPath.startsWith('/fr/');
  const pageTitle = title || siteSeo.defaultTitle;
  const pageDescription = description || siteSeo.defaultDescription;
  const canonical = absoluteUrl(resolvedPath);
  const ogImage = absoluteUrl(image || siteSeo.ogImage);
  const robots = noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';

  const autoHreflang = useMemo(() => {
    const enPath = toEnglishPath(resolvedPath);
    const frPath = toFrenchPath(resolvedPath);
    return [
      { hreflang: 'en-CA', href: absoluteUrl(enPath) },
      { hreflang: 'fr-CA', href: absoluteUrl(frPath) },
      { hreflang: 'x-default', href: absoluteUrl(enPath) },
    ];
  }, [resolvedPath]);

  const links = hreflang?.length ? hreflang : autoHreflang;

  const graph = [];
  if (jsonLd) {
    if (Array.isArray(jsonLd)) graph.push(...jsonLd);
    else graph.push(jsonLd);
  } else if (resolvedPath === '/' || resolvedPath === '/fr') {
    graph.push(buildGroupOrganizationJsonLd());
    graph.push(buildOrganizationJsonLd());
    graph.push(buildWebSiteJsonLd());
    graph.push(...buildRestaurantJsonLd());
    graph.push(...buildRecommendedDishesJsonLd());
  }

  if (breadcrumbs?.length) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    });
  }

  if (faqs?.length) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      })),
    });
  }

  
  useEffect(() => {
    // Remove server-injected SEO tags so Helmet owns a single set (no duplicate canonical/JSON-LD).
    document.querySelectorAll('[data-seo-prerender]').forEach((el) => el.remove());
  }, []);

return (
    <Helmet prioritizeSeoTags>
      <html lang={isFrench ? 'fr' : 'en'} />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteSeo.siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={isFrench ? 'fr_CA' : siteSeo.ogLocale} />
      {isFrench ? <meta property="og:locale:alternate" content="en_CA" /> : <meta property="og:locale:alternate" content="fr_CA" />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />

      {links.map((item) => (
        <link key={`${item.hreflang}-${item.href}`} rel="alternate" hrefLang={item.hreflang} href={item.href} />
      ))}

      {graph.map((node, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(node)}
        </script>
      ))}
    </Helmet>
  );
}

export function pageSeo(key, overrides = {}) {
  const page = pages[key] || {};
  return {
    title: overrides.title || page.title,
    description: overrides.description || page.description,
    path: overrides.path || page.path,
  };
}
