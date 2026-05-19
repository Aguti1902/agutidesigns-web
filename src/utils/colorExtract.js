/**
 * Extracts dominant colors from a website's favicon using Canvas.
 * Uses Google's favicon API (CORS-safe) to fetch the image.
 * Returns an array of hex color strings, or null on failure.
 */
export async function extractColorsFromUrl(urlInput) {
  if (!urlInput?.trim()) return null;
  try {
    const normalized = urlInput.trim().startsWith('http')
      ? urlInput.trim()
      : `https://${urlInput.trim()}`;
    const domain = new URL(normalized).hostname;
    return await extractFromFavicon(domain);
  } catch {
    return null;
  }
}

function extractFromFavicon(domain) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => resolve(null), 5000);
    img.onload = () => {
      clearTimeout(timer);
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth  || 64;
        c.height = img.naturalHeight || 64;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, c.width, c.height);
        resolve(quantize(data, 5));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => { clearTimeout(timer); resolve(null); };
    img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  });
}

function quantize(data, n) {
  const map = {};
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 180) continue;
    const r = Math.round(data[i]     / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    // Skip near-white (>235) and near-black (<20) by perceived brightness
    const lum = (r * 299 + g * 587 + b * 114) / 1000;
    if (lum > 235 || lum < 20) continue;
    const key = `${r},${g},${b}`;
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => {
      const [r, g, b] = k.split(',').map(Number);
      return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    });
}

/** Creates a very light tint of a hex color (for secondary color auto-generation) */
export function makeLightVariant(hex) {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const blend = c => Math.round(c * 0.1 + 255 * 0.9);
    return `#${blend(r).toString(16).padStart(2,'0')}${blend(g).toString(16).padStart(2,'0')}${blend(b).toString(16).padStart(2,'0')}`;
  } catch {
    return '#F0F4FF';
  }
}
