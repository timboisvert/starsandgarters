// Loads content/auditions.json (an array) as the `auditions` global.
// Poster filenames are rewritten to .webp to match the optimized build output.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { rewritePosterExtensions } from "../../lib/posters.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function () {
    const raw = readFileSync(join(__dirname, "../../content/auditions.json"), "utf-8");
    return rewritePosterExtensions(JSON.parse(raw));
}
