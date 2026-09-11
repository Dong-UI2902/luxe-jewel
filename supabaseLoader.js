export default function supabaseLoader({ src, width, quality }) {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    // Đổi mặc định quality xuống 60
    return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 60}&output=webp`;
  }
  return src;
}
