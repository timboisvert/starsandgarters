// Loads content/shows.json (a { "shows": [...] } object edited via /admin)
// and exposes the inner array as the `shows` global, unchanged for templates.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function () {
    const raw = readFileSync(join(__dirname, "../../content/shows.json"), "utf-8");
    return JSON.parse(raw).shows;
}
