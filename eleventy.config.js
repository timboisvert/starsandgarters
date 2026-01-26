export default function (eleventyConfig) {
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

    // Sort shows: pinned first, then by next event date, then alphabetically
    eleventyConfig.addFilter("sortShows", (shows, events, today) => {
        // Build map of show slug to next event date
        const nextEventMap = {};
        for (const event of events) {
            if (event.date >= today && !nextEventMap[event.show]) {
                nextEventMap[event.show] = event.date;
            }
        }

        // Separate into pinned, with upcoming, without upcoming
        const pinned = [];
        const withUpcoming = [];
        const withoutUpcoming = [];

        for (const show of shows) {
            if (show.pinPosition) {
                pinned.push({ show, nextDate: nextEventMap[show.slug] || null });
            } else if (nextEventMap[show.slug]) {
                withUpcoming.push({ show, nextDate: nextEventMap[show.slug] });
            } else {
                withoutUpcoming.push({ show, nextDate: null });
            }
        }

        // Sort pinned by position
        pinned.sort((a, b) => a.show.pinPosition - b.show.pinPosition);

        // Sort with upcoming by date
        withUpcoming.sort((a, b) => a.nextDate.localeCompare(b.nextDate));

        // Sort without upcoming alphabetically
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

    return {
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            data: "_data"
        }
    };
}
