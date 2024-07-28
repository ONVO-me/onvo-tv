// const SSDP = require('node-ssdp').Client;
const os = require('os');

// class NetworkDeviceConnector {
//     constructor() {
//         this.client = new SSDP();
//         this.seenDevices = {};
//     }

//     isSmartTV(headers) {
//         const smartTVIdentifiers = ['Samsung', 'LG', 'Sony', 'Philips', 'Panasonic', 'Sharp', 'Toshiba', 'Hisense', 'Vizio'];
//         if (headers.SERVER || headers.ST.includes('urn:dial-multiscreen-org:service:dial:1')) {
//             for (const identifier of smartTVIdentifiers) {
//                 if (headers.SERVER.includes(identifier)) {
//                     return true;
//                 }
//             }
//         }
//         if (headers.ST && headers.ST.includes('urn:dial-multiscreen-org:service:dial:1')) {
//             return true;
//         }
//         return false;
//     }

//     discoverDevices(callback) {
//         let smartTVs = {};
//         let otherDevices = {};

//         this.client.on('response', (headers, statusCode, rinfo) => {
//             if (this.seenDevices[rinfo.address]) return;
//             this.seenDevices[rinfo.address] = true;

//             console.log(`Response from: ${rinfo.address} with headers:`, headers);

//             if (this.isSmartTV(headers)) {
//                 console.log(`Smart TV found at: ${rinfo.address}`);
//                 smartTVs[rinfo.address] = true;
//             } else {
//                 console.log(`Other device found at: ${rinfo.address}`);
//                 otherDevices[rinfo.address] = 'Unknown Device';
//             }
//         });

//         this.client.search('ssdp:all');

//         setTimeout(() => {
//             callback(smartTVs, otherDevices);
//         }, 5000); // Wait for 5 seconds to gather responses
//     }

//     getLocalIP() {
//         const interfaces = os.networkInterfaces();
//         for (let interfaceName in interfaces) {
//             for (let iface of interfaces[interfaceName]) {
//                 if (iface.family === 'IPv4' && !iface.internal) {
//                     return iface.address;
//                 }
//             }
//         }
//         return null;
//     }
// }

function getNetwork(e) {
    return new Promise((resolve, reject) => {
        const interfaces = os.networkInterfaces();
        for (let interfaceName in interfaces) {
            for (let iface of interfaces[interfaceName]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    resolve({ip: iface.address});
                }
            }
        }
        reject({error: 'ip_not_found'});
        return;
        /*
        if (e) {
            
        }
        const connector = new NetworkDeviceConnector();
        connector.discoverDevices((smartTVs, otherDevices) => {
            const data = {
                tv: Object.keys(smartTVs),
                other: otherDevices,
                ip: connector.getLocalIP()
            }
            resolve(data);
        });
        setTimeout(() => {
            reject({ error: 'timeout_request', type: 'Request Timeout', message: 'Try again, something wrong' })
        }, 15000)*/
    });
}

module.exports = { getNetwork: getNetwork }

/*

return;

const WebSocket = require('ws');
const ip = '192.168.1.2'; // Replace with your TV's IP address
const appName = 'MyApp'; // This can be any name for your application
const browserAppId = 'org.tizen.browser'; // Application ID for the Samsung browser
const url = 'http://tv.onvo.me'; // URL you want to open in the browser

const ws = new WebSocket(`wss://${ip}:8002/api/v2/channels/samsung.remote.control?name=${encodeURIComponent(appName)}`, {
    rejectUnauthorized: false
});

ws.on('open', function open() {
    console.log('Connected to TV');

    // Try different message structures
    const messages = [
        {
            method: 'ms.channel.emit',
            params: {
                event: 'ed.apps.launch',
                to: 'host',
                data: {
                    appId: browserAppId,
                    action_type: 'NATIVE_LAUNCH',
                    metaTag: {
                        content_id: url
                    }
                }
            }
        },
        {
            method: 'ms.channel.emit',
            params: {
                event: 'ed.apps.launch',
                to: 'host',
                data: {
                    appId: browserAppId,
                    action_type: 'NATIVE_LAUNCH',
                    parameters: {
                        url: url
                    }
                }
            }
        },
        {
            method: 'ms.channel.emit',
            params: {
                event: 'ed.apps.launch',
                to: 'host',
                data: {
                    appId: browserAppId,
                    action_type: 'NATIVE_LAUNCH',
                    metaTag: {
                        content_id: url
                    },
                    parameters: {
                        url: url
                    }
                }
            }
        }
    ];

    messages.forEach((message, index) => {
        console.log(`Sending message ${index + 1}:`, JSON.stringify(message));
        ws.send(JSON.stringify(message));
    });
});

ws.on('message', function incoming(data) {
    console.log('Message from TV:', data);
});

ws.on('close', function close(code, reason) {
    console.log(`Disconnected from TV with code: ${code}, reason: ${reason}`);
});

ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
});

return;
const os = require('os');

function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const networkInterface = networkInterfaces[interfaceName];
    for (const interface of networkInterface) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIP = getLocalIP();
console.log(`Local IP Address: ${localIP}`);

*/