let fetch;

(async () => {
    fetch = (await import('node-fetch')).default;
})();

const NodeCache = require('node-cache');
const cache = new NodeCache();

async function getData(id, cacheEnabled = true, ttl = 120) {
    // Wait until fetch is available
    while (!fetch) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const cachedData = cache.get(id);
    if (cachedData) {
        return cachedData;
    }
    
    try {
        const response = await fetch(`https://api.onvo.me/tv/title?party_info=true&id=${id}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        if (cacheEnabled) {
            cache.set(id, data, ttl);
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error after logging it
    }
}

module.exports = {
    getData: getData
};
