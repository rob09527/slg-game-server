
'use strict'

module.exports = exports = async (ctx, next) =>{
	

	let treas = ctx.general.treasure;

	ctx.assert(treas, 'no treasure');
	// 非觉醒宝物增加包裹道具
	if (treas.length !== 24) {
		ctx.role.addItemsNoSave({gsid: treas, count: 1, unmark: 1});
	}else{
		// 觉醒宝物更新被穿戴武将标记
		await ctx.dao.awake_treasure.updateOne({_id: treas}, {$unset: {general: 1}});
	}
	
	ctx.general.treasure = null;
	ctx.general.markModified('treasure');
}