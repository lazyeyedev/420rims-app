// Local inline SVG placeholder — no external service dependency.
// via.placeholder.com was deprecated and no longer reliably resolves.
export const getPlaceholder = (width = 400, height = 260) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#141414"/>
    <text x="50%" y="50%" fill="#888888" font-family="Arial, sans-serif" font-size="${Math.round(height * 0.08)}" text-anchor="middle" dominant-baseline="middle">No Image</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
