const os = require('os');

function getNetwork(e) {
    return new Promise((resolve, reject) => {
        const interfaces = os.networkInterfaces();
        resolve(interfaces);
        for (let interfaceName in interfaces) {
            for (let iface of interfaces[interfaceName]) {
                if (iface.family === 'IPv4' && !iface.internal && (iface.cidr?.includes('/24') || iface.cidr?.address.includes('192'))) {
                    resolve({ip: iface.address});
                }
            }
        }
        reject({error: 'ip_not_found'});
        return;
    });
}

module.exports = { getNetwork: getNetwork }
