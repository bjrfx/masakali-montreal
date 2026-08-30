export const SITE_KEY = 'montreal';

export const SITE_LOCATION_SLUGS = {
  california: ['california'],
  montreal: ['montreal'],
  rangde: ['rangde'],
  restobar: ['restobar'],
  ottawa: ['stittsville', 'wellington'],
};

export function filterLocationsForCurrentSite(locations = []) {
  const allowedSlugs = SITE_LOCATION_SLUGS[SITE_KEY] || [];
  return locations.filter((location) => {
    const slug = location.location_slug || location.slug;
    return allowedSlugs.includes(String(slug || '').toLowerCase());
  });
}
