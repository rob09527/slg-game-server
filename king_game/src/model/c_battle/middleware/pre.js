
'use strict'

const util = './../../../util/'

const tg = require(util + 'textgetter');
const bs = require(util + 'battleseason');

module.exports = exports = {
	save: async function (next) {
		if(!this.isNew) return;
		if (this.season.left <= 1) {
			let player = await this.db.models.role.findOne({_id: this.rid}, {'hide.38001': 1});
			if (player) this.season.left = player.level;
		}
		let {season, pos} = bs();
		this.season.season = season;
		this.season.pos = pos;
		// 获取我方的珍宝技能
		const depot = await this.db.models.zbdepot.getOne({rid: this.rid});
		if (depot) {
			const {
				zblist,
			} = await depot.getZhenbaoAll();
			for(let zhenbao of zblist) {
				const {
					skill,
				} = zhenbao.info();
				if (skill) this.lcards.push({id: skill});
			}
		}
	}
}