
'use strict'

/* 元宝礼包购买 */
module.exports = exports = async (ctx, next) =>{

	ctx.assert(ctx.sppack , 'cant buy');
	const id = ctx.request.body.id;
	ctx.assert(id , 'invalid id');

	const one = ctx.sppack.packGift.deepQueryOne('id', id);
	ctx.assert(one , 'not found pack');
	ctx.assert(one.count > 0 , 'package empty');
	ctx.role.castItemsNoSave(one.castitems, {main: 'coinspack', sec: 'pack:'+id});
	ctx.role.addItemsNoSave( one.items, {main: 'bigbattle', sec: 'chapter'});
	const unlockPack = {}; // 已经解锁的礼包
	ctx.sppack.packGift.forEach(g => unlockPack[g.id] = 1);
	// 找出被该礼包触发解锁的礼包(忽略已经解锁的礼包
	const unlockPacklist = ctx.sppackConfig.filter(g => g.TRIGGER === id && unlockPack[g.id] !== 1);
	if (unlockPacklist.length > 0){
		unlockPacklist.forEach(item => {
			ctx.sppack.packGift.push({
				castitems: item.CAST,
				items: item.ITEMS,
				id: item.ID,
				count: item.LIMIT || 1,
				path: item.PATH
			})
		});
	}
	one.count--;
	ctx.sppack.packGift.sort((a,b)=>a.id - b.id);
	ctx.sppack.markModified('packGift');
	await ctx.role.save();
	await ctx.sppack.save();

	ctx.body = {
		castitems: one.castitems,
		items: one.items,
	};
}
