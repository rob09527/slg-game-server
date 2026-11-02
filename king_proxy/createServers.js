
/*
	内部代理
*/

'use strict'

const http = require('http');
const https = require('https');
const net = require('net');
const fs = require('fs');

const debug = require('debug')('kaihei:launcher:createServers');

const default_options = {
	port: 8081
}

const awaitListen = function (server) {
	return new Promise((resolve, reject) => {
		server.once('listening', function () {
			return resolve();
		})
		server.once('error', function (err) {
			return reject(err);
		})
	})
}

/*
	app - koa实例
	options - 配置内容
*/

module.exports = async function (app, options = {}) {
	options = { ...default_options, ...options };
	let {
		port,
		ssl,
	} = options;
	port = Number.parseInt(port);
	let httpPort = port;
	let server = http.createServer(app.callback()).listen(httpPort);
	await awaitListen(server);
	debug('http server listen at', server.address().port);
	if (!ssl) return;
	// ssl服务
	let httpsPort = port - 1000;
	let ssl_options = {
		key: fs.readFileSync(ssl.key),
		cert: fs.readFileSync(ssl.cert),
	}
	let ssl_server = https.createServer(ssl_options, app.callback()).listen(httpsPort);
	await awaitListen(ssl_server);
	console.log('listening port:', httpsPort)
	debug('ssl server listen at', ssl_server.address().port);
}