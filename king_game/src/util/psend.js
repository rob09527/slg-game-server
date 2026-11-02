
'use strict'

const { curl } = require('urllib');
const { stringify: qs } = require('querystring');

module.exports = exports = function (path, param, options) {
	const proxy = global.config.PROXY || {};
	options = options || {}
	const opts = {
		method: options.method || 'POST',
		dataType: options.dataType || 'json',
		contentType: options.contentType || 'json',
		timeout: options.timeout || 5000,
		headers: { 'x-kaihei': 1 },
		data: param,
	}
	const protocol = (proxy.PROTO || 'http') + '://';
	const host = proxy.HOST || 'localhost';
	const port = ':' + (proxy.PORT || 8001);
	const query = options.query ? '?' + qs(options.query) : '';

	const url = protocol + host + port + path + query;
	console.log(path, "psend", url)
	return curl(url, opts);
}