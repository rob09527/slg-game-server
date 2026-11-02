
'use strict'

const assert = require('assert');

const {curl} = require('urllib');

const DEFAULT_URL = `http://${global.config.COMMON}`;


module.exports = exports = async function (path, params, opt = {}) {
	const {
		SERVINFO: {
			type: SPEC_TYPE,
		}
	} = global.config;

	// 特殊服务器指定
	if (SPEC_TYPE) params.spec = SPEC_TYPE;
	let opts = {
		method: 'POST',
		dataType: 'json',
		contentType: 'json',
		data: params,
		...opt
	}
	// 拼接url
	let url = DEFAULT_URL+path;

	let {status, data} = await curl(url, opts);
	assert(status == 200, 'req fail');
	assert(!data.error, data.error);
	return data;
}
