
'use strict'

const _ = require('lodash');

function _fetchMarks() {
	const marks = {};
	for (let key of Object.keys(global.gameconfig.zhd)) {
		const config = global.gameconfig.zhd[key];
		if (Array.isArray(config) || !config.LOOPLIMIT) continue;
		config.KEY = key;
		marks[config.MARK] = config;
	}
	return marks;
}

async function chkStatusAndNotify(config) {
	let {
		NAME = '积分活动',
		MISSIONS,
		MARK: scoreMark,
		LOOPLIMIT,
	} = config;
	let looplimit = LOOPLIMIT[this.vip];
	let curScore = this.getProp(scoreMark);
	let cycleScore = _.last(MISSIONS).NUM;
	curScore = Math.min(curScore, looplimit * cycleScore);
	let currentloop = Infinity; // 当前正在进行的 loop 值
	MISSIONS.forEach(m => {currentloop =  Math.min(currentloop,  this.getProp(m.MARK))});
	currentloop = Math.min(currentloop, looplimit);
	// 已经完成
	if (currentloop === looplimit) return;

	let notifyCount = 0;
	for (let mission of MISSIONS) {
		let {
			MARK: rewardMark,
			NUM,
		} = mission;
		let markNum = this.getProp(rewardMark);
		if (markNum > currentloop || markNum >= looplimit){
			continue;
		}
		let thiscur = curScore - Math.min(currentloop, looplimit - 1) * cycleScore;
		thiscur = Math.min(thiscur, NUM);
		if (thiscur >= NUM ){
			notifyCount ++;
		}
	}
	if (notifyCount < 1) return;
	const type = config.KEY.toLowerCase();
	const TYPE = type.toUpperCase();
	if(global.config.ZHD[TYPE]){
		if(!Date.in(...global.config.ZHD[TYPE]) ){
			return;
		}
	}
 	pushClient(this, {type: "jchd", content: {[type]: notifyCount }});
}

let JFMARKS;
/**
 *
 * 积分类活动红点通知
 *
 * @author awko
 */
module.exports = function (items) {
	if (!JFMARKS) JFMARKS = _fetchMarks();
	items = items.arrange();
	for (let {GSID, COUNT} of items) {
		let config = JFMARKS[GSID];
		if(config) {
			let fn = chkStatusAndNotify.bind(this, config);
			// 异步执行
			Promise.resolve().then(fn).catch(console.error);
		}
	}
}
