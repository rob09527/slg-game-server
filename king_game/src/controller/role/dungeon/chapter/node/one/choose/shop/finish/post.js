
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.body = {};
	let {
		node,
		pos,
		buy,
	} = ctx.request.body;
	let {
		id,
		type,
	} = ctx.pos;
	// 神秘事件重新指定
	if (type == 5) ({id, type} = ctx.pos.event);
	if (buy) {
		let config = global.gameconfig.dgevent6[ctx.chapter.index];
		config = config.deepQueryOne('ID', id);
		ctx.assert(config, 'invalid e6id');
		let {
			ITEMS,
			CAST,
		} = config;
		ctx.role.castItemsNoSave(CAST, {main: 'dungeon', sec: 'shop'});
		ctx.role.addItemsNoSave(ITEMS, {main: 'dungeon', sec: 'shop'});
		ctx.body.item = ITEMS;
	}
	// 标记完成
	ctx.pos.finish = Date.now();
	ctx.chapter.markModified(['nodes', node, pos].join('.'));
	// 更新位置
	ctx.chapter.position = {
		node,
		pos
	}
	await ctx.role.save();
	await ctx.chapter.save();
}