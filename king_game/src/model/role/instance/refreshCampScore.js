
/*
 * 阵容积分刷新
 * 根据星级计算每个阵容的总积分
*/

'use strict'

// 星级对应积分(>=4星)
const STAR_SCORE = [
	5,
	15,
	50,
	100,
	200,
	500,
	1000,
	1500,
	2500,
	5000,
	6000,
	10000,
]

// 阵营序号对应字段
const CAMP_INDEX = [
	null,
	'wei',
	'shu',
	'wu',
	'qun',
	'shen',
	'mo',
]

module.exports = exports = async function () {
	let gsidlist = await this.db.models.general.find({rid: this._id}, {gsid: 1}).hint({rid:1});
	let score_record = {};
	for (let {gsid} of gsidlist) {
		let config = global.gameconfig.general[gsid];
		if (!config) continue;
		let key = CAMP_INDEX[config.CAMP];
		if (!key) continue;
		if (config.STAR < 4) continue;
		score_record[key] = score_record[key] || 0;
		score_record[key] += STAR_SCORE[config.STAR - 4];
	}
	let campscore = this.campscore;
	for (let i = 1; i < CAMP_INDEX.length; i++) {
		let key = CAMP_INDEX[i];
		// 分数变化时更新
		let val = score_record[key] || 0;
		if (val !== campscore[key].num) {
			campscore[key].num = val;
			campscore[key].update = Date.now();
		}
	}
	await this.updateOne({$set: {campscore}});

	//  把rankmission里面的数据转换为groupid
	// 成就任务检查
	for (let camp of CAMP_INDEX) {
		if (!camp) continue;
		this.db.models.rankmission.notify(camp, campscore[camp].num, this.i(), this._gameserv.groupid).catch(console.error);
	}
	// 刷新排行榜
	for (let [camp, {num}] of Object.entries(campscore)) {
		if (camp.startsWith('$')) continue;	// 跳过mongoose内建字段
		let rankService = new global.services.RankService(camp, this._gameserv.groupid);
		await rankService.set({
			id: this.i(),
			score: +num || 0,
		})
	}
}
