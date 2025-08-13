const fs = require('fs');

module.exports = function (config) {
    config.addPassthroughCopy({
        'src/images/favicon/favicon.ico': 'favicon.ico',
    });
    config.addPassthroughCopy('src/manifest.webmanifest');
    config.addPassthroughCopy('src/fonts/*.woff2');
    config.addPassthroughCopy('src/styles');
    config.addPassthroughCopy('src/scripts');
    config.addPassthroughCopy(
        'src/**/*.(html|jpg|png|webp|avif|ico|svg|mp4|xml|ics)',
    );
    config.addPassthroughCopy('src/(robots|humans).txt');

    // Collections

    config.addCollection('withTags', function (collectionApi) {
        return collectionApi.getAll().filter(function (item) {
            return 'tags' in item.data;
        });
    });

    // Filters

    config.addFilter('readableDate', (d) => {
        const year = d.getFullYear();
        const date = d.getDate();

        const months = [
            'января',
            'февраля',
            'марта',
            'апреля',
            'мая',
            'июня',
            'июля',
            'августа',
            'сентября',
            'октября',
            'ноября',
            'декабря',
        ];
        const monthIndex = d.getMonth();
        const monthName = months[monthIndex];

        return `${date} ${monthName}, ${year}`;
    });

    function sortByDate(array, dateField = 'date') {
        return [...array].sort(
            (a, b) => a[dateField].getTime() - b[dateField].getTime(),
        );
    }

    config.addFilter('getLastEvent', (array) => {
        const articles = sortByDate(array);

        return articles[articles.length - 1];
    });

    config.addFilter('sortByDate', (array) => {
        return sortByDate(array);
    });

    config.addFilter('limit', (array, limit) => {
        return array.slice(0, limit);
    });

    config.addFilter('filterCollection', (array, tag) => {
        if (!tag) {
            return array;
        }

        return array.filter(
            (item) => 'tags' in item.data && item.data.tags.includes(tag),
        );
    });

    config.addFilter('speakerTalks', (array, speakerId) => {
        return array.filter((talk) => talk.data.speaker === speakerId);
    });

    config.addFilter('getEventName', (array, eventId) => {
        return array.find((event) => event.data.id === eventId).data.name;
    });

    // Transforms

    config.addTransform('htmlmin', require('./_11ty/transforms/htmlmin'));

    config.addTransform('xmlmin', require('./_11ty/transforms/xmlmin'));

    // BrowserSync config

    config.setBrowserSyncConfig({
        callbacks: {
            ready: function (_err, bs) {
                bs.addMiddleware('*', (_req, res) => {
                    const content_404 = fs.readFileSync('_public/404.html');
                    res.writeHead(404, {
                        'Content-Type': 'text/html; charset=UTF-8',
                    });
                    res.write(content_404);
                    res.end();
                });
            },
        },
    });

    // Markdown config

    let markdownIt = require('markdown-it');
    let options = {
        html: true,
        typographer: true,
    };
    config.setLibrary('md', markdownIt(options).disable('code'));

    // Plugins

    config.addPlugin(require('@11ty/eleventy-plugin-syntaxhighlight'), {
        templateFormats: ['njk', 'md'],
        trim: true,
    });

    config.addPlugin(require('./_11ty/plugins/img-prepare.js'));

    return {
        dir: {
            input: 'src',
            output: '_public',
            includes: 'includes',
            layouts: 'layouts',
            data: 'data',
        },
        dataTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
        passthroughFileCopy: true,
        templateFormats: ['md', 'njk'],
    };
};
