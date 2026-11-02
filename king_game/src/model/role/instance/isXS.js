
'use strict'

const moment = require("moment");

/* 是否在新手周中 ,如果不传入key则只判断玩家是不是新手，如果传入key,那么则判断是不是新手周*/
module.exports = exports = function (key) {
	let start = moment(this.create).startOf('days').valueOf();
	let etime = start + global.gameconfig.others.NEW_ROLE_DAYS * 24 * 3600 * 1000;
	let ret = Date.now() < etime ? true : false;
	if(!key || !ret) return ret;
	if(!global.gameconfig.zhd_week_xs) return false;
	const days = moment(moment().format('YYYY-MM-DD')).diff(moment(this.create).format('YYYY-MM-DD'),'days') + 1;
	const week = Math.ceil(days / 7);
	return global.gameconfig.zhd_week_xs[week] && global.gameconfig.zhd_week_xs[week].includes(key.toUpperCase());
}
