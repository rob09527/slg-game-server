
// 成长基金回收接口

'use strict'

const _select = {
	rname: 1,
	rno: 1,
	'hide.38005': 1,
}

module.exports = exports = async function (ctx, next) {
		let {
			uidlist,
		} = ctx.request.body;
		let resp = [];
		for (let {uid, amount} of uidlist) {
			let role = await ctx.dao.role.findOne({uid}, _select);
			if (!role) continue;
			let cur_amount = role.getProp(38005);
			let cost_amount = Math.min(amount, cur_amount);
			let _cost = -(cost_amount*2);
			let udp = {
				$inc: {
					'hide.38005.count': _cost,
				}
			}
			if (cost_amount > 0) {
				await ctx.dao.role.updateOne({uid}, udp);
			}
			let ret = [
				uid,	// 角色UID
				role.name, // 角色名字
				amount, // 应扣
				cur_amount, // 实际拥有
				cost_amount, // 被扣除
			]
			resp.push(ret.join(','))
		}
		ctx.body = resp;
}