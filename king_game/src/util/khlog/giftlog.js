"use strict"

const moment = require("moment");

// 推荐礼包、首充礼包、商船 日志埋点
module.exports = exports = function (type, role, ...others) {
	if(!role) return;
	let time = moment().format("YYYY-MM-DD HH:mm:ss");
	console.log([
		"GIFTLOG_".concat(type.toUpperCase()),
		role.servid,
		role.uid,
		role.i(),
		role.level,
		role.vip,
		...others,
		time
	].join(","));
}