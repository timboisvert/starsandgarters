export default function (eleventyConfig) {
    // Get current date in YYYY-MM-DD format (for build time)
    eleventyConfig.addFilter("currentDate", () => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    });

    // Custom date filter
    eleventyConfig.addFilter("longDate", (dateStr) => {
        const date = new Date(dateStr + "T12:00:00");
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    });

    // Sort shows: pinned first, then by next upcoming event (date+time), then alphabetically
    eleventyConfig.addFilter("sortShows", (shows, events, today) => {
        // Build map of show slug -> next upcoming event (timestamp + raw values)
        const nextEventMap = {};

        // Compute local midnight of `today` for accurate comparisons
        let todayTs = Date.now();
        if (typeof today === "string" && today.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [ty, tm, td] = today.split("-").map(Number);
            todayTs = new Date(ty, tm - 1, td, 0, 0, 0).getTime();
        }

        for (const event of events) {
            // Parse event.time (e.g. "7:00 PM") into hours/minutes
            const [timePart = "00:00", ampm] = (event.time || "").split(" ");
            let [hours = 0, minutes = 0] = timePart.split(":").map(n => parseInt(n, 10) || 0);
            if (ampm === "PM" && hours !== 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;

            const [y, m, d] = event.date.split("-").map(Number);
            const eventTs = new Date(y, m - 1, d, hours, minutes, 0).getTime();

            // Only record the first upcoming event per show
            if (eventTs >= todayTs && !nextEventMap[event.show]) {
                nextEventMap[event.show] = { date: event.date, time: event.time, ts: eventTs };
            }
        }

        const pinned = [];
        const withUpcoming = [];
        const withoutUpcoming = [];

        for (const show of shows) {
            const next = nextEventMap[show.slug] || null;
            const hasUpcoming = !!next;

            // Respect pin positions only when the show actually has a future event
            if (show.pinPosition && hasUpcoming) {
                pinned.push({ show, next });
            } else if (hasUpcoming) {
                withUpcoming.push({ show, next });
            } else {
                withoutUpcoming.push({ show, next: null });
            }
        }

        // Sort pinned by explicit position (use event time as tiebreaker)
        pinned.sort((a, b) => {
            if (a.show.pinPosition !== b.show.pinPosition) {
                return a.show.pinPosition - b.show.pinPosition;
            }
            return (a.next?.ts || Infinity) - (b.next?.ts || Infinity);
        });

        // Sort remaining upcoming shows by next event timestamp (chronological)
        withUpcoming.sort((a, b) => {
            if (a.next.ts === b.next.ts) {
                return a.show.title.localeCompare(b.show.title);
            }
            return a.next.ts - b.next.ts;
        });

        // Put shows without upcoming events at the end (alphabetical)
        withoutUpcoming.sort((a, b) => a.show.title.localeCompare(b.show.title));

        return [...pinned, ...withUpcoming, ...withoutUpcoming].map(item => item.show);
    });

    // Copy static assets
    eleventyConfig.addPassthroughCopy("posters");
    eleventyConfig.addPassthroughCopy("logo.png");
    eleventyConfig.addPassthroughCopy("map.png");
    eleventyConfig.addPassthroughCopy("favicon.png");

    // Ignore style.css (Tailwind handles it separately)
    eleventyConfig.watchIgnores.add("src/style.css");

    // Add delay to prevent rapid rebuilds
    eleventyConfig.setWatchThrottleWaitTime(100);

    // Serve on port 5173 using Eleventy Dev Server
    // (Eleventy v2+ uses `setServerOptions` instead of BrowserSync)
    eleventyConfig.setServerOptions({
        port: 5173
    });

    return {
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            data: "_data"
        }
    };
}
