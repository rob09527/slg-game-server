
'use strict'

module.exports = exports = async (ctx, next) =>{
	let items = [];
	const {DAILYPSEND, DAILYPRECE} = global.gameconfig.others.FRIEND;
	let available = DAILYPSEND - ctx.role.getItems(90263).count;
	const friends = new Set(ctx.role.friends);
	const send = {};
	for (const frid of friends){	//send
		if (available < 1) break;
		available--;
		const psend_cond = {rid: ctx.role._id, to: frid};
		let psend = await ctx.dao.fpoint.findOne(psend_cond);
		if (psend) continue;
		await global.services.FriendService.del("friend:"+frid);
		await global.services.FriendService.del("psendmap:"+frid);
		await global.services.FriendService.del("preceivemap:"+frid);
		await ctx.dao.fpoint.create(psend_cond);
		send[frid] = [{gsid: 38006, count: 5000}, {gsid: 90263, count: 1}];
		items.append(send[frid]);
	}
	
	available = DAILYPRECE - ctx.role.getItems(90308).count;
	let fpoints = await ctx.dao.fpoint.find({to: ctx.role._id, take: {$exists: false}}).limit(available);
	const rec = {};
	fpoints = fpoints.map(function (fpoint) {
		fpoint.take = Date.now();
		rec[fpoint.rid] = [{gsid: 30019, count: 1}];
		items.push(...rec[fpoint.rid] );
		return fpoint.save();
	})
	ctx.role.addItemsNoSave({gsid: 90308, count: fpoints.length});
	await Promise.all(fpoints);
	items = items.arrange();
	ctx.role.addItemsNoSave(items);
	await ctx.role.save();
	await global.services.FriendService.del("friend:"+ctx.role._id.toString());
	await global.services.FriendService.del("psendmap:"+ctx.role._id.toString());
	await global.services.FriendService.del("preceivemap:"+ctx.role._id.toString());
	ctx.body = {
		items,
		send,
		rec
	};
}
