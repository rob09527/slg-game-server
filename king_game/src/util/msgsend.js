
'use strict'

const {curl} = require('urllib');

const default_opts = {
	method: 'POST',
	dataType: 'json',
	contentType: 'json',
	data: {},
}

const DEFAULT_URL = 'http://127.0.0.1:8003';

module.exports = exports = function ({path = '/beat', opts}) {
	// 设置默认值
	opts = {...default_opts, ...opts};
	// 拼接url
	let url = DEFAULT_URL+path;

	return curl(url, opts);
}