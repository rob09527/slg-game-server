'use strict'

const moment = require("moment");

/* 转换成配置里面的真实配置key第几周*/
module.exports = exports = function (key) {
	const days = moment(moment().format('YYYY-MM-DD')).diff(moment(this.create).format('YYYY-MM-DD'),'days') + 1;
	const week = Math.ceil(days / 7);
	let lastWeek = week - 1;
	let xs_key = `${key}${lastWeek}`;
	if(!global.gameconfig.zhd_week_xs ) return 	"week"+lastWeek;;
	let lastweek_zhd_xs = [];
	if( global.gameconfig.zhd_week_xs[lastWeek]){
		lastweek_zhd_xs = global.gameconfig.zhd_week_xs[lastWeek];
	};
	if(lastweek_zhd_xs && lastweek_zhd_xs.includes(key.toLocaleUpperCase())){
		return xs_key;
	}
	return 	"week"+lastWeek;
}
