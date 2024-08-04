let fetch;

(async () => {
    fetch = (await import('node-fetch')).default;
})();

const cheerio = require('cheerio');

function extractFilename(url) {
    const regex = /\/([^\/?#]+)$/i;
    const matches = url.match(regex);
    if (matches && matches.length > 1) {
        return matches[1];
    }
    return null;
}
function getRedirectUrl(url) {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('r');
}
async function scrap(url) {
    try {
        const response = await fetch(url);
        const textData = await response.text();
        const $ = cheerio.load(textData);
        let json = {};
        const redirectUrl = $('.header_poster_wrapper .right_column p a').attr('href');
        $('.providers').each((index, element) => {
            $(element).find('a').each((index, anchor) => {
                const href = $(anchor).attr('href');
                const img = $(anchor).find('img');
                const imgSrc = extractFilename(img.attr('src'));
                json[imgSrc] = getRedirectUrl(href);
            });
        });
        return {links: json,justWatch: redirectUrl};
    } catch (e) {
        return {error: e}
    }
}


module.exports = {
    scrap: scrap
}
