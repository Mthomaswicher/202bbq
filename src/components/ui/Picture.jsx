import images from '../../data/images.json';

/**
 * The only way photographs are rendered. Reads the manifest written by
 * scripts/optimize-images.mjs and emits AVIF → WebP → JPEG sources with the
 * blur placeholder as a background until the image arrives.
 *
 * `ratio` overrides the intrinsic aspect ratio (e.g. "4 / 5" for a crop);
 * `position` is object-position.
 */
export default function Picture({ name, alt, sizes = '100vw', loading = 'lazy', priority = false, ratio, position, className = '', radius = true, style }) {
  const img = images[name];
  if (!img) return null;
  const srcset = fmt => img.sources[fmt]?.map((src, i) => `${src} ${img.widths[i]}w`).join(', ');
  const fallbackFmt = img.sources.jpg ? 'jpg' : 'png';
  const fallback = img.sources[fallbackFmt];
  const largest = fallback[fallback.length - 1];

  return (
    <picture
      className={`picture ${className}`.trim()}
      style={{
        backgroundColor: img.color,
        backgroundImage: `url("${img.lqip}")`,
        backgroundSize: 'cover',
        backgroundPosition: position ?? 'center',
        aspectRatio: ratio === null ? 'auto' : (ratio ?? `${img.width} / ${img.height}`),
        borderRadius: radius ? 'var(--r-3)' : 0,
        overflow: 'hidden',
        display: 'block',
        ...style,
      }}
    >
      {img.sources.avif && <source type="image/avif" srcSet={srcset('avif')} sizes={sizes} />}
      {img.sources.webp && <source type="image/webp" srcSet={srcset('webp')} sizes={sizes} />}
      <img
        src={largest}
        srcSet={srcset(fallbackFmt)}
        sizes={sizes}
        width={img.width}
        height={img.height}
        alt={alt}
        loading={priority ? 'eager' : loading}
        fetchpriority={priority ? 'high' : undefined}
        decoding={priority ? 'sync' : 'async'}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position ?? 'center', display: 'block' }}
      />
    </picture>
  );
}
