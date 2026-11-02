'use strict'

const {curl} = require('urllib');
const crypto = require('crypto');

const wechat_info = {
	appid:"YOUR_WECHAT_APPID",
	secret:"YOUR_WECHAT_SECRET"
}

// function post_msg() {
// 	const opts = {
// 		method: 'GET',
// 		dataType: 'json',
// 		contentType: 'json',
// 		timeout: 5000,
// 		data: {},
// 	}
// 	const url = "https://api.weixin.qq.com/cgi-bin/token";
// 	let query = '';
// 	query += "?grant_type=client_credential";
// 	query += "&appid="+wechat_info.appid;
// 	query += "&secret="+wechat_info.secret;

// 	return curl(url+query, opts);
// }

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

function post_msg(game_id, key) {
	const url = "https://sdk-server-songwogz.yihao.com/api/wx/token";
	let params = {
		appid: wechat_info.appid,
		appsecret: wechat_info.secret,
		game_id
	}
	let sign = sign_msg(key, params);
	params.sign = sign;
	console.log(url, key, params);

	const opts = {
		method: 'POST',
		dataType: 'json',
		contentType: 'json',
		timeout: 5000,
		// headers: {'x-kaihei': 1},
		data: params,
	}
	return curl(url, opts);
}

async function get_token(game_id, key) {
	const resp = await post_msg(game_id, key)
	console.log("wechat resp:", resp);
	// if(resp.data.errcode){
	// 	console.error("wechat token:",resp);
	// 	return;
	// }
	// return resp.data;
	if(resp.data.code){
		console.error("wechat resp:",resp);
		return;
	}
	return resp.data.data;
}

module.exports = exports = async function (ctx, next) {
	let {
		game_id,
        access_token,
    } = ctx.request.body;
    ctx.body = {};
    let now = Date.now();
    if (!global.WECHAT.token || now >= global.WECHAT.token.expires_time || access_token == global.WECHAT.token.access_token){
		if(!global.WECHAT.key){
			// let d = await ctx.dao.channel.findOne({gameid:game_id});
			let d = global.CACHE.channel[game_id];
			global.WECHAT.key = d.appsecret
		}
        const resp = await get_token(game_id, global.WECHAT.key);
		if(!resp) return;
        global.WECHAT.token = {
			access_token: resp.token || resp.access_token
		}
		if(resp.expires_time){
			global.WECHAT.token.expires_time = resp.expires_time * 1000 - 1000;
		}
		else{
			global.WECHAT.token.expires_time = resp.expires_in * 1000 + now - 1000;
		}
        console.log("wechat token:", global.WECHAT.token);
    }
    ctx.body.token = global.WECHAT.token;
}
