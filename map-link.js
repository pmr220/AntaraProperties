/* Only open Google Maps HTTPS URLs; blank locations remain optional. */
window.AntaraMapLink = value => {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    const host = url.hostname;
    const share = host === 'maps.app.goo.gl' || (host === 'goo.gl' && url.pathname.startsWith('/maps/'));
    const maps = ['maps.google.com','maps.google.co.in'].includes(host);
    const google = ['google.com','www.google.com','google.co.in','www.google.co.in'].includes(host)
      && /^\/maps(?:\/|$)/.test(url.pathname);
    return share || maps || google ? url.href : null;
  } catch { return null; }
};
