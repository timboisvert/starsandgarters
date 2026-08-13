// Poster images are stored as full-size .png/.jpg files (in posters/), but the
// build converts them to resized .webp files in _site/posters/. Content JSON
// keeps the original filenames; data loaders run rewritePosterExtensions() so
// every template and schema URL points at the .webp the build actually ships.

const IMG_EXT = /\.(png|jpe?g)$/i;

export function webpName(filename) {
    return filename.replace(IMG_EXT, ".webp");
}

// Recursively rewrite any "poster"-named string field (poster, linkPoster, ...)
// from .png/.jpg/.jpeg to .webp. Mutates and returns the value.
export function rewritePosterExtensions(value) {
    if (Array.isArray(value)) {
        value.forEach(rewritePosterExtensions);
    } else if (value && typeof value === "object") {
        for (const key of Object.keys(value)) {
            const v = value[key];
            if (typeof v === "string" && /poster/i.test(key) && IMG_EXT.test(v)) {
                value[key] = webpName(v);
            } else {
                rewritePosterExtensions(v);
            }
        }
    }
    return value;
}
