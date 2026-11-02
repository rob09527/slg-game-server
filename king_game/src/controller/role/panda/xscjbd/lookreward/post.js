'use strict'



// 新手抽将-抽将榜单
module.exports = exports = async function (ctx, next) {
	let reward = [];
	for (let info of ctx.config.REWARD) {
		reward.push({MIN:info.MIN, MAX:info.MAX, SCORE:info.SCORE, REWARDS:info.REWARD})
	}
	ctx.body = {
		reward
	};
}
	