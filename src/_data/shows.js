// Loads content/shows.json (a { "shows": [...] } object edited via /admin)
// and exposes the inner array as the `shows` global. Poster filenames are
// rewritten to .webp to match the optimized images the build produces.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { rewritePosterExtensions } from "../../lib/posters.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function () {
    const raw = readFileSync(join(__dirname, "../../content/shows.json"), "utf-8");
    return rewritePosterExtensions(JSON.parse(raw).shows);
}
