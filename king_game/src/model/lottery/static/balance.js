
'use strict'

const LOTTERY = global.gameconfig.others.TOPKINGPVP.LOTTERY;
const assert = require('assert');
const textgetter = require('../../../util/textgetter');

/**
 *
 * @param roleinfo {{uid: string, servid: number}}
 * @param bingo
 * @param amount
 * @return {Promise<void>}
 */
const lottery_pay = async function (roleinfo,bingo,amount = 0 ) {
 	const role = await global.dao.role.findOne({uid: roleinfo.uid, servid: +roleinfo.servid}, {'hide.38001': 1, uid: 1, servid: 1});
	assert(role, 'role err');
	const body = {};
	let mail = {
		rid: role._id,
		title: bingo? textgetter(`TOPKINGPVP_BINGOT`): textgetter(`TOPKINGPVP_NOBINGOT`),
		content: bingo? textgetter(`TOPKINGPVP_BINGOC`): textgetter(`TOPKINGPVP_NOBINGOC`),
	}
	if (bingo) {
		mail.type = 2;
		let pay;
		if (amount) {
			// 返还两倍
			pay = Math.floor(amount * 2)
		}else {
			pay = Math.floor((LOTTERY.BASE + (role.level * LOTTERY.RATE)) * 2);
		}
		body.pay = pay;
		mail.reward = [
			{gsid: 38006, count: pay}
		]
	}
	console.error('LOTTERY DO BALANCE', bingo, role.servid, role.uid);
	await global.dao.mail.create(mail);
	return body;
}

module.exports = async function (battlemark, _battle) {
	console.log(_battle);
	// 获取场次战斗结果
	let battle = await this.db.models.lotterybattle.findOne({battlemark});
	if (!battle) return;
	assert(battle.result, 'result nexist');
	let result = battle.result;
	let cond = {
		battlemark,
		expire: {$exists: 0},
	}
	let lotterylist = await this.find(cond);
	for (let _lottery of lotterylist) {
		// 更新竞猜单
		let $set = {
			expire: Date.now(),
		}
		if (_lottery.bettime) {
			// 判断猜中
			let bingo = (result.result === 'win') === _lottery.iswin;
			let {pay = 0} = await lottery_pay({servid: _lottery.servid, uid:  _lottery.uid}, bingo,_lottery.amount );
			console.error('LOTTERY DO BALANCE', _lottery.servid, _lottery.uid, bingo, _lottery.iswin, result.result);
			if (bingo) $set.repay = pay;
		}
		await _lottery.updateOne({$set});
	}
}
