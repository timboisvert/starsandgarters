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
