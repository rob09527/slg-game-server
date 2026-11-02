
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		chapter: chapter_index,
	} = ctx.request.body;
	let config = global.gameconfig.dgchapter[chapter_index];
	ctx.assert(config, 'invalid chapter');
	// 查找关卡
	ctx.chapter = await ctx.dao.c_dgchapter.findOne({rid: ctx.role._id, index: chapter_index});
	ctx.assert(ctx.chapter, 'chapter nstart');
	// 检查是否结束
	ctx.assert(ctx.chapter.finish, 'chapter nfinish');
	// 已经领取的抛出
	ctx.assert(!ctx.chapter.complete,'chapter has get items');
	
	ctx.chapter.complete = Date.now();
	await ctx.chapter.save();
	// 奖励发放
	let reward = config.ITEMS.map(info =>{
		let {
			GSID,
			COUNT: [
				MIN,
				MAX
			]
		} = info
		return {
			GSID,
			COUNT: ctx.random.between(MIN, MAX),
		}
	})
	ctx.role.addItemsNoSave(reward, {main: 'dungeon', sec: 'chapterreward'});
	await ctx.role.save();
	ctx.body = {
		reward,
	}
}