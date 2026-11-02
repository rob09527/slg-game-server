'use strict'

const moment = require("moment");

/* 转换成配置里面的真实配置key第几周*/
module.exports = exports = function (key) {
	const days = moment(moment().format('YYYY-MM-DD')).diff(moment(this.create).format('YYYY-MM-DD'),'days') + 1;
	const week = Math.ceil(days / 7);
	return `${key}${week}`;
}
