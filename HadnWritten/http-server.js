const http = require('http');
const fs = require('fs');
const path = require('path')
const url = require('url');

let server = http.createServer(function(req, res) {
    let { pathname } = url.parse(req.url);
    
    if (['/get.html'].includes(req.url)) {
        res.statusCode  = 200;
        res.setHeader('Content-Type', 'text/html');
        // 同步模式读取文件内容
        let content = fs.readFileSync(path.join(__dirname, 'static', 'get.html'));

        res.write(content);
        res.end();
    } else if (pathname === '/get') {
        console.log(req.method);
        console.log(req.url);
        console.log(req.headers);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('get')
    } else {
        res.statusCode = 404;
        res.end();
    }
})

server.listen(8080)