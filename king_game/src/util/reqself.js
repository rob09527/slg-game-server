
'use strict'

const assert = require('assert');
const {curl} = require('urllib');

const reqSelf = async function (path, params = {}) {
	let opts = {
		method: 'POST',
		contentType: 'json',
		dataType: 'json',
		headers: {
			'x-kaihei': 1,
		},
		data: params,
	}
	let url = `http://127.0.0.1:${port}${path}`;
	let {status, data} = await curl(url, opts);
	assert(status === 200, 'req fail');
	assert(!data.error, data.error);
	return data;
}

const reqSelf_invoke = async function(path, params = {}) {
	// todo 调用自己的接口
}

module.exports = reqSelf_invoke;