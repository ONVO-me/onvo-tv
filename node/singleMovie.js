const NodeCache = require('node-cache');
let fetch;

(async () => {
    fetch = (await import('node-fetch')).default;
})();

const path = require('path');
const fs = require('fs');
const cache = new NodeCache();

function calculateSize(obj) {
    return Buffer.byteLength(JSON.stringify(obj), 'utf8');
}

async function getData(type, id, season, episode, dir = 'data', chache = true, ttl = 120) {
    const cacheKey = `${type}_${id}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }
    try {
        const response = await fetch(`https://api.onvo.me/engine/tv?type=${type}&id=${id}&${dir}${season ? `&season=${season}` : ``}${episode && season ? `&episode=${episode}` : ``}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json()
        if (chache) {
            cache.set(cacheKey, data, ttl);
        }
        saveJson(data, cacheKey)
        return data;
    } catch (error) {
        const jsonPath = path.join(__dirname,'../', 'public', 'offline', 'json',`${cacheKey}.json`);
        if (fs.existsSync(jsonPath)) {
            const json = fs.readFileSync(jsonPath, 'utf8');
            return JSON.parse(json)
        }
        console.error('Error fetching data:', error);
    }
}


async function saveJson(data, cacheKey) {
    try {
        const jsonDir = path.join(__dirname, '../public', 'offline', 'json');
        if (!fs.existsSync(jsonDir)) {
            fs.mkdirSync(jsonDir, { recursive: true });
        }
        const filePath = path.join(jsonDir, `${cacheKey}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`JSON data saved successfully to ${filePath}`);
    } catch (error) {
        console.error('Error saving JSON data:', error);
    }
}

module.exports = {
    getData: getData
};
