
'use strict'

const assert = require('assert');

const textgetter = function (text, ...vals) {
	vals = vals.map(obj => {
		obj = obj || '';
		return obj.toString();
	})
	for (let i = 0; ; i++) {
		let regex = /\$\{\}/;
		let info = text.match(regex);
		if (!info) break;
		text = text.replace(regex, vals[i] || '');
	}
	return text;
}

const sendMsg = function (role, config, msg) {
	let data = {};
	data.from = {};
	data.room = `bullet_` + role._gameserv.groupid;
	data.level = config.LEVEL;
	data.page = config.PAGE;
	data.message = msg;
	data.time = Date.now();
	global.socketRedis.publish(global.socketRedis.CHAT_CHANNEL, data);
}

const _startCheck = function (configs, role, star, gsid) {
	for (const config of configs) {
		if (star >= config.COND[0]) {
			let msg = textgetter(config.INFO, role.name, `[${gsid}]`);
			sendMsg(role, config, msg);
			return;
		}
	}
}

const _itemCheck = function (configs, role, items) {
	for (const config of configs) {
		let gsid = 0;
		let pos = items.findIndex(item => {
			gsid = item.gsid || item.GSID
			return config.COND.indexOf(gsid) >= 0;
		})
		if (pos >= 0) {
			let msg = textgetter(config.INFO, role.name, `[${gsid}]`);
			sendMsg(role, config, msg);
			return;
		}
	}
}

const _itemSend = function (configs, role, gsid) {
	const config = configs[0];
	if (config) {
		let msg = textgetter(config.INFO, role.name, `[${gsid}]`);
		sendMsg(role, config, msg);
	}
}

const BULLETSCREEN_FN = {
	'GJXB_BIG': _itemSend.bind(null),
	'RECRUIT': _startCheck.bind(null),
	'GEN_LVL': _startCheck.bind(null),
	'SPIN': _itemCheck.bind(null),
	'SUMMON': _itemCheck.bind(null),
	'SMZM': _itemCheck.bind(null),
	'TOWER': function (configs, role, tower) {
		for (const config of configs) {
			if (tower % config.COND[0] == 0) {
				let msg = textgetter(config.INFO, role.name, tower);
				sendMsg(role, config, msg);
				return;
			}
		}
	},
	'TIANLAO': function (configs, role, targetRole, gsid) {
		for (const config of configs) {
			let msg = textgetter(config.INFO, role.servid, role.name, targetRole.servid, targetRole.name, gsid);
			sendMsg(role, config, msg);
			return;
		}
	},
}

module.exports = exports = function (key, argv0, argv1, argv2) {
	const fn = BULLETSCREEN_FN[key];
	assert(fn, 'invalid bullet screen');
	const config = global.gameconfig.bulletscreen[key];
	assert(config, 'config bullet screen');
	fn.call(null, config, this, argv0, argv1, argv2);
	return this;
}
