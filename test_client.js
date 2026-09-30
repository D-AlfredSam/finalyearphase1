const http = require('http');

http.get('http://127.0.0.1:3000/', (res) => {
    console.log('STATUS:', res.statusCode);
    console.log('CONTENT-TYPE:', res.headers['content-type']);
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log('BODY LENGTH:', body.length);
        console.log('HTML TITLE:', body.match(/<title>(.*?)<\/title>/)?.[1]);
        process.exit(0);
    });
}).on('error', (e) => {
    console.error('ERROR:', e.message);
    process.exit(1);
});
