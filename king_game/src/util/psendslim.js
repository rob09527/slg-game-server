
'use strict'

const assert = require('assert');

const {curl} = require('urllib');



module.exports = exports = async function (path, param = {}) {
	const {
		PROXY: {
			HOST = '127.0.0.1',
			PORT = '8001'
		},
		SERVINFO: {
			type: SPEC_TYPE,
		}
	} = global.config;

	// 特殊服务器设定
	if (SPEC_TYPE) {
		param.spec = 1;
	}
	let opts = {
		method: 'POST',
		dataType: 'json',
		contentType: 'json',
		headers: {'x-kaihei': 1},
		data: param,
	}
	let url = `http://${HOST}:${PORT}${path}`;
	let status, data;
	try{
		({status, data} = await curl(url, opts));
	}catch(err){
		console.error(err);
		assert(false, 'req fail');
	}
	assert(status === 200, 'proxy reqfail');
	assert(!data.error, data.error);
	return data;
}
