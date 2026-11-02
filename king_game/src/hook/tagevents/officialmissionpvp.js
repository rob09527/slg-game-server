/**
 * 悬赏任务,个人最高演武积分
 */

'use strict'

module.exports = {
	tags: {
		pvpscore: 1,
		38004: 1,
	},
	async onChange (gsid, change, count) {
		// 处理 官职任务项包含 个人演武积分的逻辑处理
		const officialLevel = this.role.getProp(38004);
		let hasTag = false;
		for (let i = 0; i < 4; i++) {
			const execConfig = global.execrules[`official_${officialLevel+1}_${i}`];
			if (!execConfig) continue;
			let c = execConfig.REQUIRE.find(_ => _.GSID === 90530); // 如果有条件需要 90530 标记进行标记发放
			if (c){
				hasTag = !!c;
				break;
			}
		}
		const pvpscore = this.role.getProp('pvpscore');
		if (hasTag && pvpscore > this.role.getProp(90530)){ // 进行把演武积分赋值为标记
			await this.dao.role.updateOne({_id: this.role._id}, {
				$set: {
					'others.90530.count': pvpscore
				}
			})
		}
	}
}