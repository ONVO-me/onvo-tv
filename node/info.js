const fs = require('fs');
const path = require('path');
// const disk = require('diskusage')

function checkDiskSpace(directory) {
    return new Promise((resolve, reject) => {
        disk.check(directory, (err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
}

function prettyBytes(num) {
    const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const neg = num < 0
    if (neg) num = -num
    if (num < 1) return (neg ? '-' : '') + num + ' B'
    const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
    const unit = units[exponent]
    num = Number((num / Math.pow(1000, exponent)).toFixed(2))
    return (neg ? '-' : '') + num + ' ' + unit
}
function readDir(currentDir, isRoot = false) {
    const structure = {
        type: 'folder',
        size: 0,
        sizeBytes: 0,
        contents: {},
        path: currentDir
    };

    const items = fs.readdirSync(currentDir);

    items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            const dirStructure = readDir(fullPath, false);
            structure.contents[item] = dirStructure;
            structure.size += dirStructure.size; // Add size of subdirectory
            structure.sizeBytes += dirStructure.sizeBytes; // Add size of subdirectory
            // Only check for info.json in direct child folders of the root
            if (isRoot) {
                const infoFilePath = path.join(fullPath, 'info.json');
                if (fs.existsSync(infoFilePath)) {
                    try {
                        const infoContent = JSON.parse(fs.readFileSync(infoFilePath, 'utf8'));
                        dirStructure.info = infoContent;
                    } catch (err) {
                        console.error(`Error reading/parsing info.json in ${fullPath}:`, err);
                    }
                }
            }
        } else {
            structure.contents[item] = {
                type: 'file',
                size: stats.size, // Store the raw size
                path: fullPath
            };
            structure.size += stats.size; // Accumulate file size
            structure.sizeBytes += stats.sizeBytes; // Accumulate file size
        }
    });

    return structure;
}

function prettyBytess(struct) {
    struct.sizeBytes = (struct.size);
    struct.size = prettyBytes(struct.size);
    if (struct.type === 'folder') {
        for (const key in struct.contents) {
            prettyBytess(struct.contents[key]);
        }
    }
}

async function getInfo(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            return {};
        }
        const directoryStructure = readDir(dirPath, true);
        prettyBytess(directoryStructure);
        const allSize = 0;//;
        return {
            path: dirPath,
            type: 'folder',
            size: directoryStructure.size,
            sizeBytes: directoryStructure.sizeBytes,
            contents: directoryStructure.contents,
            avilable: prettyBytes(allSize.available)
        };
    } catch (e) {

    }
}

module.exports = {
    getInfo: getInfo
};
