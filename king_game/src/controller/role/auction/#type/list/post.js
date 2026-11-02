
'use strict'

require('rx-apiwheel');

/**
 *	拍品列表
 * @type {exports}
 */
module.exports = exports = async ctx => {
	const groupid = ctx.role._gameserv.groupid;
	const TYPE = ctx.params.type.toUpperCase(); // ALL | LEGION
	const auctioneer = TYPE === 'LEGION' ? `legion_${ctx.role.legion}` : ctx.params.type;
	const EXT_TIME = global.gameconfig.auction[TYPE].EXT_TIME * 1000
	// 延长一小时展示
	const items = await ctx.dao.auction.find({groupid, auctioneer, expireAt: {$gt : Date.now() - EXT_TIME}}).sort({_id: -1});

	const bonus  = await ctx.dao.auction.calBonus(items, ctx.role.i())
	delete bonus.bonusRoles;
	const owner = ctx.role.i();
	ctx.body = {
		auctions: items.map(item => {
			item = item.base(owner);
			return item;
		}),
		bonus
	}
    const bossList = await ctx.dao.north.find({groupid }).sort({mapid: -1}).limit(1)
    let curlevel = bossList[0] ? bossList[0].mapid : 0;
	ctx.body.curlevel = curlevel;
}
