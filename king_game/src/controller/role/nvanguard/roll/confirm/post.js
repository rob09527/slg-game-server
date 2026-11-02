/**
 * 确认获得武将
 */

'use strict'

module.exports = async ctx => {
	ctx.assert(ctx.record.generals.length === 10, 'preview first');
	const castitems = [{
		gsid: 30112,
		count: 1
	}, {
		gsid: 90616,
		count: ctx.role.getProp(90616)
	}]
	ctx.role.castItemsNoSave(castitems); // 无限招募令
	// 发放武将
	ctx.role.addItemsNoSave(ctx.record.generals);
	let newg = [...ctx.role.newg];
	await ctx.role.save();
	// 移除缓存
	let update = {
		$set: {
			confirm: Date.now(),
		},
		$unset: {
			generals: 1,
		},
	}
	await ctx.record.updateOne(update);
	ctx.body = {
		newg: newg.map(doc => {
			doc._role = ctx.role;
			return doc.base();
		}),
		castitems
	}
}
