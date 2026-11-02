
'use strict'

const assert = require('assert');

const {curl} = require('urllib');

module.exports = exports = function (serv, path, param, options) {
	const server = serv || {};
	assert(server.host, 'invalid gameserv');
	options = options || {}
	const opts = {
		method: options.method || 'POST',
		dataType: options.dataType || 'json',
		contentType: options.contentType || 'json',
		timeout: options.timeout || 10000,
		headers: {'x-kaihei': 1},
		data: param,
	}
	const protocol = (server.proto || 'http') + '://';
	const host = server.host || 'localhost';
	const port = ':' + (server.port || 80);

	const url = protocol + host + port + (path || '/');

	return curl(url, opts);
}