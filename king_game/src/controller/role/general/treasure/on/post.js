
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.hook.pre(EVENT_ENUM.GENER_TERA);
	let {
		treasure,
	} = ctx.request.body;

	let old_awake_treasure_guid;
	// 替换操作,先处理武将身上的宝物
	if (ctx.general.treasure) {
		
		if (ctx.general.treasure.length !== 24) {
			// 把非觉醒宝物放回包里
			ctx.role.addItemsNoSave({gsid: ctx.general.treasure, count: 1, unmark: 1});
		}else{
			// 标记需要移除武将标记的觉醒宝物
			old_awake_treasure_guid = ctx.general.treasure;
		}
	}
	if (treasure.length !== 24) {	// 非觉醒宝物
		let config = global.gameconfig.treasure[treasure];
		ctx.assert(config, 'invalid treas');
		ctx.role.castItemsNoSave({gsid: treasure, count: 1});
		ctx.general.treasure = parseInt(treasure);
	}else{	// 觉醒宝物
		let awake_treasure = await ctx.dao.awake_treasure.findOne({_id: treasure});
		ctx.assert(awake_treasure.rid === ctx.role.i(), 'invalid rid');
		ctx.general.treasure = awake_treasure._id.toString();
		ctx.general._awaketreasure = await awake_treasure.base();
		// 标记被穿戴
		await awake_treasure.updateOne({$set: {general: ctx.general._id}});
	}
	// 移除旧觉醒宝物的武将标记
	if (old_awake_treasure_guid) await ctx.dao.awake_treasure.updateOne({_id: old_awake_treasure_guid}, {$unset: {general: 1}});
}
