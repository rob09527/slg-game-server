
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		chapter: chapter_index,
		node: node_index,
	} = ctx.request.body;
	let chapter = await ctx.dao.c_dgchapter.findOne({rid: ctx.role._id, index: chapter_index});
	ctx.assert(chapter, 'invalid chapter');
	let node = chapter.nodes[node_index];
	ctx.assert(node, 'invalid node');
	let {id, type} = node[0];
	ctx.assert(type == 6, 'invalid event');
	let config = global.gameconfig.dgevent6[chapter_index].deepQueryOne('ID', id);
	ctx.assert(config, 'invalid eventid');
	ctx.role.castItemsNoSave(config.CAST);
	ctx.role.addItemsNoSave(config.ITEMS, {main: 'dungeon', sec: 'shop'});
	node[0].finish = Date.now();
	chapter.markModified('nodes.'+node_index+'.0');
	await ctx.role.save();
	await chapter.save();
	ctx.body = {
		item: config.ITEMS,
	}
}
