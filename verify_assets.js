const http = require('http');

const files = ['/styles.css', '/blockchain.js', '/network-visualizer.js', '/app.js'];

async function checkFile(url) {
    return new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:3000' + url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`[${res.statusCode}] ${url} (${res.headers['content-type']}, ${data.length} bytes)`);
                resolve(res.statusCode === 200);
            });
        }).on('error', reject);
    });
}

(async () => {
    for (let f of files) {
        await checkFile(f);
    }
    process.exit(0);
})();
