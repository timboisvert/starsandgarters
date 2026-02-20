export default function (eleventyConfig) {
    // Helper: format event title based on show config
    // eventTitleFormat: "event-first" = "Event: Show", default = "Show: Event"
    function formatEventTitle(event, show) {
        if (event.displayName) {
            return event.displayName;
        }
        if (event.title) {
            if (show.eventTitleFormat === "event-first") {
                return event.title + ": " + show.title;
            }
            return show.title + ": " + event.title;
        }
        return show.title;
    }

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

    // Get display name for an event
    eleventyConfig.addFilter("eventDisplayName", (event, show) => {
        return formatEventTitle(event, show);
    });

    // Get short display name for an event (just the title portion)
    eleventyConfig.addFilter("eventShortName", (event, show) => {
        if (event.displayName) {
            return event.displayName;
        }
        if (event.title) {
            return event.title;
        }
        return show.title;
    });

    // Generate slug for an event
    eleventyConfig.addFilter("eventSlug", (event) => {
        if (!event.title) return null;
        return event.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    });

    // Filter events for a show within N days
    eleventyConfig.addFilter("upcomingShowEvents", (events, showSlug, today, days) => {
        const todayDate = new Date(today + "T00:00:00");
        const endDate = new Date(todayDate);
        endDate.setDate(endDate.getDate() + (days || 90));

        return events.filter(event => {
            if (event.show !== showSlug) return false;
            const eventDate = new Date(event.date + "T00:00:00");
            return eventDate >= todayDate && eventDate <= endDate;
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

    // Sort shows with event pages included for homepage display
    eleventyConfig.addFilter("sortShowsWithEvents", (shows, events, today) => {
        // Build map of show slug -> next upcoming event
        const nextEventMap = {};

        let todayTs = Date.now();
        if (typeof today === "string" && today.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [ty, tm, td] = today.split("-").map(Number);
            todayTs = new Date(ty, tm - 1, td, 0, 0, 0).getTime();
        }

        const todayDate = new Date(todayTs);

        // Track all upcoming events with posters for shows with createEventPages
        const eventPagesMap = {}; // showSlug -> array of { event, ts }

        for (const event of events) {
            const [timePart = "00:00", ampm] = (event.time || "").split(" ");
            let [hours = 0, minutes = 0] = timePart.split(":").map(n => parseInt(n, 10) || 0);
            if (ampm === "PM" && hours !== 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;

            const [y, m, d] = event.date.split("-").map(Number);
            const eventTs = new Date(y, m - 1, d, hours, minutes, 0).getTime();

            if (eventTs >= todayTs) {
                // Track next event for each show
                if (!nextEventMap[event.show]) {
                    nextEventMap[event.show] = { date: event.date, time: event.time, ts: eventTs, event };
                }

                // Track all events with posters for eventPages shows
                if (event.poster) {
                    if (!eventPagesMap[event.show]) {
                        eventPagesMap[event.show] = [];
                    }
                    eventPagesMap[event.show].push({ event, ts: eventTs });
                }
            }
        }

        const results = [];

        for (const show of shows) {
            // Skip shows hidden from homepage
            if (show.hideFromHomepage) continue;

            const next = nextEventMap[show.slug] || null;
            const hasUpcoming = !!next;

            if (!hasUpcoming) {
                // Show without upcoming events
                results.push({
                    type: 'show',
                    show,
                    ts: Infinity,
                    title: show.title,
                    poster: show.poster,
                    slug: show.slug,
                    schedule: show.schedule,
                    link: '/show/' + show.slug + '/',
                    pinPosition: show.pinPosition
                });
            } else if (show.createEventPages) {
                // Show with createEventPages - show the main show AND all events with posters
                // Main show page
                results.push({
                    type: 'show',
                    show,
                    ts: next.ts,
                    title: show.title,
                    poster: show.poster,
                    slug: show.slug,
                    schedule: show.schedule,
                    link: '/show/' + show.slug + '/',
                    pinPosition: show.pinPosition
                });

                // All upcoming events with posters
                const posterEvents = eventPagesMap[show.slug] || [];
                for (const { event, ts } of posterEvents) {
                    const eventSlug = event.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '');
                    results.push({
                        type: 'event',
                        show,
                        event: event,
                        ts: ts,
                        title: formatEventTitle(event, show),
                        shortTitle: event.title,
                        poster: event.poster,
                        slug: eventSlug,
                        schedule: event.date,
                        link: '/show/' + show.slug + '/' + eventSlug + '/',
                        pinPosition: show.pinPosition
                    });
                }
            } else {
                // Regular show
                results.push({
                    type: 'show',
                    show,
                    ts: next.ts,
                    title: show.title,
                    poster: show.poster,
                    slug: show.slug,
                    schedule: show.schedule,
                    link: '/show/' + show.slug + '/',
                    pinPosition: show.pinPosition
                });
            }
        }

        // Sort: pinned first, then by timestamp, then alphabetically
        results.sort((a, b) => {
            // Pinned items first
            const aPin = a.pinPosition || Infinity;
            const bPin = b.pinPosition || Infinity;
            if (aPin !== Infinity || bPin !== Infinity) {
                if (aPin !== bPin) return aPin - bPin;
            }

            // Then by timestamp
            if (a.ts !== b.ts) return a.ts - b.ts;

            // Then alphabetically
            return a.title.localeCompare(b.title);
        });

        return results;
    });

    // Generate event pages collection for shows with createEventPages enabled
    eleventyConfig.addCollection("eventPages", function (collectionApi) {
        const shows = collectionApi.getAll()[0]?.data?.shows || [];
        const events = collectionApi.getAll()[0]?.data?.events || [];
        const today = new Date().toISOString().split('T')[0];

        const eventPages = [];

        // Find shows with createEventPages enabled
        const indexShows = shows.filter(show => show.createEventPages);

        for (const show of indexShows) {
            const days = show.indexDays || 90;
            const todayDate = new Date(today + "T00:00:00");
            const endDate = new Date(todayDate);
            endDate.setDate(endDate.getDate() + days);

            // Get events for this show that have titles
            const showEvents = events.filter(event => {
                if (event.show !== show.slug) return false;
                if (!event.title) return false;
                const eventDate = new Date(event.date + "T00:00:00");
                return eventDate >= todayDate && eventDate <= endDate;
            });

            for (const event of showEvents) {
                const slug = event.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');

                eventPages.push({
                    show: show,
                    event: event,
                    slug: slug,
                    title: formatEventTitle(event, show),
                    shortTitle: event.title,
                    poster: event.poster || show.poster,
                    ticketUrl: show.ticketUrl,
                    date: event.date,
                    time: event.time
                });
            }
        }

        return eventPages;
    });

    // Copy static assets
    eleventyConfig.addPassthroughCopy("posters");
    eleventyConfig.addPassthroughCopy("logos");
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
