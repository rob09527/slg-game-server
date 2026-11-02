
'use strict'

const {curl} = require('urllib');
const h5post = require("./h5post")

// 微信屏蔽字检查
const get_wechat_token  = require('./wechat_token');

// scene 1 名字；2 聊天
function msg_sec_check(openid, scene, content) {
	const url = "https://api.weixin.qq.com/wxa/msg_sec_check?access_token="+global.config.WECHAT.token.access_token;
	const param = {
		content: content,
		version: 2,
		scene: scene,
		openid: openid
	}
	const opts = {
		method: 'POST',
		dataType: 'json',
		contentType: 'json',
		timeout: 5000,
		// headers: {'x-kaihei': 1},
		data: param,
	}

	return curl(url, opts);
}

async function wechat_check(openid, gameid, scene, content) {
	if(!openid) return true;
	global.config.WECHAT = global.config.WECHAT || {};
	let now = Date.now();
	if (!global.config.WECHAT.token || now >= global.config.WECHAT.token.expires_time){
		let ret = await get_wechat_token(gameid);
		if(ret && ret.status == 200 && ret.data.token){
			global.config.WECHAT.token = ret.data.token;
		}
		else{
			console.error("wechat token not get");
			return false;
		}
		console.log("get_wechat_token1", global.config.WECHAT.token)
	}
	let resp = await msg_sec_check(openid, scene, content);
	let ok = resp.data.errcode == 0 && resp.data.result.label == 100;
	if(!ok) {
		console.error("wechat check:",resp);
		resp.data.errcode = 40001
		if(resp.data.errcode == 40001){ // invalid credential, access_token is invalid or not latest
			// 重新获取一次token,再次验证
			let ret = await get_wechat_token(gameid, global.config.WECHAT.token.access_token);
			if(ret && ret.status == 200 && ret.data.token){
				global.config.WECHAT.token = ret.data.token;
			}
			else{
				console.error("wechat token not get");
				return false;
			}
			console.log("get_wechat_token2", global.config.WECHAT.token)
			resp = await msg_sec_check(openid, scene, content);
			ok = resp.data.errcode == 0 && resp.data.result.label == 100;
		}
	}
	return ok
}

// h5屏蔽字检查
async function h5_check(role, content) {
	let ret = await h5post("contentpost", role, {channel: role._tokeninfo.sdkInfo.channel, msg: content}, {wordcheck: role._tokeninfo.sdkInfo.wordcheck});
	return ret == true || (ret && ret.status == 200 && ret.data.data.check_result == 'ok')
}

module.exports = exports = async function (role, scene, content) {
	let info = role._tokeninfo;
	// console.log("chkcontent", info)
	if(info.platform == "wechatgame"){
		return wechat_check(info.sdkInfo.openid, info.gameid, scene, content)
	}
	else if(info.platform == "h5"){
		return h5_check(role, content)
	}
	return true;
}