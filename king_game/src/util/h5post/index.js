
'use strict'

const {curl} = require('urllib');
const crypto = require('crypto');

const exec = {
    chatpost:	require('./chatpost'),
    contentpost:require('./contentpost'),	
	loginpost:	require('./loginpost'),
}

const sign_msg = function (key = '', params = {}) {
    let str = [];
    for (let [key, val] of Object.entries(params)) {
        if (key === 'sign') continue;
        if (val === null || val === ''|| val === 'null') continue;
        str.push(key + '=' + val);
    }
    str.sort();
    str = str.join('&') + key;
    return crypto.createHash('md5').update(str.toLowerCase()).digest('hex');
}

const post_msg = async function (url = '', key = '', path = '', params = {}) {

	let sign = sign_msg(key, params);
	params.sign = sign;
	console.log(url+path, key, params);

	const opts = {
		method: 'POST',
		dataType: 'json',
		contentType: 'json',
		timeout: 5000,
		// headers: {'x-kaihei': 1},
		data: params,
	}
	return curl(url+path, opts);
}

module.exports = exports = async function (fn, role, data, other) {
	const game_id = role._tokeninfo.gameid || 0;
	if(!game_id || game_id == 0) return true;
	let app = await global.dao.channel.findOne({gameid:game_id});
	if(!app || !app.url) return true;
	role.h5postfn = post_msg.bind(null, app.url, app.appsecret);
	other.game_id = game_id;
	let ret = await exec[fn](role, data, other);
	console.log(ret);
	return ret
}