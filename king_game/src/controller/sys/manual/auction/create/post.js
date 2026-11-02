
// 创建拍卖品，供测试使用

'use strict'

module.exports = exports = async function (ctx, next) {
		let {
			start,
			etime,
			auctioneer,
			type,
			rids,
			...opt
		} = ctx.request.body;

	start = start && new Date(start).getTime();
	etime = etime && new Date(etime).getTime();
	const [tp, id] = auctioneer.split('_'); // 根据规则，取出拍卖类型 LEGION 则为军团拍卖 ALL 为全服拍卖
	const TYPE = tp.toUpperCase();
	// 把之前的拍卖强行过期掉,避免冲突 , 去掉该逻辑，该逻辑是方便测试测军团拍卖保留，线上军团拍卖不会连续创建
	await ctx.dao.auction.updateMany({
	    auctioneer,
	    expireAt: {$gt: start - global.gameconfig.auction[TYPE].EXT_TIME * 1000}
	}, {
	    $set: {
	        expireAt: Date.now() - global.gameconfig.auction[TYPE].EXT_TIME * 1000,
	        start: Date.now() - global.gameconfig.auction[TYPE].EXT_TIME * 1000 - 3600 * 1000
	    }
	})
	await ctx.dao.auction.createAuction(auctioneer, {type: type === 'win' ? 'WIN':'LOSE', start, etime, bounceList: rids, ...opt})
		.catch(console.error.bind('', 'CREATE AUCTION ERROR'));
	ctx.body = {
		message: 'ok'
	}
}
