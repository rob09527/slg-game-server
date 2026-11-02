
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {chapterid, arrfriend} = ctx.request.body;
	const questtime = ctx.role.getItems(90264).count;
	ctx.assert(questtime < 2, 'no more');
	ctx.role.addItemsNoSave(90264);
	const c_config = global.gameconfig.fchapter.deepQueryOne('ID', parseInt(chapterid));
	ctx.assert(c_config, 'invalid chapterid');
	// chk record
	const cond = {rid: ctx.role._id, chapterid: c_config.ID};
	let record = await ctx.dao.fquest.findOne(cond);
	ctx.assert(!record, 'already start');
	// chk friends
	arrfriend = arrfriend || [];
	ctx.assert(arrfriend.length == 2, 'whereis friends');
	let insquad = await ctx.dao.fquest.find({rid: ctx.role._id}, {friends: 1, _id: 0});
	insquad = insquad.reduce(function (cur, nxt) {
		cur = cur.append(nxt.friends);
		return cur;
	}, [])
	let repeat = false;
	for (const frid of arrfriend) {
		repeat = insquad.includes(frid);
		if (repeat) break;
	}
	ctx.assert(!repeat, 'friend insquad');
	// chk power
	let power = ctx.role._power;
	for (const frid of arrfriend) {
		const role = await ctx.dao.role.findOne({_id: frid}, {_power: 1, friends: 1});
		if (!role) continue;
		if (!role.friends.includes(ctx.role.i())) continue;
		power += role._power;
	}
	ctx.assert(power >= c_config.POWER, 'power limit');
	record = new ctx.dao.fquest(cond);
	record.friends = arrfriend;
	await record.save();
	await ctx.role.save();
	ctx.body = {
		etime: Date.now() + c_config.MIN * 60 * 1000,
	}
}