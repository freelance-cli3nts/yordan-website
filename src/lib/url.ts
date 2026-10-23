// Prefixes a site path with the deploy base ("/" or "/yordan-website/").
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return base + path.replace(/^\//, '');
}
