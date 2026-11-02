
'use strict'

const _ = require('lodash');
const commonsend = require('./../commonsend');

const rankfnlist = {
	tower: require('./lib/tower'),
	pvp: require('./lib/pvp'),
	legion: require('./lib/legion'),
	dungeon: require('./lib/dungeon'),
	main: require('./lib/main'),
	wei: require('./lib/campscore').bind(null, 'wei'),
	shu: require('./lib/campscore').bind(null, 'shu'),
	wu: require('./lib/campscore').bind(null, 'wu'),
	qun: require('./lib/campscore').bind(null, 'qun'),
	shen: require('./lib/campscore').bind(null, 'shen'),
	mo: require('./lib/campscore').bind(null, 'mo'),
}

module.exports = exports = async function (servers) {
	let __time = process.hrtime();
	let tmp = {};
	servers = servers.map(serv => serv.id);
	for (let servid of servers) {
		for (let [type, asyncfn] of Object.entries(rankfnlist)) {
			let time = process.hrtime();
			tmp[type] = tmp[type] || {};
			tmp[type] = await asyncfn();
			let [
				sec,
				nanosec,
			] = process.hrtime(time);
			let ms = sec * Math.pow(10, 3) + nanosec * Math.pow(10, -6);
			ms = Math.trunc(ms);
			console.log(`RANKREF TYPE ${type} COST ${ms} ms`);
		}
		if (global.config.DEV) continue;
		// 组队演武,向跨服服务请求排名数据
		let {data = {}} = await commonsend('/rank/pvpteam', {servid});
		tmp.pvpteam = data;
		// 王者演武段位,向跨服服务请求排名数据
		({data = {list: [], cache: []}} = await commonsend('/rank/pvpstage', {servid}));
		tmp.pvpstage = data;
		// 公平竞技场
		({
			data = {list: [], cache: []},
		} = await commonsend('/rank/pvpequal', {servid}));
		tmp.pvpequal = data;
		break;	// 只用查询第一个
	}
	global.rank_cache = tmp;
	// 通知子进程更新排行缓存
	if (global.msgcenter) {
		let msg = {
			type: 'cron.rankref',
			data: tmp,
		}
		global.msgcenter.send(msg).catch(console.error);
	}
	console.error('RANKREF DONE >> ', new Date(), process.hrtime(__time));
	return tmp;
}