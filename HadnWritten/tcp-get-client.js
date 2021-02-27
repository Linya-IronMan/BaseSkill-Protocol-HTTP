const net = require('net');

const ReadyState = {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4,
}


class XMLHttpRequest {
    constructor() {
        this.readyState = ReadyState.UNSENT; // 默认初始化 没有调用 open 方法
        this.headers = {'Connection': 'keep-alive'}; // 请求头 开始是空的 可以设置  
    }
    open(method, url) {
        this.method = method;
        this.url = url;
        // http://127.0.0.1:8080/get => hostname: 127.0.0.1 port: 8080  path: /get
        let {hostname, port, path} = require('url').parse(url);
        this.hostname = hostname;
        this.port = port;
        this.path  = path;
        this.headers['Host'] = `${this.hostname}:${this.port}`;
        // 通过传输层 net 模块 发起请求
        const socket = this.socket = net.createConnection(
            { hostname, port },
            () => {
                socket.on('data', data =>{
                    data = data.toString();
                    console.log('data: ========', data);
                    // 对data的响应报文进行分割处理 解析
                    let [response, bodyRows] = data.split('\r\n\r\n'); // 分割响应头和响应体
                    let [statusLine, ...headerRows] = response.split('\r\n');
                    let [, status, statusText] = statusLine.split(' ');
                    this.status = status;
                    this.statusText = statusText;
                    this.responseHeaders = headerRows.reduce((memo, row) => {
                        let [key, value] = row.split(': ');
                        memo[key] = value;
                        return memo;
                    }, {});
                    this.readyState = ReadyState.HEADERS_RECEIVED; // 这里接收到 响应头部 
                    let [, body, ] = bodyRows.split('\r\n');
                    this.readyState = ReadyState.LOADING; // 处理响应体过程中
                    this.response = this.responseText = body;
                    this.readyState = ReadyState.DONE;
                    this.onload && this.onload();
                    

                    // 
                })
            }
        );
        this.readyState = ReadyState.OPENED;
    }
    setRequestHeader(header, value) {
        this.headers[header] = value;
    }
    send() {
        let rows = [];
        rows.push(`${this.method} ${this.url} HTTP/1.1`);
        
        rows.push(...Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`));
         
        let request = rows.join('\r\n') + '\r\n\r\n';
        console.log('request', request);
        this.socket.write(request);
    }
    // 获取所有响应头
    getAllResponseHeaders() {
        let result = '';
        for (let key in this.responseHeaders) {
            result += `${key}: ${this.responseHeaders[key]}`;
        }
        return result;
    }
    getResponseHeader(key) {
        return this.responseHeaders[key];
    }

}

let xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
    
}
xhr.open('GET', 'http://127.0.0.1:8080/get');
xhr.responseType = 'text';
xhr.setRequestHeader('name', 'zhufeng');
xhr.setRequestHeader('age', '11');
xhr.onload = function () {
    console.log('readyState', xhr.readyState);
    console.log('status', xhr.status);
    console.log('statusText', xhr.statusText);
    console.log('getAllResponseHeaders', xhr.getAllResponseHeaders());
    console.log('response', xhr.response);
}
xhr.send();