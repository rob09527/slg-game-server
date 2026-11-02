
'use strict'

const assert = require('assert');
const battlecal = require('./../common/bcal_scf');

/** 是否有存活的队伍
 * @param  {Array<Object>} bslist 战斗队伍列表
 * @return {Object}
 */
function find_alive_team(bslist) {
	return bslist.find(({team}) =>{
		let alive_general = Object.values(team).find(general => general.hppercent > 0);
		return !!alive_general;
	})
}
/** 初始化队伍血量
 * @param  {Object} 角色战斗队伍
 */
function init_hppercent({team}) {
	for (let general of Object.values(team)) {
		general.hppercent = 10000;
	}
}

module.exports = async function() {
	assert(!this.finish, 'already finish');
	let seedlist = this.seedList();
	let player = this.player;
	let target = this.enemy;
	let win;
	let video_version;
	let videolist = [];
	// 初始化血量
	player.bslist.forEach(init_hppercent);
	target.bslist.forEach(init_hppercent);
	while(true) {
		// 检查双方是否还有队伍存活
		let player_set = find_alive_team(player.bslist);
		let target_set = find_alive_team(target.bslist);
		if (!player_set) {
			win = false;
			break;
		}
		if (!target_set) {
			win = true;
			break;
		}
		let seed = seedlist.shift();
		//  战斗计算
		let args = [
			this.type,
			seed,
			player_set,
			target_set,
			this.season,
			this.lcards,
			this.rcards
		]
		let {
			// 结果
			ret,
			// 双方各战斗单位剩余血量万分比
			lper,

			rper,
			// 双方总剩余血量万分比
			ltper,
			rtper,
		
			// 战斗报告
			report,
			// 战斗逻辑版本
			version,
			// 步数
			round,
		} = await battlecal.call(null, ...args);
		// 再根据剩余血量百分比判断胜负
		ret = ltper > rtper? 'win' : 'lose';
		// 记录录像版本
		if (!video_version) video_version = version;
		// 整理单场录像
		let left = {
			info: {
				rname: player.rname,
				level: player.level,
				iconid: player.iconid,
				headid:player.headid,
				frameid:player.frameid
			},
			'set': player_set,
		}
		let right = {
			info: {
				rname: target.rname,
				level: target.level,
				iconid: target.iconid,
				headid:target.headid,
				frameid:target.frameid
			},
			'set': target_set,
		}
		let video = {
			id: 'fake_video_id',
			result: ret,
			report,
			seed,
			season: this.season,
			round,
			lcards:this.lcards,
			rcards:this.rcards,
			left,
			right,
			lper, rper,
			ltper, rtper,
		}
		videolist.push(JSON.stringify(video))
		// 整理血量
		for (let [pos, hppercent] of Object.entries(lper)) {
			hppercent = ret === 'win'? hppercent: 0;
			player_set.team[pos].hppercent = hppercent;
		}
		for (let [pos, hppercent] of Object.entries(rper)) {
			hppercent = ret === 'win'? 0: hppercent;
			target_set.team[pos].hppercent = hppercent;
		}
	}
	win = win? 'win': 'lose';
	videolist = videolist.map(video => JSON.parse(video));
	this.result = {ret: win};
	this.finish = Date.now();
	await this.save();
	return {
		win,
		videolist,
		version: video_version,
	};
}