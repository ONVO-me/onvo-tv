let fetch;

(async () => {
    fetch = (await import('node-fetch')).default;
})();

const NodeCache = require('node-cache');
const cache = new NodeCache();


async function getData(id, chache = true, ttl = 120) {
    const cachedData = cache.get(id);
    if (cachedData) {
        return cachedData;
    }
    try {
        const response = await fetch(`https://api.onvo.me/tv/title?party_info=true&id=${id}`,{
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if(chache){
            cache.set(id, data, ttl);
        }
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

module.exports = {
    getData: getData
};
