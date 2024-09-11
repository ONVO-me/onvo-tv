let fetch;
(async () => {
    fetch = (await import('node-fetch')).default;
})();

const fs = require('fs')
const path = require('path')

const cheerio = require('cheerio');

const extractGroupedSubtitles = (input) => {
    const data = JSON.parse(JSON.parse(`"${(input
    .trim()
    .replace(/^\(\[\d+,"[0-9]+:/, '')  
    .slice(0, -5))}"`));     

    return data[3].children[3]
};

async function scrap(url) {
    try {
        const response = await fetch(url);
        const textData = await response.text();
        const $ = cheerio.load(textData);
        let json = '';
        $('script').each((index, element) => {
            text = $(element).text();
            if (text.includes('groupedSubtitles')) {
                json += text.replace('self.__next_f.push', '') + '\n'
            }
        });
        return extractGroupedSubtitles(json)
    } catch (e) {
        console.log(e)
    }
}

async function decode(text) {
    try {
        const iconv = require('iconv-lite');
        const encodedText = iconv.decode(Buffer.from(text, 'binary'), 'windows-1256');
        return encodedText;
    } catch (e) {
        console.error('los');
    }
}

function isUTF8(contentBuffer) {
    // Check for UTF-8 BOM (Byte Order Mark)
    if (contentBuffer[0] === 0xEF && contentBuffer[1] === 0xBB && contentBuffer[2] === 0xBF) {
        return true;
    }
    // Check for valid UTF-8 sequence
    let i = 0;
    while (i < contentBuffer.length) {
        if (contentBuffer[i] < 0x80) {
            // ASCII character
            i++;
        } else if ((contentBuffer[i] & 0xE0) === 0xC0) {
            // Two-byte sequence
            if ((contentBuffer[i + 1] & 0xC0) !== 0x80) {
                return false;
            }
            i += 2;
        } else if ((contentBuffer[i] & 0xF0) === 0xE0) {
            // Three-byte sequence
            if ((contentBuffer[i + 1] & 0xC0) !== 0x80 || (contentBuffer[i + 2] & 0xC0) !== 0x80) {
                return false;
            }
            i += 3;
        } else if ((contentBuffer[i] & 0xF8) === 0xF0) {
            // Four-byte sequence
            if ((contentBuffer[i + 1] & 0xC0) !== 0x80 || (contentBuffer[i + 2] & 0xC0) !== 0x80 || (contentBuffer[i + 3] & 0xC0) !== 0x80) {
                return false;
            }
            i += 4;
        } else {
            // Invalid byte
            return false;
        }
    }
    return true;
}
// Function to convert to UTF-8 if needed
function convertToUTF8(contentBuffer) {
    const iconv = require('iconv-lite');
    if (!isUTF8(contentBuffer)) {
        const stringContent = iconv.decode(contentBuffer, 'windows-1256');
        return stringContent.toString();
    }
    return contentBuffer.toString('utf8');
}

const fetchAndExtractZip = async (zipUrl) => {
    const unzipper = require('unzipper');

    try {
        const response = await fetch(zipUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const files = [];
        await unzipper.Open.buffer(Buffer.from(arrayBuffer)).then((zipfile) => {
            return Promise.all(zipfile.files.map(async (file) => {
                const fileName = file.path;
                const contentBuffer = await file.buffer();
                files.push({ name: fileName, content: convertToUTF8(contentBuffer) });
            }));
        });

        return files;
    } catch (error) {
        console.error('Error fetching and extracting ZIP:', error);
    }
};



module.exports = {
    scrap: scrap,
    decode: decode,
    getZip: fetchAndExtractZip,
    parse: convertToUTF8

};
