'use strict'

const WebSocketServer = require("ws");
const http = require("http");
const https = require("https");
const fs = require("fs");
const querystring = require("querystring");
const path = require("path");
const [, , configpath, _port] = process.argv;
const config = require(path.resolve(configpath));
const PORT = (+_port) || config.DEFAULT_PORT;

global._PORT = PORT; // 启动端口，上报到 proxy 需要使用到
Object.defineProperty(global, '_PORT', { writable: false });

const beforeStart = require("./src/before.start");

global.config = Object.assign(require('./config.default.json'), config); // 配置继承 default
global.PROCESS_KEY = `${config.HOST}-${global._PORT}`; // 实例ID,每一个实例唯一,按照host加port来绝对
Object.defineProperty(global, 'PROCESS_KEY', { writable: false });

Object.defineProperty(global, 'config', { writable: false });
beforeStart().then(_ => {
    const SocketClient = require("./src/socket/socket.client");
    const SocketProxy = require("./src/socket/socket.proxy");

    const proto = global.config.SSL ? https : http;
    const options = {};
    if (global.config.SSL) {
        options.key = fs.readFileSync(global.config.SSL.KEY);
        options.cert = fs.readFileSync(global.config.SSL.CERT);
    }

    //  启动一个http 服务
    const server = proto.createServer(options, process.env.NODE_ENV === 'development' ? require('./dev.server') : (request, response) => {
        const contentType = "text/html";
        response.writeHead(200, {
            'Content-Type': contentType
        });
        response.write("Not Found", "utf-8");
        response.end();
    });
    if (process.env.NODE_ENV === 'development') {
        require('./dev.util')(server);
    }

    const wss = new WebSocketServer.Server({
        server: server,
    });

    wss.on('connection', (client, req) => {
        const ip = req.connection.remoteAddress;
        client.ip = ip;
        const query = querystring.parse(req.url.split('?')[1] || "");
        if (global._handle_connection_ && global._handle_connection_(client, query)) { // king_agent 设置的链接监听
            return;
        } else if (query.sign) { // 登录服链接会传递内部签名
            console.log('PROXY CONNECTION', query); // 登录服链接
            SocketProxy.getInstance(client, query).then(client => {
                global.PROXY_SERVER = client;
            });
            return;
        }
        console.log('CLIENT CONNECTION', query);
        SocketClient.initInstance(client, query).catch(console.error); // 初始化一个客户端实例，不需要接返回值
    });

    server.listen(PORT, async () => {
        await require('./src/after.start')();
    });
    console.log(`SERVER START SUCCESS,ENV[${process.env.NODE_ENV}], HOST IS:`, `http://localhost:${PORT}`, 'AT', new Date().format());

});


